import {Link} from "react-router-dom";
import {useEffect, useMemo, useState} from "react";
import {createPortal} from "react-dom";
import {Search as MagnifyingGlass, X} from "lucide-react";
import {cn} from "@coreModule/components/lib/utils.ts";
import PolygonSelector from "@coreModule/components/custom/polygonSelector.tsx";
import {flattenCatalogUnits} from "@propertyManagementModule/clients/client/public/project/shared/flattenCatalogUnits.ts";
import {
    PROJECT_UNIT_STATUS_FILTERS,
    type ProjectUnitStatusFilter,
} from "@propertyManagementModule/clients/client/public/project/shared/useProjectUnitStatusFilter.ts";
import {resolveMarketingMediaUrl} from "@propertyManagementModule/clients/client/public/shared/resolveMarketingMedia.ts";
import {useDyeusT} from "@propertyManagementModule/clients/client/dyeus/shared/useDyeusT.ts";
import type {
    MarketingFloorListItem,
    MarketingPolygonItem,
    MarketingProjectSingle,
    MarketingUnitStatus,
} from "@propertyManagementModule/clients/client/public/shared/publicTypes.ts";

const HOME_LANGUAGE_PATH =
    "src/modules/propertyManagement/clients/client/dyeus/home/index.tsx";

type DyeusPropertiesListProps = {
    project: MarketingProjectSingle;
    floorId?: string;
    edificeId?: string;
    floors: MarketingFloorListItem[];
    onClose?: () => void;
    hoveredUnitId?: string | null;
    onUnitHover?: (unitId: string | null) => void;
    onUnitClick?: (unitId: string) => void;
    className?: string;
};

type StatusColoredPolygon = MarketingPolygonItem & {fill: string; stroke: string};

const FILTER_KEYS: Record<ProjectUnitStatusFilter, string> = {
    available: "filterAvailable",
    sold: "filterSold",
    reserved: "filterReserved",
    all: "filterAll",
};

/** Floor-plan polygon colors by unit commercial status (green / yellow / red). */
const UNIT_STATUS_POLYGON_COLORS: Record<MarketingUnitStatus, {fill: string; stroke: string}> = {
    available: {fill: "rgba(31, 190, 106, 0.5)", stroke: "rgba(31, 190, 106, 0.9)"},
    reserved: {fill: "rgba(234, 179, 8, 0.5)", stroke: "rgba(234, 179, 8, 0.9)"},
    sold: {fill: "rgba(220, 38, 38, 0.5)", stroke: "rgba(220, 38, 38, 0.9)"},
};

const UNIT_GRID =
    "grid grid-cols-[minmax(0,1.1fr)_repeat(4,minmax(0,0.7fr))_minmax(0,1.1fr)] gap-x-3";

function FloorPlanPolygonViewer({
    floorKey,
    imageUrl,
    unitPolygons,
    hoveredUnitId,
    onUnitHover,
    onUnitClick,
}: {
    floorKey: string;
    imageUrl: string;
    unitPolygons: StatusColoredPolygon[];
    hoveredUnitId?: string | null;
    onUnitHover?: (unitId: string | null) => void;
    onUnitClick?: (unitId: string) => void;
}) {
    return (
        <PolygonSelector
            key={floorKey}
            fillHeight
            dashboard
            borderless
            disabled
            hideControls
            objectFit="contain"
            phantomsAlwaysVisible
            imageUrl={imageUrl}
            phantomPoints={unitPolygons}
            onFloorClick={(item: any) => onUnitClick?.(item._id)}
            stayHovered={hoveredUnitId || undefined}
            externalHoveredId={hoveredUnitId || ""}
            onPhantomHoverChange={onUnitHover}
            initialPoints={[]}
            onPointsChange={() => {}}
        />
    );
}

