import {useMemo} from "react";
import {OpenProjectContentProps} from "@propertyManagementModule/clients/client/public/project/shared/openProjectShell.tsx";
import PropertyListingCard from "@propertyManagementModule/clients/client/public/project/shared/propertyListingCard.tsx";
import {flattenCatalogUnits} from "@propertyManagementModule/clients/client/public/project/shared/flattenCatalogUnits.ts";
import {useProjectViewerParams} from "@propertyManagementModule/clients/client/public/project/shared/useProjectViewerParams.ts";

type OpenProject3dFloorPropertiesSectionProps = OpenProjectContentProps & {
    activeFilter: string;
    onFilterChange: (filter: string) => void;
};

const FILTERS = ["available", "sold", "reserved", "all"] as const;

function OpenProject3dFloorPropertiesSection({
    project,
    resolveLanguageKey,
    activeFilter,
    onFilterChange,
}: OpenProject3dFloorPropertiesSectionProps) {
    const {floorId} = useProjectViewerParams();

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
            className="flex w-full max-w-lg flex-col overflow-hidden rounded-[5px] border border-[rgba(24,24,24,0.1)] bg-white lg:max-h-[min(924px,calc(100vh-200px))]"
            data-node-id="543:635"
        >
            <div className="border-b border-pronix-border px-5 pb-4 pt-5" data-node-id="543:641">
                <h2 className="font-aeonik-medium text-2xl text-pronix-ink not-italic md:text-4xl leading-[1.2]" data-node-id="543:642">
                    {resolveLanguageKey("propertiesTitle")}
                </h2>
                <div className="mt-3 flex flex-wrap gap-2 md:gap-3" data-node-id="543:644">
                    {FILTERS.map((filter) => (
                        <button
                            key={filter}
                            type="button"
                            onClick={() => onFilterChange(filter)}
                            className={`rounded-[5px] px-3 py-1.5 font-aeonik-light text-base not-italic transition md:text-xl ${
                                activeFilter === filter ? "bg-pronix-blue text-white" : "bg-[rgba(24,24,24,0.05)] text-pronix-ink"
                            }`}
                        >
                            {resolveLanguageKey(`filter${filter.charAt(0).toUpperCase()}${filter.slice(1)}`)}
                        </button>
                    ))}
                </div>
            </div>
            <div className="max-h-[60vh] overflow-y-auto px-5 py-4 lg:max-h-[765px]" data-node-id="543:656">
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
