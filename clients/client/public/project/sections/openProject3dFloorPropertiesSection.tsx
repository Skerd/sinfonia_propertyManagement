import {useMemo, useState} from "react";
import {OpenProjectContentProps} from "@propertyManagementModule/clients/client/public/project/shared/openProjectShell.tsx";
import PropertyListingCard from "@propertyManagementModule/clients/client/public/project/shared/propertyListingCard.tsx";
import {flattenCatalogUnits} from "@propertyManagementModule/clients/client/public/project/shared/flattenCatalogUnits.ts";
import {useProjectViewerParams} from "@propertyManagementModule/clients/client/public/project/shared/useProjectViewerParams.ts";

type OpenProject3dFloorPropertiesSectionProps = Pick<OpenProjectContentProps, "project" | "resolveLanguageKey"> & {
    activeFilter?: string;
    onFilterChange?: (filter: string) => void;
    hoveredUnitId?: string | null;
    onUnitHover?: (unitId: string | null) => void;
    className?: string;
};

const FILTERS = ["available", "sold", "reserved", "all"] as const;

function OpenProject3dFloorPropertiesSection({
    project,
    resolveLanguageKey,
    activeFilter: controlledFilter,
    onFilterChange,
    hoveredUnitId = null,
    onUnitHover,
    className = "",
}: OpenProject3dFloorPropertiesSectionProps) {
    const {floorId} = useProjectViewerParams();
    const [internalFilter, setInternalFilter] = useState("all");
    const activeFilter = controlledFilter ?? internalFilter;
    const setFilter = onFilterChange ?? setInternalFilter;

    const units = useMemo(() => {
        const allUnits = flattenCatalogUnits(project);
        if (!floorId) {
            return allUnits;
        }
        return allUnits.filter((unit) => unit.floorId === floorId);
    }, [project, floorId]);

    const filtered =
        activeFilter === "all" ? units : units.filter((unit) => unit.status === activeFilter);

    return (
        <div
            className={`flex h-full min-h-0 w-full flex-col overflow-hidden rounded-[5px] border border-[rgba(24,24,24,0.1)] bg-white ${className}`}
            data-node-id="543:635"
        >
            <div className="shrink-0 border-b border-pronix-border px-5 pb-4 pt-5" data-node-id="543:641">
                <h2
                    className="font-aeonik-medium text-2xl leading-[1.2] text-pronix-ink not-italic md:text-4xl"
                    data-node-id="543:642"
                >
                    {resolveLanguageKey("propertiesTitle")}
                </h2>
                <div className="mt-3 flex flex-wrap gap-2 md:gap-3" data-node-id="543:644">
                    {FILTERS.map((filter) => (
                        <button
                            key={filter}
                            type="button"
                            onClick={() => setFilter(filter)}
                            className={`rounded-[5px] px-3 py-1.5 font-aeonik-light text-base not-italic transition md:text-xl ${
                                activeFilter === filter
                                    ? "bg-pronix-blue text-white"
                                    : "bg-[rgba(24,24,24,0.05)] text-pronix-ink"
                            }`}
                        >
                            {resolveLanguageKey(`filter${filter.charAt(0).toUpperCase()}${filter.slice(1)}`)}
                        </button>
                    ))}
                </div>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4" data-node-id="543:656">
                {filtered.length === 0 ? (
                    <p className="font-aeonik-light text-base text-pronix-ink-muted md:text-lg">
                        {resolveLanguageKey("noUnitsOnFloor")}
                    </p>
                ) : (
                    filtered.map((unit, index) => (
                        <div key={unit._id} className={index > 0 ? "mt-3" : undefined}>
                            <PropertyListingCard
                                unit={unit}
                                projectId={project._id}
                                variant="compact"
                                nodeId={`543:${657 + index}`}
                                highlighted={hoveredUnitId === unit._id}
                                onHoverChange={onUnitHover}
                                availableLabel={resolveLanguageKey("filterAvailable")}
                                soldLabel={resolveLanguageKey("filterSold")}
                                reservedLabel={resolveLanguageKey("filterReserved")}
                                areaLabel={resolveLanguageKey("areaLabel")}
                                roomsLabel={resolveLanguageKey("roomsLabel")}
                                floorLabel={resolveLanguageKey("floorLabel")}
                                bathsLabel={resolveLanguageKey("bathsLabel")}
                                orientationLabel={resolveLanguageKey("orientationLabel")}
                            />
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default OpenProject3dFloorPropertiesSection;
