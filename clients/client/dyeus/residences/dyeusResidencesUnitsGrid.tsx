import {useMemo, useState} from "react";
import {Link} from "react-router-dom";
import {cn} from "@coreModule/components/lib/utils.ts";
import {flattenCatalogUnits} from "@propertyManagementModule/clients/client/public/project/shared/flattenCatalogUnits.ts";
import {parseFloorLevel} from "@propertyManagementModule/clients/client/public/project/shared/parseFloorLevel.ts";
import {sortCatalogUnits} from "@propertyManagementModule/clients/client/public/project/shared/applyProjectUnitsFilters.ts";
import {
    PROJECT_UNITS_SORT_KEYS,
    type ProjectUnitsSortKey,
} from "@propertyManagementModule/clients/client/public/project/shared/projectUnitsFilterTypes.ts";
import {
    PROJECT_UNIT_STATUS_FILTERS,
    useProjectUnitStatusFilter,
} from "@propertyManagementModule/clients/client/public/project/shared/useProjectUnitStatusFilter.ts";
import {useProjectViewerParams} from "@propertyManagementModule/clients/client/public/project/shared/useProjectViewerParams.ts";
import {dyeusAssets} from "@propertyManagementModule/clients/client/dyeus/shared/dyeusAssets.ts";
import type {
    MarketingProjectSingle,
    MarketingUnitStatus,
} from "@propertyManagementModule/clients/client/public/shared/publicTypes.ts";
import type {PropertyListingCardUnit} from "@propertyManagementModule/clients/client/public/project/shared/propertyListingCard.tsx";

type DyeusResidencesUnitsGridProps = {
    project: MarketingProjectSingle;
};

const STATUS_LABEL: Record<MarketingUnitStatus | "all", string> = {
    available: "Available",
    sold: "Sold",
    reserved: "Reserved",
    all: "All",
};

const SORT_LABEL: Record<ProjectUnitsSortKey, string> = {
    default: "Default",
    priceAsc: "Price ↑",
    priceDesc: "Price ↓",
    areaAsc: "Area ↑",
    areaDesc: "Area ↓",
    roomsAsc: "Rooms ↑",
    nameAsc: "Name",
};

function formatFloorHeading(name: string | undefined, levelNumber: string | number | undefined): string {
    if (name?.trim()) return name;
    const level = parseFloorLevel(levelNumber);
    if (level === -1) return "Basement";
    if (level === 0) return "Ground floor";
    return `Floor ${level}`;
}

function formatPrice(price: number | undefined): string {
    if (price == null) return "—";
    return `€${Math.round(price).toLocaleString("en-US")}`;
}

function DyeusUnitCard({unit, projectId}: {unit: PropertyListingCardUnit; projectId: string}) {
    const status = (unit.status as MarketingUnitStatus) || "available";
    const statusLabel = STATUS_LABEL[status] ?? status;
    const meta = [
        unit.areaSqm != null ? `${unit.areaSqm} m²` : null,
        unit.bedrooms != null ? `${unit.bedrooms} bed` : null,
        unit.bathrooms != null ? `${unit.bathrooms} bath` : null,
        unit.floorLabel || null,
    ]
        .filter(Boolean)
        .join(" · ");

    return (
        <Link
            to={`/property?projectId=${projectId}&unitId=${unit._id}`}
            className="group flex h-full min-w-0 flex-col border border-dyeus-border bg-dyeus-white transition hover:border-dyeus-bronze"
        >
            <div className="relative aspect-[4/3] overflow-hidden bg-dyeus-sand">
                <img
                    src={unit.imageUrl || dyeusAssets.residenceC01}
                    alt=""
                    className="size-full object-cover transition duration-500 group-hover:scale-105"
                />
                <span
                    className={cn(
                        "absolute left-3 top-3 px-3 py-1 font-dyeus-sans text-[11px] uppercase tracking-[0.14em] text-dyeus-cream",
                        status === "available" && "bg-dyeus-available/90",
                        status === "reserved" && "bg-amber-700/85",
                        status === "sold" && "bg-dyeus-ink/80",
                        !["available", "reserved", "sold"].includes(status) && "bg-dyeus-ink/80",
                    )}
                >
                    {statusLabel}
                </span>
            </div>
            <div className="flex flex-1 flex-col gap-2 p-4">
                <h4 className="font-dyeus-serif text-2xl text-dyeus-ink">{unit.name}</h4>
                {meta ? <p className="font-dyeus-sans text-sm text-dyeus-ink-muted">{meta}</p> : null}
                <p className="mt-auto pt-2 font-dyeus-serif text-xl text-dyeus-ink">{formatPrice(unit.price)}</p>
            </div>
        </Link>
    );
}

