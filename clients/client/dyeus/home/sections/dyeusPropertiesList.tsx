import {useEffect, useMemo, useRef, useState} from "react";
import {LayoutGrid, List, X} from "lucide-react";
import {cn} from "@coreModule/components/lib/utils.ts";
import PolygonSelector from "@coreModule/components/custom/polygonSelector.tsx";
import {flattenCatalogUnits} from "@propertyManagementModule/clients/client/public/project/shared/flattenCatalogUnits.ts";
import {
    PROJECT_UNIT_STATUS_FILTERS,
    type ProjectUnitStatusFilter,
} from "@propertyManagementModule/clients/client/public/project/shared/useProjectUnitStatusFilter.ts";
import {resolveMarketingMediaUrl} from "@propertyManagementModule/clients/client/public/shared/resolveMarketingMedia.ts";
import {dyeusAssets} from "@propertyManagementModule/clients/client/dyeus/shared/dyeusAssets.ts";
import {useDyeusT} from "@propertyManagementModule/clients/client/dyeus/shared/useDyeusT.ts";
import type {
    MarketingFloorListItem,
    MarketingPolygonItem,
    MarketingProjectSingle,
    MarketingUnitStatus,
} from "@propertyManagementModule/clients/client/public/shared/publicTypes.ts";
import type {PropertyListingCardUnit} from "@propertyManagementModule/clients/client/public/project/shared/propertyListingCard.tsx";

const HOME_LANGUAGE_PATH =
    "src/modules/propertyManagement/clients/client/dyeus/home/index.tsx";

type DyeusPropertiesListProps = {
    project: MarketingProjectSingle;
    floorId?: string;
    edificeId?: string;
    floors: MarketingFloorListItem[];
    onClose?: () => void;
    hoveredUnitId?: string | null;
    selectedUnitId?: string | null;
    onUnitHover?: (unitId: string | null) => void;
    onUnitSelect?: (unitId: string) => void;
    panelTitle?: string;
    className?: string;
};

type StatusColoredPolygon = MarketingPolygonItem & {fill: string; stroke: string};
type PanelLayout = "list" | "grid";

const FILTER_KEYS: Record<ProjectUnitStatusFilter, string> = {
    available: "filterAvailable",
    sold: "filterSold",
    reserved: "filterReserved",
    all: "filterAll",
};

const UNIT_STATUS_POLYGON_COLORS: Record<MarketingUnitStatus, {fill: string; stroke: string}> = {
    available: {fill: "rgba(31, 190, 106, 0.5)", stroke: "rgba(31, 190, 106, 0.9)"},
    reserved: {fill: "rgba(234, 179, 8, 0.5)", stroke: "rgba(234, 179, 8, 0.9)"},
    sold: {fill: "rgba(220, 38, 38, 0.5)", stroke: "rgba(220, 38, 38, 0.9)"},
};

const STATUS_BADGE: Record<MarketingUnitStatus, {wrap: string; dot: string}> = {
    available: {wrap: "bg-[rgba(18,183,106,0.12)] text-[#12b76a]", dot: "bg-[#12b76a]"},
    reserved: {wrap: "bg-amber-700/10 text-amber-800", dot: "bg-amber-700"},
    sold: {wrap: "bg-dyeus-ink/10 text-dyeus-ink-muted", dot: "bg-dyeus-ink/50"},
};

const UNIT_GRID =
    "grid grid-cols-[minmax(0,1.1fr)_repeat(3,minmax(0,0.7fr))_minmax(0,1.1fr)] gap-x-3";

function resolveUnitIdFromPolygon(
    units: PropertyListingCardUnit[],
    item: Pick<MarketingPolygonItem, "_id" | "name">,
): string {
    return (
        units.find((unit) => unit._id === item._id)?._id ??
        units.find((unit) => unit.name === item.name)?._id ??
        item._id
    );
}

