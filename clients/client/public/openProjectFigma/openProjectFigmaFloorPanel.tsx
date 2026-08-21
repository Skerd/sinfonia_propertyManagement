import {useEffect, useMemo, useRef, useState} from "react";
import {LayoutGrid, List, X} from "lucide-react";
import {cn} from "@coreModule/components/lib/utils.ts";
import PolygonSelector from "@coreModule/components/custom/polygonSelector.tsx";
import {flattenCatalogUnits} from "@propertyManagementModule/clients/client/public/project/shared/flattenCatalogUnits.ts";
import {projectsAssets} from "@propertyManagementModule/clients/client/public/projects/projectsAssets.ts";
import {
    PROJECT_UNIT_STATUS_FILTERS,
    useProjectUnitStatusFilter,
} from "@propertyManagementModule/clients/client/public/project/shared/useProjectUnitStatusFilter.ts";
import {resolveMarketingMediaUrl} from "@propertyManagementModule/clients/client/public/shared/resolveMarketingMedia.ts";
import type {
    MarketingPolygonItem,
    MarketingProjectSingle,
    MarketingUnitStatus,
} from "@propertyManagementModule/clients/client/public/shared/publicTypes.ts";
import type {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import type {PropertyListingCardUnit} from "@propertyManagementModule/clients/client/public/project/shared/propertyListingCard.tsx";

const UNIT_GRID = "grid grid-cols-[minmax(0,1.1fr)_repeat(3,minmax(0,0.7fr))_minmax(0,1.1fr)] gap-x-3";

const UNIT_STATUS_POLYGON_COLORS: Record<MarketingUnitStatus, {fill: string; stroke: string}> = {
    available: {fill: "rgba(31, 190, 106, 0.5)", stroke: "rgba(31, 190, 106, 0.9)"},
    reserved: {fill: "rgba(234, 179, 8, 0.5)", stroke: "rgba(234, 179, 8, 0.9)"},
    sold: {fill: "rgba(220, 38, 38, 0.5)", stroke: "rgba(220, 38, 38, 0.9)"},
};

type StatusColoredPolygon = MarketingPolygonItem & {fill: string; stroke: string};
type PanelLayout = "list" | "grid";

const STATUS_BADGE: Record<MarketingUnitStatus, {wrap: string; dot: string}> = {
    available: {wrap: "bg-[rgba(47,157,68,0.12)] text-[#2f9d44]", dot: "bg-[#2f9d44]"},
    reserved: {wrap: "bg-[rgba(217,119,6,0.12)] text-[#d97706]", dot: "bg-[#d97706]"},
    sold: {wrap: "bg-[rgba(24,24,24,0.08)] text-pronix-ink-muted", dot: "bg-pronix-ink-muted"},
};

type OpenProjectFigmaFloorPanelProps = {
    project: MarketingProjectSingle;
    floorId: string;
    resolveLanguageKey: WithLanguageType["resolveLanguageKey"];
    hoveredUnitId?: string | null;
    selectedUnitId?: string | null;
    onUnitHover?: (unitId: string | null) => void;
    onUnitSelect?: (unitId: string) => void;
    onClose?: () => void;
    panelTitle?: string;
};

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

function OpenProjectFigmaFloorPanel({
    project,
    floorId,
    resolveLanguageKey,
    hoveredUnitId = null,
    selectedUnitId = null,
    onUnitHover,
    onUnitSelect,
    onClose,
    panelTitle,
}: OpenProjectFigmaFloorPanelProps) {
    const {activeFilter, setActiveFilter} = useProjectUnitStatusFilter();
    const [layout, setLayout] = useState<PanelLayout>("list");
    const listScrollerRef = useRef<HTMLDivElement>(null);
    const listHeaderRef = useRef<HTMLDivElement>(null);
    const rowRefs = useRef(new Map<string, HTMLElement>());

    const selectedFloor = useMemo(() => {
        for (const edifice of project.edifices ?? []) {
            const floor = edifice.floors?.find((item) => item._id === floorId);
            if (floor) {
                return floor;
            }
        }
        return undefined;
    }, [project, floorId]);

    const units = useMemo(() => {
        return flattenCatalogUnits(project).filter((unit) => unit.floorId === floorId);
    }, [project, floorId]);

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
        if (!candidateId) {
            return null;
        }
        if (filtered.some((unit) => unit._id === candidateId)) {
            return candidateId;
        }
        const polygon = selectedFloor?.unitsCoordinates?.find((item) => item._id === candidateId);
        return polygon ? (filtered.find((unit) => unit.name === polygon.name)?._id ?? null) : null;
    }, [hoveredUnitId, selectedUnitId, filtered, selectedFloor?.unitsCoordinates]);

    const selectUnit = (unitId: string) => {
        onUnitSelect?.(unitId);
    };

    useEffect(() => {
        if (!highlightUnitId) {
            return;
        }
        const scroller = listScrollerRef.current;
        const row = rowRefs.current.get(highlightUnitId);
        if (!scroller || !row || scroller.clientHeight <= 0) {
            return;
        }

        const headerHeight = listHeaderRef.current?.offsetHeight ?? 0;
        const rowTop = row.getBoundingClientRect().top - scroller.getBoundingClientRect().top + scroller.scrollTop;
        const rowBottom = rowTop + row.offsetHeight;
        const viewStart = scroller.scrollTop + headerHeight;
        const viewEnd = scroller.scrollTop + scroller.clientHeight;
        if (rowTop >= viewStart && rowBottom <= viewEnd) {
            return;
        }

        const nextTop = rowTop < viewStart ? rowTop - headerHeight : rowBottom - scroller.clientHeight;
        scroller.scrollTo({top: Math.max(0, nextTop), behavior: "smooth"});
    }, [highlightUnitId]);

    return (
        <aside
            className="flex h-full min-h-0 w-full max-h-full flex-col overflow-hidden rounded-[5px] border border-pronix-border bg-white text-pronix-ink shadow-[0_8px_40px_rgba(0,0,0,0.28)]"
            data-node-id="287:770"
        >
            <div className="flex shrink-0 items-start justify-between gap-3 px-5 pt-5 md:px-6 md:pt-6">
                <h2 className="min-w-0 flex-1 wrap-break-word font-aeonik-medium text-2xl leading-[1.15] text-pronix-ink md:text-3xl">
                    {panelTitle || resolveLanguageKey("residencesTitle")}
                </h2>
                {onClose ? (
                    <button
                        type="button"
                        onClick={onClose}
                        className="-mr-1 -mt-1 flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-[5px] text-pronix-ink transition hover:bg-[rgba(24,24,24,0.06)]"
                        aria-label={String(resolveLanguageKey("closeResidencesPanel"))}
                    >
                        <X className="size-5" strokeWidth={1.75} aria-hidden />
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
                                "cursor-pointer rounded-[5px] px-3 py-1.5 font-aeonik-light text-sm transition md:text-base",
                                active
                                    ? "bg-pronix-blue text-white"
                                    : "bg-[rgba(24,24,24,0.05)] text-pronix-ink hover:bg-[rgba(24,24,24,0.08)]",
                            )}
                        >
                            {resolveLanguageKey(`filter${filter.charAt(0).toUpperCase()}${filter.slice(1)}`)}
                        </button>
                    );
                })}
                </div>
                <button
                    type="button"
                    onClick={() => setLayout(layout === "list" ? "grid" : "list")}
                    className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-[5px] bg-[rgba(24,24,24,0.05)] text-pronix-ink transition hover:bg-[rgba(24,24,24,0.08)]"
                    aria-label={String(resolveLanguageKey(layout === "list" ? "viewAsGrid" : "viewAsList"))}
                >
                    {layout === "list" ? (
                        <LayoutGrid className="size-4" strokeWidth={1.75} aria-hidden />
                    ) : (
                        <List className="size-4" strokeWidth={1.75} aria-hidden />
                    )}
                </button>
            </div>

            {layout === "list" ? (
                            <div className="relative mx-5 shrink-0 overflow-hidden rounded-[5px] bg-[rgba(24,24,24,0.04)] md:mx-6 [&_[data-slot=card]]:pointer-events-auto">
                                <div className="relative aspect-[470/272] w-full [&_[data-slot=card]]:border-0 [&_[data-slot=card]]:bg-transparent [&_[data-slot=card]]:p-0 [&_[data-slot=card]]:shadow-none [&_[data-slot=card]]:ring-0">
                                    {floorPlanImage && unitPolygons.length > 0 ? (
                                        <div className="absolute inset-0">
                                            <PolygonSelector
                                                key={`${floorId}:${activeFilter}`}
                                                fillHeight
                                                dashboard
                                                borderless
                                                disabled
                                                hideControls
                                                objectFit="contain"
                                                phantomsAlwaysVisible
                                                imageUrl={floorPlanImage}
                                                phantomPoints={unitPolygons}
                                                onFloorClick={(item) =>
                                                    selectUnit(resolveUnitIdFromPolygon(units, item))
                                                }
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
                        <div className="flex size-full items-center justify-center font-aeonik-light text-lg text-pronix-ink-muted">
                            {resolveLanguageKey("viewerEmptyFloor")}
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
                            "sticky top-0 z-[1] border-b border-pronix-border bg-white pb-2 font-aeonik-light text-sm text-pronix-ink-muted",
                        )}
                    >
                        <span>{resolveLanguageKey("colName")}</span>
                        <span>{resolveLanguageKey("colArea")}</span>
                        <span>{resolveLanguageKey("colRooms")}</span>
                        <span>{resolveLanguageKey("colBaths")}</span>
                        <span>{resolveLanguageKey("colPrice")}</span>
                    </div>
                    ) : null}

                    {filtered.length === 0 ? (
                        <p className="mt-6 font-aeonik-light text-sm text-pronix-ink-muted">
                            {resolveLanguageKey("noUnitsOnFloor")}
                        </p>
                    ) : layout === "grid" ? (
                        <ul className="flex flex-col gap-3">
                            {filtered.map((unit) => {
                                const highlighted = highlightUnitId === unit._id;
                                const status = (unit.status as MarketingUnitStatus) || "available";
                                const badge = STATUS_BADGE[status] ?? STATUS_BADGE.available;
                                const statusText = resolveLanguageKey(
                                    `filter${status.charAt(0).toUpperCase()}${status.slice(1)}`,
                                );
                                return (
                                    <li
                                        key={unit._id}
                                        ref={(node) => {
                                            if (node) {
                                                rowRefs.current.set(unit._id, node);
                                            } else {
                                                rowRefs.current.delete(unit._id);
                                            }
                                        }}
                                    >
                                        <button
                                            type="button"
                                            onClick={() => selectUnit(unit._id)}
                                            className={cn(
                                                "flex min-h-[9.5rem] w-full overflow-hidden rounded-[5px] border bg-white text-left transition",
                                                highlighted
                                                    ? "border-pronix-blue ring-1 ring-pronix-blue/30"
                                                    : "border-pronix-border hover:border-pronix-ink/20",
                                            )}
                                            onMouseEnter={() => onUnitHover?.(unit._id)}
                                            onMouseLeave={() => onUnitHover?.(null)}
                                            onFocus={() => onUnitHover?.(unit._id)}
                                            onBlur={() => onUnitHover?.(null)}
                                        >
                                            <div className="relative w-[42%] shrink-0 py-2.5 pl-2.5">
                                                <div className="relative h-full min-h-0 overflow-hidden">
                                                    <img
                                                        alt=""
                                                        src={unit.imageUrl ?? projectsAssets.cardPlaceholder}
                                                        className="absolute inset-0 size-full object-cover"
                                                    />
                                                </div>
                                                <div className="pointer-events-none absolute inset-y-2.5 right-0 w-px bg-pronix-border" />
                                            </div>
                                            <div className="flex min-w-0 flex-1 flex-col px-3 py-3">
                                                <div className="flex items-start justify-between gap-2">
                                                    <p className="min-w-0 truncate font-aeonik-medium text-xl leading-none text-pronix-ink">
                                                        {unit.name}
                                                    </p>
                                                    <span
                                                        className={cn(
                                                            "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 font-aeonik-light text-xs",
                                                            badge.wrap,
                                                        )}
                                                    >
                                                        <span className={cn("size-1.5 rounded-full", badge.dot)} />
                                                        {statusText}
                                                    </span>
                                                </div>
                                                <div className="mt-3 grid grid-cols-3 gap-x-3 gap-y-2">
                                                    <div>
                                                        <p className="font-aeonik-light text-[11px] text-pronix-ink-muted">
                                                            {resolveLanguageKey("areaLabel")}
                                                        </p>
                                                        <p className="font-aeonik-medium text-sm text-pronix-ink">
                                                            {unit.areaSqm != null ? `${unit.areaSqm} m²` : "—"}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="font-aeonik-light text-[11px] text-pronix-ink-muted">
                                                            {resolveLanguageKey("roomsLabel")}
                                                        </p>
                                                        <p className="font-aeonik-medium text-sm text-pronix-ink">
                                                            {unit.bedrooms ?? "—"}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="font-aeonik-light text-[11px] text-pronix-ink-muted">
                                                            {resolveLanguageKey("bathsLabel")}
                                                        </p>
                                                        <p className="font-aeonik-medium text-sm text-pronix-ink">
                                                            {unit.bathrooms ?? "—"}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="font-aeonik-light text-[11px] text-pronix-ink-muted">
                                                            {resolveLanguageKey("orientationLabel")}
                                                        </p>
                                                        <p className="font-aeonik-medium text-sm text-pronix-ink">
                                                            {unit.orientation ?? "—"}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="font-aeonik-light text-[11px] text-pronix-ink-muted">
                                                            {resolveLanguageKey("floorLabel")}
                                                        </p>
                                                        <p className="font-aeonik-medium text-sm text-pronix-ink">
                                                            {unit.floorLabel ?? "—"}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="mt-auto pt-2">
                                                    <p className="rounded-[5px] border border-pronix-border py-2 text-center font-aeonik-medium text-base text-pronix-ink">
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
                                    <li
                                        key={unit._id}
                                        ref={(node) => {
                                            if (node) {
                                                rowRefs.current.set(unit._id, node);
                                            } else {
                                                rowRefs.current.delete(unit._id);
                                            }
                                        }}
                                    >
                                        <button
                                            type="button"
                                            onClick={() => selectUnit(unit._id)}
                                            className={cn(
                                                UNIT_GRID,
                                                "w-full cursor-pointer py-2.5 text-left font-aeonik-light text-sm transition",
                                                highlighted
                                                    ? "bg-pronix-blue/10 text-pronix-blue"
                                                    : "text-pronix-ink hover:bg-[rgba(24,24,24,0.04)]",
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

export default OpenProjectFigmaFloorPanel;