function DyeusResidencesUnitsGrid({project}: DyeusResidencesUnitsGridProps) {
    const {edificeId, floorId} = useProjectViewerParams();
    const {activeFilter, setActiveFilter} = useProjectUnitStatusFilter();
    const [sortKey, setSortKey] = useState<ProjectUnitsSortKey>("default");

    const allUnits = useMemo(() => flattenCatalogUnits(project), [project]);
    const scopedUnits = useMemo(() => {
        return allUnits.filter((unit) => {
            if (edificeId && unit.edificeId !== edificeId) return false;
            if (floorId && unit.floorId !== floorId) return false;
            return true;
        });
    }, [allUnits, edificeId, floorId]);

    const apartmentCount = useMemo(() => {
        if (activeFilter === "all") return scopedUnits.length;
        return scopedUnits.filter((unit) => unit.status === activeFilter).length;
    }, [scopedUnits, activeFilter]);

    const scopedContext = useMemo(() => {
        if (!edificeId && !floorId) return null;
        const edifice = project.edifices?.find((item) => item._id === edificeId);
        const floor = edifice?.floors?.find((item) => item._id === floorId);
        const parts = [
            edifice?.name || null,
            floor ? formatFloorHeading(floor.name, floor.levelNumber) : null,
        ].filter(Boolean);
        return parts.length > 0 ? parts.join(" · ") : null;
    }, [project.edifices, edificeId, floorId]);

    const groupedSections = useMemo(() => {
        const edifices = (project.edifices ?? []).filter((edifice) => !edificeId || edifice._id === edificeId);
        return edifices
            .map((edifice) => {
                const floors = [...(edifice.floors ?? [])]
                    .filter((floor) => !floorId || floor._id === floorId)
                    .sort((a, b) => parseFloorLevel(b.levelNumber) - parseFloorLevel(a.levelNumber));
                const floorGroups = floors
                    .map((floor) => {
                        const units = flattenCatalogUnits({
                            ...project,
                            edifices: [{...edifice, floors: [floor]}],
                        });
                        const statusFiltered =
                            activeFilter === "all"
                                ? units
                                : units.filter((unit) => unit.status === activeFilter);
                        const sorted = sortCatalogUnits(statusFiltered, sortKey);
                        return {
                            floorId: floor._id,
                            floorLabel: formatFloorHeading(floor.name, floor.levelNumber),
                            units: sorted,
                        };
                    })
                    .filter((group) => group.units.length > 0);
                return {
                    edificeId: edifice._id,
                    edificeLabel: edifice.name || "Residence",
                    floorGroups,
                };
            })
            .filter((section) => section.floorGroups.length > 0);
    }, [project, activeFilter, sortKey, edificeId, floorId]);

    const hasUnits = groupedSections.some((section) => section.floorGroups.length > 0);

    return (
        <div className="flex w-full flex-col gap-6 md:gap-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h2 className="font-dyeus-serif text-4xl text-dyeus-ink md:text-5xl">Units</h2>
                    {scopedContext ? (
                        <p className="mt-2 font-dyeus-sans text-sm text-dyeus-ink-muted">{scopedContext}</p>
                    ) : null}
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
                    <p className="font-dyeus-sans text-base text-dyeus-ink md:text-lg">
                        {apartmentCount} {apartmentCount === 1 ? "apartment" : "apartments"}
                    </p>
                    <label className="flex w-full max-w-xs cursor-pointer items-center justify-between gap-4 border border-dyeus-border bg-dyeus-white px-4 py-2 sm:w-auto">
                        <span className="sr-only">Sort by</span>
                        <select
                            value={sortKey}
                            onChange={(event) => setSortKey(event.target.value as ProjectUnitsSortKey)}
                            className="min-w-0 flex-1 cursor-pointer appearance-none border-0 bg-transparent font-dyeus-sans text-base text-dyeus-ink outline-none"
                            aria-label="Sort by"
                        >
                            {PROJECT_UNITS_SORT_KEYS.map((key) => (
                                <option key={key} value={key}>
                                    {SORT_LABEL[key]}
                                </option>
                            ))}
                        </select>
                        <span aria-hidden className="pointer-events-none text-dyeus-ink-muted">
                            ▼
                        </span>
                    </label>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 md:gap-3">
                {PROJECT_UNIT_STATUS_FILTERS.map((filter) => (
                    <button
                        key={filter}
                        type="button"
                        onClick={() => setActiveFilter(filter)}
                        className={cn(
                            "px-4 py-2 font-dyeus-sans text-sm uppercase tracking-[0.14em] transition",
                            activeFilter === filter
                                ? "bg-dyeus-ink text-dyeus-cream"
                                : "border border-dyeus-border text-dyeus-ink-muted hover:text-dyeus-ink",
                        )}
                    >
                        {STATUS_LABEL[filter]}
                    </button>
                ))}
            </div>

            {!hasUnits ? (
                <p className="font-dyeus-sans text-sm text-dyeus-ink-muted">
                    No units match this filter.
                </p>
            ) : (
                <div className="flex flex-col gap-10 md:gap-12">
                    {groupedSections.map((section) => (
                        <section key={section.edificeId} className="flex flex-col gap-6">
                            <h3 className="font-dyeus-serif text-3xl text-dyeus-ink md:text-4xl">
                                {section.edificeLabel}
                            </h3>
                            {section.floorGroups.map((floorGroup) => (
                                <div key={floorGroup.floorId} className="flex flex-col gap-4">
                                    <h4 className="font-dyeus-sans text-sm uppercase tracking-[0.18em] text-dyeus-bronze">
                                        {floorGroup.floorLabel}
                                    </h4>
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                                        {floorGroup.units.map((unit) => (
                                            <DyeusUnitCard
                                                key={unit._id}
                                                unit={unit}
                                                projectId={project._id}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </section>
                    ))}
                </div>
            )}
        </div>
    );
}

export default DyeusResidencesUnitsGrid;