function DyeusPropertiesList({
    project,
    floorId = "",
    edificeId = "",
    floors,
    onClose,
    hoveredUnitId = null,
    selectedUnitId = null,
    onUnitHover,
    onUnitSelect,
    panelTitle,
    className,
}: DyeusPropertiesListProps) {
    const {t} = useDyeusT(HOME_LANGUAGE_PATH);
    const [activeFilter, setActiveFilter] = useState<ProjectUnitStatusFilter>("all");
    const [layout, setLayout] = useState<PanelLayout>("list");
    const listScrollerRef = useRef<HTMLDivElement>(null);
    const listHeaderRef = useRef<HTMLDivElement>(null);
    const rowRefs = useRef(new Map<string, HTMLElement>());
    const selectedFloor = floors.find((floor) => floor._id === floorId);

    const units = useMemo(() => {
        return flattenCatalogUnits(project).filter((unit) => {
            if (floorId && unit.floorId !== floorId) return false;
            if (!floorId && edificeId && unit.edificeId !== edificeId) return false;
            return true;
        });
    }, [project, floorId, edificeId]);

    const filtered =
        activeFilter === "all" ? units : units.filter((unit) => unit.status === activeFilter);

    const floorPlanImage = resolveMarketingMediaUrl(selectedFloor?.mainImage);
    const unitPolygons: StatusColoredPolygon[] = useMemo(() => {
        const statusById = new Map(units.map((unit) => [unit._id, unit.status as MarketingUnitStatus]));
        const allowedIds = activeFilter === "all" ? null : new Set(filtered.map((unit) => unit._id));
        return (selectedFloor?.unitsCoordinates ?? [])
            .filter((polygon) => !allowedIds || allowedIds.has(polygon._id))
            .map((polygon) => {
                const status = statusById.get(polygon._id) ?? "available";
                const colors = UNIT_STATUS_POLYGON_COLORS[status] ?? UNIT_STATUS_POLYGON_COLORS.available;
                return {...polygon, ...colors};
            });
    }, [selectedFloor?.unitsCoordinates, units, filtered, activeFilter]);

    const highlightUnitId = useMemo(() => {
        const candidateId = hoveredUnitId || selectedUnitId;
        if (!candidateId) return null;
        if (filtered.some((unit) => unit._id === candidateId)) return candidateId;
        const polygon = selectedFloor?.unitsCoordinates?.find((item) => item._id === candidateId);
        return polygon ? (filtered.find((unit) => unit.name === polygon.name)?._id ?? null) : null;
    }, [hoveredUnitId, selectedUnitId, filtered, selectedFloor?.unitsCoordinates]);

    const selectUnit = (unitId: string) => {
        onUnitSelect?.(unitId);
    };

    useEffect(() => {
        if (!highlightUnitId) return;
        const scroller = listScrollerRef.current;
        const row = rowRefs.current.get(highlightUnitId);
        if (!scroller || !row || scroller.clientHeight <= 0) return;

        const headerHeight = listHeaderRef.current?.offsetHeight ?? 0;
        const rowTop = row.getBoundingClientRect().top - scroller.getBoundingClientRect().top + scroller.scrollTop;
        const rowBottom = rowTop + row.offsetHeight;
        const viewStart = scroller.scrollTop + headerHeight;
        const viewEnd = scroller.scrollTop + scroller.clientHeight;
        if (rowTop >= viewStart && rowBottom <= viewEnd) return;

        const nextTop = rowTop < viewStart ? rowTop - headerHeight : rowBottom - scroller.clientHeight;
        scroller.scrollTo({top: Math.max(0, nextTop), behavior: "smooth"});
    }, [highlightUnitId]);

    const bindRowRef = (unitId: string) => (node: HTMLElement | null) => {
        if (node) {
            rowRefs.current.set(unitId, node);
        } else {
            rowRefs.current.delete(unitId);
        }
    };

    return (
        <aside
            className={cn(
                "flex h-full min-h-0 w-full max-h-full flex-col overflow-hidden bg-dyeus-cream text-dyeus-ink",
                className,
            )}
            data-node-id="287:770"
        >
            <div className="flex shrink-0 items-start justify-between gap-3 px-5 pt-5 md:px-6 md:pt-6">
                <h2 className="min-w-0 flex-1 wrap-break-word font-dyeus-serif text-[clamp(1.75rem,3vw,2.5rem)] font-bold leading-none">
                    {panelTitle || t("residencesTitle")}
                </h2>
                {onClose ? (
                    <button
                        type="button"
                        onClick={onClose}
                        className="cursor-pointer pt-1 text-dyeus-ink transition hover:text-dyeus-bronze"
                        aria-label={t("closeResidencesPanel")}
                    >
                        <X className="size-3.5" strokeWidth={1.5} />
                    </button>
                ) : null}
            </div>

            <div className="flex shrink-0 items-center gap-2 px-5 pb-4 pt-4 md:px-6">
                <div className="flex min-w-0 flex-1 flex-wrap gap-2">
                    {PROJECT_UNIT_STATUS_FILTERS.map((filter) => {
                        const active = activeFilter === filter;
                        return (
                            <button
                                key={filter}
                                type="button"
                                onClick={() => setActiveFilter(filter)}
                                className={cn(
                                    "cursor-pointer rounded-[4px] border px-3 py-1.5 font-dyeus-sans text-sm transition",
                                    active
                                        ? "border-dyeus-bronze bg-dyeus-bronze text-dyeus-cream"
                                        : "border-dyeus-border bg-transparent text-dyeus-ink hover:border-dyeus-bronze hover:text-dyeus-bronze",
                                )}
                            >
                                {t(FILTER_KEYS[filter])}
                            </button>
                        );
                    })}
                </div>
                <button
                    type="button"
                    onClick={() => setLayout(layout === "list" ? "grid" : "list")}
                    className="flex size-9 shrink-0 cursor-pointer items-center justify-center border border-dyeus-border text-dyeus-ink transition hover:border-dyeus-bronze hover:text-dyeus-bronze"
                    aria-label={t(layout === "list" ? "viewAsGrid" : "viewAsList")}
                >
                    {layout === "list" ? (
                        <LayoutGrid className="size-4" strokeWidth={1.75} aria-hidden />
                    ) : (
                        <List className="size-4" strokeWidth={1.75} aria-hidden />
                    )}
                </button>
            </div>

            {layout === "list" ? (
                <div className="relative mx-5 shrink-0 overflow-hidden bg-dyeus-sand md:mx-6 [&_[data-slot=card]]:pointer-events-auto">
                    <div className="relative aspect-[470/272] w-full [&_[data-slot=card]]:border-0 [&_[data-slot=card]]:bg-transparent [&_[data-slot=card]]:p-0 [&_[data-slot=card]]:shadow-none [&_[data-slot=card]]:ring-0">
                        {floorPlanImage && unitPolygons.length > 0 ? (
                            <div className="absolute inset-0">
                                <PolygonSelector
                                    key={`${selectedFloor?._id ?? floorId}:${activeFilter}`}
                                    fillHeight
                                    dashboard
                                    borderless
                                    disabled
                                    hideControls
                                    objectFit="contain"
                                    phantomsAlwaysVisible
                                    imageUrl={floorPlanImage}
                                    phantomPoints={unitPolygons}
                                    onFloorClick={(item) => selectUnit(resolveUnitIdFromPolygon(units, item))}
                                    stayHovered={selectedUnitId || hoveredUnitId || undefined}
                                    externalHoveredId={hoveredUnitId || selectedUnitId || ""}
                                    onPhantomHoverChange={onUnitHover}
                                    initialPoints={[]}
                                    onPointsChange={() => {}}
                                />
                            </div>
                        ) : floorPlanImage ? (
                            <img src={floorPlanImage} alt="" className="absolute inset-0 size-full object-contain" />
                        ) : (
                            <div className="flex size-full items-center justify-center font-dyeus-serif text-lg text-dyeus-ink-faded">
                                {t("viewerEmptyFloor")}
                            </div>
                        )}
                    </div>
                </div>
            ) : null}

            <div
                ref={listScrollerRef}
                className={cn(
                    "h-0 min-h-0 flex-1 overflow-y-auto px-5 pb-5 md:px-6 md:pb-6",
                    layout === "list" ? "mt-4" : "mt-0",
                )}
            >
                {layout === "list" ? (
                    <div
                        ref={listHeaderRef}
                        className={cn(
                            UNIT_GRID,
                            "sticky top-0 z-[1] border-b border-dyeus-border bg-dyeus-cream pb-2 font-dyeus-sans text-sm text-dyeus-ink-muted",
                        )}
                    >
                        <span>{t("colName")}</span>
                        <span>{t("colArea")}</span>
                        <span>{t("colRooms")}</span>
                        <span>{t("colBaths")}</span>
                        <span>{t("colPrice")}</span>
                    </div>
                ) : null}

                {filtered.length === 0 ? (
                    <p className="mt-6 font-dyeus-sans text-sm text-dyeus-ink-muted">{t("noUnitsOnFloor")}</p>
                ) : layout === "grid" ? (
                    <ul className="flex flex-col gap-3">
                        {filtered.map((unit) => {
                            const highlighted = highlightUnitId === unit._id;
                            const status = (unit.status as MarketingUnitStatus) || "available";
                            const badge = STATUS_BADGE[status] ?? STATUS_BADGE.available;
                            const statusText = t(
                                FILTER_KEYS[status as ProjectUnitStatusFilter] ?? "filterAvailable",
                            );
                            return (
                                <li key={unit._id} ref={bindRowRef(unit._id)}>
                                    <button
                                        type="button"
                                        onClick={() => selectUnit(unit._id)}
                                        className={cn(
                                            "flex min-h-[9.5rem] w-full overflow-hidden border bg-dyeus-white text-left transition",
                                            highlighted
                                                ? "border-dyeus-bronze ring-1 ring-dyeus-bronze/30"
                                                : "border-dyeus-border hover:border-dyeus-ink/20",
                                        )}
                                        onMouseEnter={() => onUnitHover?.(unit._id)}
                                        onMouseLeave={() => onUnitHover?.(null)}
                                        onFocus={() => onUnitHover?.(unit._id)}
                                        onBlur={() => onUnitHover?.(null)}
                                    >
                                        <div className="relative w-[42%] shrink-0 py-2.5 pl-2.5">
                                            <div className="relative h-full min-h-0 overflow-hidden bg-dyeus-sand">
                                                <img
                                                    alt=""
                                                    src={unit.imageUrl ?? dyeusAssets.residenceC01}
                                                    className="absolute inset-0 size-full object-cover"
                                                />
                                            </div>
                                            <div className="pointer-events-none absolute inset-y-2.5 right-0 w-px bg-dyeus-border" />
                                        </div>
                                        <div className="flex min-w-0 flex-1 flex-col px-3 py-3">
                                            <div className="flex items-start justify-between gap-2">
                                                <p className="min-w-0 truncate font-dyeus-serif text-xl leading-none text-dyeus-ink">
                                                    {unit.name}
                                                </p>
                                                <span
                                                    className={cn(
                                                        "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 font-dyeus-sans text-xs",
                                                        badge.wrap,
                                                    )}
                                                >
                                                    <span className={cn("size-1.5 rounded-full", badge.dot)} />
                                                    {statusText}
                                                </span>
                                            </div>
                                            <div className="mt-3 grid grid-cols-3 gap-x-3 gap-y-2">
                                                <div>
                                                    <p className="font-dyeus-sans text-[11px] uppercase tracking-[0.12em] text-dyeus-ink-muted">
                                                        {t("areaLabel")}
                                                    </p>
                                                    <p className="font-dyeus-serif text-sm text-dyeus-ink">
                                                        {unit.areaSqm != null ? `${unit.areaSqm} m²` : "—"}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="font-dyeus-sans text-[11px] uppercase tracking-[0.12em] text-dyeus-ink-muted">
                                                        {t("roomsLabel")}
                                                    </p>
                                                    <p className="font-dyeus-serif text-sm text-dyeus-ink">
                                                        {unit.bedrooms ?? "—"}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="font-dyeus-sans text-[11px] uppercase tracking-[0.12em] text-dyeus-ink-muted">
                                                        {t("bathsLabel")}
                                                    </p>
                                                    <p className="font-dyeus-serif text-sm text-dyeus-ink">
                                                        {unit.bathrooms ?? "—"}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="font-dyeus-sans text-[11px] uppercase tracking-[0.12em] text-dyeus-ink-muted">
                                                        {t("orientationLabel")}
                                                    </p>
                                                    <p className="font-dyeus-serif text-sm text-dyeus-ink">
                                                        {unit.orientation ?? "—"}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="font-dyeus-sans text-[11px] uppercase tracking-[0.12em] text-dyeus-ink-muted">
                                                        {t("floorLabel")}
                                                    </p>
                                                    <p className="font-dyeus-serif text-sm text-dyeus-ink">
                                                        {unit.floorLabel ?? "—"}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="mt-auto pt-2">
                                                <p className="border border-dyeus-border py-2 text-center font-dyeus-serif text-base text-dyeus-ink">
                                                    {unit.price != null ? `€${unit.price.toLocaleString()}` : "—"}
                                                </p>
                                            </div>
                                        </div>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                ) : (
                    <ul>
                        {filtered.map((unit) => {
                            const highlighted = highlightUnitId === unit._id;
                            return (
                                <li key={unit._id} ref={bindRowRef(unit._id)}>
                                    <button
                                        type="button"
                                        onClick={() => selectUnit(unit._id)}
                                        className={cn(
                                            UNIT_GRID,
                                            "w-full cursor-pointer py-2.5 text-left font-dyeus-sans text-sm transition",
                                            highlighted
                                                ? "bg-dyeus-bronze/10 text-dyeus-bronze"
                                                : "text-dyeus-ink hover:bg-dyeus-sand/70",
                                        )}
                                        onMouseEnter={() => onUnitHover?.(unit._id)}
                                        onMouseLeave={() => onUnitHover?.(null)}
                                        onFocus={() => onUnitHover?.(unit._id)}
                                        onBlur={() => onUnitHover?.(null)}
                                    >
                                        <span>{unit.name}</span>
                                        <span>{unit.areaSqm != null ? `${unit.areaSqm} m²` : "—"}</span>
                                        <span>{unit.bedrooms ?? "—"}</span>
                                        <span>{unit.bathrooms ?? "—"}</span>
                                        <span>
                                            {unit.price != null ? `€${unit.price.toLocaleString()}` : "—"}
                                        </span>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </aside>
    );
}

export default DyeusPropertiesList;
