import {useMemo} from "react";
import {OpenProjectContentProps} from "@propertyManagementModule/clients/client/public/project/shared/openProjectShell.tsx";
import PropertyListingCard from "@propertyManagementModule/clients/client/public/project/shared/propertyListingCard.tsx";
import {flattenCatalogUnits} from "@propertyManagementModule/clients/client/public/project/shared/flattenCatalogUnits.ts";
import {parseFloorLevel} from "@propertyManagementModule/clients/client/public/project/shared/parseFloorLevel.ts";
import {
    filterCatalogUnits,
    sortCatalogUnits,
} from "@propertyManagementModule/clients/client/public/project/shared/applyProjectUnitsFilters.ts";
import {
    ProjectUnitsFilterState,
    ProjectUnitsSortKey,
} from "@propertyManagementModule/clients/client/public/project/shared/projectUnitsFilterTypes.ts";
import {ProjectsPriceBounds} from "@propertyManagementModule/clients/client/public/projects/shared/projectsFilterTypes.ts";
import {
    PUBLIC_GRID_CELL,
    PUBLIC_GRID_PROJECTS_GALLERY,
    PUBLIC_SUBTITLE,
    PUBLIC_TITLE,
} from "@propertyManagementModule/clients/client/public/shared/layout/publicLayoutTokens.ts";

type OpenProjectGridCardsSectionProps = OpenProjectContentProps & {
    activeFilter: string;
    unitFilters: ProjectUnitsFilterState;
    priceBounds: ProjectsPriceBounds;
    sortKey: ProjectUnitsSortKey;
};

function formatFloorHeading(name: string | undefined, levelNumber: string | number | undefined): string {
    if (name?.trim()) {
        return name;
    }
    const level = parseFloorLevel(levelNumber);
    if (level === -1) {
        return "Basement";
    }
    if (level === 0) {
        return "Ground floor";
    }
    return `Floor ${level}`;
}

function OpenProjectGridCardsSection({
    project,
    resolveLanguageKey,
    activeFilter,
    unitFilters,
    priceBounds,
    sortKey,
}: OpenProjectGridCardsSectionProps) {
    const groupedSections = useMemo(() => {
        const edifices = project.edifices ?? [];
        return edifices
            .map((edifice) => {
                const floors = [...(edifice.floors ?? [])].sort(
                    (a, b) => parseFloorLevel(b.levelNumber) - parseFloorLevel(a.levelNumber),
                );
                const floorGroups = floors
                    .map((floor) => {
                        const units = flattenCatalogUnits({
                            ...project,
                            edifices: [{...edifice, floors: [floor]}],
                        });
                        const statusFiltered =
                            activeFilter === "all" ? units : units.filter((unit) => unit.status === activeFilter);
                        const functionallyFiltered = filterCatalogUnits(statusFiltered, unitFilters, priceBounds);
                        const sorted = sortCatalogUnits(functionallyFiltered, sortKey);
                        return {
                            floorId: floor._id,
                            floorLabel: formatFloorHeading(floor.name, floor.levelNumber),
                            units: sorted,
                        };
                    })
                    .filter((group) => group.units.length > 0);
                return {
                    edificeId: edifice._id,
                    edificeLabel: edifice.name || resolveLanguageKey("unnamedEdifice"),
                    floorGroups,
                };
            })
            .filter((section) => section.floorGroups.length > 0);
    }, [project, activeFilter, unitFilters, priceBounds, sortKey, resolveLanguageKey]);

    const hasUnits = groupedSections.some((section) => section.floorGroups.length > 0);

    if (!hasUnits) {
        return (
            <div className="relative min-w-0 w-full overflow-x-hidden" data-node-id="495:671">
                <p className="font-aeonik-light text-lg text-pronix-ink-muted not-italic md:text-2xl">
                    {resolveLanguageKey("noUnits")}
                </p>
            </div>
        );
    }

    return (
        <div className="relative min-w-0 w-full overflow-x-hidden" data-node-id="495:671">
            <div className="flex flex-col gap-10 md:gap-12">
                {groupedSections.map((section) => (
                    <section key={section.edificeId} className="flex flex-col gap-6">
                        <h2 className={PUBLIC_TITLE}>{section.edificeLabel}</h2>
                        {section.floorGroups.map((floorGroup) => (
                            <div key={floorGroup.floorId} className="flex flex-col gap-4">
                                <h3 className={PUBLIC_SUBTITLE}>{floorGroup.floorLabel}</h3>
                                <div className={PUBLIC_GRID_PROJECTS_GALLERY}>
                                    {floorGroup.units.map((unit) => (
                                        <div key={unit._id} className={PUBLIC_GRID_CELL}>
                                            <PropertyListingCard
                                                unit={unit}
                                                projectId={project._id}
                                                availableLabel={resolveLanguageKey("filterAvailable")}
                                                soldLabel={resolveLanguageKey("filterSold")}
                                                reservedLabel={resolveLanguageKey("filterReserved")}
                                                areaLabel={resolveLanguageKey("areaLabel")}
                                                roomsLabel={resolveLanguageKey("roomsLabel")}
                                                floorLabel={resolveLanguageKey("floorLabel")}
                                                bathsLabel={resolveLanguageKey("bathsLabel")}
                                                orientationLabel={resolveLanguageKey("orientationLabel")}
                                                favoriteAddLabel={String(resolveLanguageKey("favoritesAdd"))}
                                                favoriteRemoveLabel={String(resolveLanguageKey("favoritesRemove"))}
                                                projectName={project.name}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </section>
                ))}
            </div>
        </div>
    );
}

export default OpenProjectGridCardsSection;
