import {useMemo, useState} from "react";
import {Link} from "react-router-dom";
import {ChevronLeft} from "lucide-react";
import PropertyListingCard from "@propertyManagementModule/clients/client/public/project/shared/propertyListingCard.tsx";
import {flattenCatalogUnits} from "@propertyManagementModule/clients/client/public/project/shared/flattenCatalogUnits.ts";
import {sortCatalogUnits} from "@propertyManagementModule/clients/client/public/project/shared/applyProjectUnitsFilters.ts";
import {
    PROJECT_UNITS_SORT_KEYS,
    type ProjectUnitsSortKey,
} from "@propertyManagementModule/clients/client/public/project/shared/projectUnitsFilterTypes.ts";
import {
    PUBLIC_GRID_CELL,
    PUBLIC_GRID_PROJECTS_GALLERY,
    PUBLIC_TITLE,
} from "@propertyManagementModule/clients/client/public/shared/layout/publicLayoutTokens.ts";
import {openProjectFigmaPath} from "@propertyManagementModule/clients/client/public/openProjectFigma/openProjectFigmaPaths.ts";
import type {MarketingProjectSingle} from "@propertyManagementModule/clients/client/public/shared/publicTypes.ts";
import type {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";

const STATUS_FILTERS = ["available", "sold", "reserved", "all"] as const;

type OpenProjectFigmaGridViewProps = {
    project: MarketingProjectSingle;
    resolveLanguageKey: WithLanguageType["resolveLanguageKey"];
};

function OpenProjectFigmaGridView({project, resolveLanguageKey}: OpenProjectFigmaGridViewProps) {
    const [status, setStatus] = useState<(typeof STATUS_FILTERS)[number]>("available");
    const [sortKey, setSortKey] = useState<ProjectUnitsSortKey>("default");
    const units = useMemo(() => flattenCatalogUnits(project), [project]);
    const visible = useMemo(() => {
        const filtered = status === "all" ? units : units.filter((unit) => unit.status === status);
        return sortCatalogUnits(filtered, sortKey);
    }, [units, status, sortKey]);

    return (
        <div className="flex w-full flex-col gap-8 pb-16" data-node-id="494:548">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between" data-node-id="495:648">
                <div className="flex min-w-0 items-center gap-2 sm:gap-3 md:gap-4">
                    <Link
                        to={openProjectFigmaPath("3d", project._id)}
                        className="-ml-2 flex shrink-0 items-center justify-center rounded-[5px] p-1 text-pronix-ink transition hover:bg-[rgba(24,24,24,0.04)] sm:-ml-2.5 md:-ml-3"
                        aria-label={String(resolveLanguageKey("backTo3d"))}
                    >
                        <ChevronLeft className="size-8 sm:size-10 md:size-12" strokeWidth={1.5} aria-hidden />
                    </Link>
                    <h1 className={`min-w-0 max-w-xl flex-1 ${PUBLIC_TITLE}`}>{project.name}</h1>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
                    <p className="whitespace-nowrap font-aeonik-light text-lg text-pronix-ink md:text-2xl">
                        {visible.length} {resolveLanguageKey("apartmentsLabel")}
                    </p>
                    <label className="flex w-full max-w-xs items-center justify-between gap-4 rounded-[5px] border border-pronix-border px-4 py-2 md:px-6">
                        <span className="sr-only">{resolveLanguageKey("sortBy")}</span>
                        <select
                            value={sortKey}
                            onChange={(event) => setSortKey(event.target.value as ProjectUnitsSortKey)}
                            className="min-w-0 flex-1 cursor-pointer appearance-none border-0 bg-transparent font-aeonik-light text-lg text-pronix-ink outline-none md:text-2xl"
                        >
                            {PROJECT_UNITS_SORT_KEYS.map((key) => (
                                <option key={key} value={key}>
                                    {resolveLanguageKey(`sort${key.charAt(0).toUpperCase()}${key.slice(1)}`)}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>
            </div>

            <div className="flex flex-wrap gap-4 font-aeonik-light text-lg text-pronix-ink md:text-2xl" data-node-id="495:657">
                {STATUS_FILTERS.map((filter) => (
                    <button
                        key={filter}
                        type="button"
                        onClick={() => setStatus(filter)}
                        className={`rounded-[5px] px-6 py-2 ${
                            status === filter ? "border border-pronix-border" : "text-pronix-ink-muted"
                        }`}
                    >
                        {resolveLanguageKey(
                            filter === "available"
                                ? "filterAvailable"
                                : filter === "sold"
                                  ? "filterSold"
                                  : filter === "reserved"
                                    ? "filterReserved"
                                    : "filterAll",
                        )}
                    </button>
                ))}
            </div>

            {visible.length === 0 ? (
                <p className="font-aeonik-light text-lg text-pronix-ink-muted">{resolveLanguageKey("noUnits")}</p>
            ) : (
                <div className={PUBLIC_GRID_PROJECTS_GALLERY} data-node-id="495:671">
                    {visible.map((unit) => (
                        <div key={unit._id} className={PUBLIC_GRID_CELL}>
                            <PropertyListingCard
                                unit={unit}
                                projectId={project._id}
                                projectName={project.name}
                                availableLabel={String(resolveLanguageKey("filterAvailable"))}
                                soldLabel={String(resolveLanguageKey("filterSold"))}
                                reservedLabel={String(resolveLanguageKey("filterReserved"))}
                                areaLabel={String(resolveLanguageKey("areaLabel"))}
                                roomsLabel={String(resolveLanguageKey("roomsLabel"))}
                                floorLabel={String(resolveLanguageKey("floorLabel"))}
                                bathsLabel={String(resolveLanguageKey("bathsLabel"))}
                                orientationLabel={String(resolveLanguageKey("orientationLabel"))}
                                favoriteAddLabel={String(resolveLanguageKey("favoritesAdd"))}
                                favoriteRemoveLabel={String(resolveLanguageKey("favoritesRemove"))}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default OpenProjectFigmaGridView;
