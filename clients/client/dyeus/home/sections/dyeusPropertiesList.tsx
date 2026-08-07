import {Link} from "react-router-dom";
import {useMemo, useState} from "react";
import {X} from "lucide-react";
import {cn} from "@coreModule/components/lib/utils.ts";
import PolygonSelector from "@coreModule/components/custom/polygonSelector.tsx";
import {flattenCatalogUnits} from "@propertyManagementModule/clients/client/public/project/shared/flattenCatalogUnits.ts";
import {
    PROJECT_UNIT_STATUS_FILTERS,
    type ProjectUnitStatusFilter,
} from "@propertyManagementModule/clients/client/public/project/shared/useProjectUnitStatusFilter.ts";
import {resolveMarketingMediaUrl} from "@propertyManagementModule/clients/client/public/shared/resolveMarketingMedia.ts";
import type {
    MarketingFloorListItem,
    MarketingPolygonItem,
    MarketingProjectSingle,
} from "@propertyManagementModule/clients/client/public/shared/publicTypes.ts";

type DyeusPropertiesListProps = {
    project: MarketingProjectSingle;
    floorId: string;
    floors: MarketingFloorListItem[];
    onClose?: () => void;
    hoveredUnitId?: string | null;
    onUnitHover?: (unitId: string | null) => void;
    onUnitClick?: (unitId: string) => void;
    className?: string;
};

const FILTER_LABELS: Record<ProjectUnitStatusFilter, string> = {
    available: "Available",
    sold: "Sold",
    reserved: "Reserved",
    all: "All",
};

function DyeusPropertiesList({
    project,
    floorId,
    floors,
    onClose,
    hoveredUnitId = null,
    onUnitHover,
    onUnitClick,
    className,
}: DyeusPropertiesListProps) {
    const [activeFilter, setActiveFilter] = useState<ProjectUnitStatusFilter>("available");
    const selectedFloor = floors.find((floor) => floor._id === floorId);

    const units = useMemo(() => {
        const allUnits = flattenCatalogUnits(project);
        if (!floorId) return allUnits;
        return allUnits.filter((unit) => unit.floorId === floorId);
    }, [project, floorId]);

    const filtered =
        activeFilter === "all" ? units : units.filter((unit) => unit.status === activeFilter);

    const floorPlanImage = resolveMarketingMediaUrl(selectedFloor?.mainImage);
    const unitPolygons: MarketingPolygonItem[] = selectedFloor?.unitsCoordinates ?? [];

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
                    Residences
                </h2>
                <button
                    type="button"
                    onClick={onClose}
                    className="cursor-pointer pt-1 text-dyeus-ink transition hover:text-dyeus-bronze"
                    aria-label="Close residences panel"
                >
                    <X className="size-3.5" strokeWidth={1.5} />
                </button>
            </div>

            <div className="flex shrink-0 flex-wrap gap-2 px-5 pb-4 pt-4 md:px-6">
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
                            {FILTER_LABELS[filter]}
                        </button>
                    );
                })}
            </div>

            {/* Unit polygon selector — floor plan image + unit polygons */}
            <div className="relative mx-5 shrink-0 overflow-hidden bg-dyeus-sand md:mx-6">
                <div className="relative aspect-[470/272] w-full [&_[data-slot=card]]:border-0 [&_[data-slot=card]]:bg-transparent [&_[data-slot=card]]:p-0 [&_[data-slot=card]]:shadow-none [&_[data-slot=card]]:ring-0">
                    {floorPlanImage && unitPolygons.length > 0 ? (
                        <div className="absolute inset-0">
                            <PolygonSelector
                                key={selectedFloor?._id ?? floorId}
                                fillHeight
                                dashboard
                                borderless
                                disabled
                                hideControls
                                imageUrl={floorPlanImage}
                                phantomPoints={unitPolygons}
                                onFloorClick={(item) => onUnitClick?.(item._id)}
                                stayHovered={hoveredUnitId || undefined}
                                externalHoveredId={hoveredUnitId || ""}
                                onPhantomHoverChange={onUnitHover}
                                initialPoints={[]}
                                onPointsChange={() => {}}
                            />
                        </div>
                    ) : floorPlanImage ? (
                        <img src={floorPlanImage} alt="" className="absolute inset-0 size-full object-contain" />
                    ) : (
                        <div className="flex size-full items-center justify-center font-dyeus-serif text-2xl text-dyeus-ink-faded">
                            Floor plan
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-4 min-h-0 flex-1 overflow-auto px-5 pb-5 md:px-6 md:pb-6">
                <div className="grid grid-cols-[minmax(0,1.1fr)_repeat(4,minmax(0,0.7fr))_minmax(0,1.1fr)] gap-x-3 border-b border-dyeus-border pb-2 font-dyeus-sans text-sm text-dyeus-ink">
                    <span>Name</span>
                    <span>Area</span>
                    <span>Rooms</span>
                    <span>Baths</span>
                    <span>Floor</span>
                    <span>Price</span>
                </div>

                {filtered.length === 0 ? (
                    <p className="mt-6 font-dyeus-sans text-sm text-dyeus-ink-muted">
                        No residences match this filter.
                    </p>
                ) : (
                    <ul>
                        {filtered.map((unit) => {
                            const highlighted = hoveredUnitId === unit._id;
                            return (
                                <li key={unit._id}>
                                    <Link
                                        to={`/property?projectId=${project._id}&unitId=${unit._id}`}
                                        className={cn(
                                            "grid grid-cols-[minmax(0,1.1fr)_repeat(4,minmax(0,0.7fr))_minmax(0,1.1fr)] gap-x-3 py-2.5 font-dyeus-sans text-sm transition",
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
                                        <span>
                                            {unit.areaSqm != null ? `${unit.areaSqm} m²` : "—"}
                                        </span>
                                        <span>{unit.bedrooms ?? "—"}</span>
                                        <span>{unit.bathrooms ?? "—"}</span>
                                        <span>{unit.floorLabel ?? "—"}</span>
                                        <span>
                                            {unit.price != null
                                                ? `€${unit.price.toLocaleString()}`
                                                : "—"}
                                        </span>
                                    </Link>
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