function StatusFilters({
    activeFilter,
    onChange,
    t,
}: {
    activeFilter: ProjectUnitStatusFilter;
    onChange: (filter: ProjectUnitStatusFilter) => void;
    t: (key: string) => string;
}) {
    return (
        <div className="flex flex-wrap gap-2">
            {PROJECT_UNIT_STATUS_FILTERS.map((filter) => {
                const active = activeFilter === filter;
                return (
                    <button
                        key={filter}
                        type="button"
                        onClick={() => onChange(filter)}
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
    );
}

function UnitsTable({
    projectId,
    units,
    hoveredUnitId,
    onUnitHover,
    emptyLabel,
    colLabels,
}: {
    projectId: string;
    units: ReturnType<typeof flattenCatalogUnits>;
    hoveredUnitId?: string | null;
    onUnitHover?: (unitId: string | null) => void;
    emptyLabel: string;
    colLabels: {
        name: string;
        area: string;
        rooms: string;
        baths: string;
        floor: string;
        price: string;
    };
}) {
    return (
        <div className="min-h-0 flex-1 overflow-auto">
            <div className={cn(UNIT_GRID, "sticky top-0 z-[1] border-b border-dyeus-border bg-dyeus-cream pb-2 font-dyeus-sans text-sm text-dyeus-ink")}>
                <span>{colLabels.name}</span>
                <span>{colLabels.area}</span>
                <span>{colLabels.rooms}</span>
                <span>{colLabels.baths}</span>
                <span>{colLabels.floor}</span>
                <span>{colLabels.price}</span>
            </div>

            {units.length === 0 ? (
                <p className="mt-6 font-dyeus-sans text-sm text-dyeus-ink-muted">{emptyLabel}</p>
            ) : (
                <ul>
                    {units.map((unit) => {
                        const highlighted = hoveredUnitId === unit._id;
                        return (
                            <li key={unit._id}>
                                <Link
                                    to={`/property?projectId=${projectId}&unitId=${unit._id}`}
                                    className={cn(
                                        UNIT_GRID,
                                        "py-2.5 font-dyeus-sans text-sm transition",
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
                                    <span>{unit.floorLabel ?? "—"}</span>
                                    <span>
                                        {unit.price != null ? `€${unit.price.toLocaleString()}` : "—"}
                                    </span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}

function DyeusPropertiesList({
    project,
    floorId = "",
    edificeId = "",
    floors,
    onClose,
    hoveredUnitId = null,
    onUnitHover,
    onUnitClick,
    className,
}: DyeusPropertiesListProps) {
    const {t} = useDyeusT(HOME_LANGUAGE_PATH);
    const [activeFilter, setActiveFilter] = useState<ProjectUnitStatusFilter>("available");
    const [floorPlanExpanded, setFloorPlanExpanded] = useState(false);
    const selectedFloor = floors.find((floor) => floor._id === floorId);

    const units = useMemo(() => {
        const allUnits = flattenCatalogUnits(project);
        return allUnits.filter((unit) => {
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
        return (selectedFloor?.unitsCoordinates ?? []).map((polygon) => {
            const status = statusById.get(polygon._id) ?? "available";
            const colors = UNIT_STATUS_POLYGON_COLORS[status] ?? UNIT_STATUS_POLYGON_COLORS.available;
            return {...polygon, ...colors};
        });
    }, [selectedFloor?.unitsCoordinates, units]);
    const showFloorPlan = Boolean(floorId);
    const canExpandFloorPlan = Boolean(floorPlanImage);

    const colLabels = {
        name: t("colName"),
        area: t("colArea"),
        rooms: t("colRooms"),
        baths: t("colBaths"),
        floor: t("colFloor"),
        price: t("colPrice"),
    };

    useEffect(() => {
        if (!floorPlanExpanded) return;
        const previous = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setFloorPlanExpanded(false);
        };
        window.addEventListener("keydown", onKey);
        return () => {
            document.body.style.overflow = previous;
            window.removeEventListener("keydown", onKey);
        };
    }, [floorPlanExpanded]);

    useEffect(() => {
        setFloorPlanExpanded(false);
    }, [floorId]);

    return (
        <aside
            className={cn(
                "flex h-full min-h-0 w-full flex-col overflow-hidden bg-dyeus-cream text-dyeus-ink shadow-[0_4px_12px_rgba(36,28,22,0.08),0_24px_64px_rgba(36,28,22,0.28)] ring-1 ring-black/5",
                className,
            )}
            data-node-id="287:770"
        >
            <div className="flex shrink-0 items-start justify-between gap-3 px-5 pt-5 md:px-6 md:pt-6">
                <h2 className="font-dyeus-serif text-[clamp(2rem,4vw,3rem)] font-bold leading-none">
                    {t("residencesTitle")}
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

            <div className="flex shrink-0 px-5 pb-4 pt-4 md:px-6">
                <StatusFilters activeFilter={activeFilter} onChange={setActiveFilter} t={t} />
            </div>

            {/* Unit polygon selector — floor plan image + unit polygons */}
            {showFloorPlan ? (
                <div className="relative mx-5 shrink-0 overflow-hidden bg-dyeus-sand md:mx-6">
                    <div className="relative aspect-[470/272] w-full [&_[data-slot=card]]:border-0 [&_[data-slot=card]]:bg-transparent [&_[data-slot=card]]:p-0 [&_[data-slot=card]]:shadow-none [&_[data-slot=card]]:ring-0">
                        {floorPlanImage && unitPolygons.length > 0 ? (
                            <div className="absolute inset-0">
                                <FloorPlanPolygonViewer
                                    floorKey={selectedFloor?._id ?? floorId}
                                    imageUrl={floorPlanImage}
                                    unitPolygons={unitPolygons}
                                    hoveredUnitId={hoveredUnitId}
                                    onUnitHover={onUnitHover}
                                    onUnitClick={onUnitClick}
                                />
                            </div>
                        ) : floorPlanImage ? (
                            <img src={floorPlanImage} alt="" className="absolute inset-0 size-full object-contain" />
                        ) : (
                            <div className="flex size-full items-center justify-center font-dyeus-serif text-2xl text-dyeus-ink-faded">
                                {t("floorPlan")}
                            </div>
                        )}
                    </div>
                    {canExpandFloorPlan ? (
                        <button
                            type="button"
                            onClick={() => setFloorPlanExpanded(true)}
                            className="absolute right-2 top-2 z-20 flex size-9 cursor-pointer items-center justify-center rounded-md bg-dyeus-cream/95 text-dyeus-ink shadow-sm transition hover:bg-dyeus-cream hover:text-dyeus-bronze"
                            aria-label={t("expandFloorPlan")}
                        >
                            <MagnifyingGlass className="size-4" strokeWidth={1.75} />
                        </button>
                    ) : null}
                </div>
            ) : null}

            <div className="mt-4 flex min-h-0 flex-1 flex-col px-5 pb-5 md:px-6 md:pb-6">
                <UnitsTable
                    projectId={project._id}
                    units={filtered}
                    hoveredUnitId={hoveredUnitId}
                    onUnitHover={onUnitHover}
                    emptyLabel={t("emptyFilter")}
                    colLabels={colLabels}
                />
            </div>

            {floorPlanExpanded && floorPlanImage
                ? createPortal(
                      <div
                          role="dialog"
                          aria-modal="true"
                          aria-label={t("floorPlanDialog")}
                          className="fixed inset-0 z-[300] flex items-center justify-center bg-dyeus-ink/90 p-3 md:p-6"
                          onClick={() => setFloorPlanExpanded(false)}
                      >
                          <button
                              type="button"
                              onClick={() => setFloorPlanExpanded(false)}
                              className="absolute right-3 top-3 z-10 flex size-10 cursor-pointer items-center justify-center text-dyeus-cream transition hover:text-dyeus-bronze md:right-5 md:top-5"
                              aria-label={t("closeFloorPlan")}
                          >
                              <X className="size-6" strokeWidth={1.5} />
                          </button>
                          <div
                              className="relative flex h-full max-h-[min(94vh,980px)] w-full max-w-[min(100vw-1.5rem,1440px)] flex-col overflow-hidden bg-dyeus-cream shadow-2xl lg:flex-row"
                              onClick={(e) => e.stopPropagation()}
                          >
                              <div className="relative min-h-[40vh] min-w-0 flex-1 bg-dyeus-sand lg:min-h-0 [&_[data-slot=card]]:border-0 [&_[data-slot=card]]:bg-transparent [&_[data-slot=card]]:p-0 [&_[data-slot=card]]:shadow-none [&_[data-slot=card]]:ring-0">
                                  {unitPolygons.length > 0 ? (
                                      <FloorPlanPolygonViewer
                                          floorKey={`expanded-${selectedFloor?._id ?? floorId}`}
                                          imageUrl={floorPlanImage}
                                          unitPolygons={unitPolygons}
                                          hoveredUnitId={hoveredUnitId}
                                          onUnitHover={onUnitHover}
                                          onUnitClick={(unitId) => {
                                              onUnitClick?.(unitId);
                                              setFloorPlanExpanded(false);
                                          }}
                                      />
                                  ) : (
                                      <img
                                          src={floorPlanImage}
                                          alt=""
                                          className="size-full object-contain"
                                      />
                                  )}
                              </div>

                              <aside className="flex min-h-0 w-full shrink-0 flex-col border-t border-dyeus-border bg-dyeus-cream lg:w-[28rem] lg:border-l lg:border-t-0 xl:w-[32rem]">
                                  <div className="shrink-0 border-b border-dyeus-border px-5 py-4">
                                      <p className="font-dyeus-sans text-[0.7rem] uppercase tracking-[0.18em] text-dyeus-bronze">
                                          {t("floorPlan")}
                                      </p>
                                      <h3 className="font-dyeus-serif text-2xl text-dyeus-ink">
                                          {selectedFloor?.name?.trim() || t("residencesTitle")}
                                      </h3>
                                      <div className="mt-3">
                                          <StatusFilters
                                              activeFilter={activeFilter}
                                              onChange={setActiveFilter}
                                              t={t}
                                          />
                                      </div>
                                  </div>
                                  <div className="flex min-h-0 flex-1 flex-col px-5 py-4">
                                      <UnitsTable
                                          projectId={project._id}
                                          units={filtered}
                                          hoveredUnitId={hoveredUnitId}
                                          onUnitHover={onUnitHover}
                                          emptyLabel={t("emptyFilter")}
                                          colLabels={colLabels}
                                      />
                                  </div>
                              </aside>
                          </div>
                      </div>,
                      document.body,
                  )
                : null}
        </aside>
    );
}

export default DyeusPropertiesList;
