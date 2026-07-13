import {Link, useSearchParams} from "react-router-dom";
import {OpenProjectContentProps} from "@propertyManagementModule/clients/client/public/project/shared/openProjectShell.tsx";
import PublicFavoritesBasketButton from "@propertyManagementModule/clients/client/public/shared/favorites/publicFavoritesBasketButton.tsx";
import {projectsAssets} from "@propertyManagementModule/clients/client/public/projects/projectsAssets.ts";
import {
    PROJECT_UNITS_SORT_KEYS,
    ProjectUnitsSortKey,
} from "@propertyManagementModule/clients/client/public/project/shared/projectUnitsFilterTypes.ts";
import {PUBLIC_TITLE} from "@propertyManagementModule/clients/client/public/shared/layout/publicLayoutTokens.ts";

type OpenProjectGridToolbarSectionProps = OpenProjectContentProps & {
    apartmentCount: number;
    activeFilter: string;
    onFilterChange: (filter: string) => void;
    sortKey: ProjectUnitsSortKey;
    onSortChange: (sortKey: ProjectUnitsSortKey) => void;
    filtersActive: boolean;
    onOpenFilters: () => void;
};

const STATUS_FILTERS = ["available", "sold", "reserved", "all"] as const;

const sortSelectClassName =
    "min-w-0 flex-1 cursor-pointer appearance-none border-0 bg-transparent font-aeonik-light text-lg text-pronix-ink not-italic outline-none md:text-2xl";

function OpenProjectGridToolbarSection({
    project,
    resolveLanguageKey,
    apartmentCount,
    activeFilter,
    onFilterChange,
    sortKey,
    onSortChange,
    filtersActive,
    onOpenFilters,
}: OpenProjectGridToolbarSectionProps) {
    const [searchParams] = useSearchParams();
    const query = searchParams.toString();
    const backHref = `/project/3d${query ? `?${query}` : ""}`;

    return (
        <div className="relative flex w-full flex-col gap-6 md:gap-8" data-node-id="495:670">
            <Link
                to={backHref}
                className="flex w-fit items-center font-aeonik-light text-lg text-pronix-blue hover:underline not-italic md:text-2xl"
                data-node-id="498:3358"
            >
                ← {resolveLanguageKey("backTo3d")}
            </Link>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between" data-node-id="495:648">
                <h1 className={`max-w-xl ${PUBLIC_TITLE}`} data-node-id="495:649">
                    {project.name}
                </h1>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6" data-node-id="495:650">
                    <p className="font-aeonik-light text-lg text-pronix-ink not-italic md:text-2xl">
                        {apartmentCount} {resolveLanguageKey("apartmentsLabel")}
                    </p>
                    <label
                        className="flex w-full max-w-xs cursor-pointer items-center justify-between gap-4 rounded-[5px] border border-pronix-border px-4 py-2 sm:w-auto md:px-6"
                        data-node-id="495:653"
                    >
                        <span className="sr-only">{resolveLanguageKey("sortBy")}</span>
                        <select
                            value={sortKey}
                            onChange={(event) => onSortChange(event.target.value as ProjectUnitsSortKey)}
                            className={sortSelectClassName}
                            aria-label={resolveLanguageKey("sortBy") as string}
                        >
                            {PROJECT_UNITS_SORT_KEYS.map((key) => (
                                <option key={key} value={key}>
                                    {resolveLanguageKey(`sort${key.charAt(0).toUpperCase()}${key.slice(1)}`)}
                                </option>
                            ))}
                        </select>
                        <span aria-hidden className="pointer-events-none text-pronix-ink-muted">
                            ▼
                        </span>
                    </label>
                </div>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between" data-node-id="495:657">
                <div className="flex flex-wrap items-center gap-3 md:gap-8" data-node-id="495:658">
                    {STATUS_FILTERS.map((filter) => (
                        <button
                            key={filter}
                            type="button"
                            onClick={() => onFilterChange(filter)}
                            className={`font-aeonik-light text-base not-italic transition md:text-2xl ${
                                activeFilter === filter ? "rounded-[5px] bg-pronix-blue px-4 py-2 text-white md:px-6" : "text-pronix-ink"
                            }`}
                        >
                            {resolveLanguageKey(`filter${filter.charAt(0).toUpperCase()}${filter.slice(1)}`)}
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-4">
                    <PublicFavoritesBasketButton resolveLanguageKey={resolveLanguageKey} />
                    <button
                        type="button"
                        onClick={onOpenFilters}
                        className="flex items-center text-pronix-ink"
                        data-node-id="495:665"
                    >
                        <img alt="" aria-hidden className="size-7 md:size-8" src={projectsAssets.filterIcon} />
                        <span className="ml-3 font-aeonik-light text-lg not-italic md:text-2xl">
                            {resolveLanguageKey("filtersLabel")}
                        </span>
                        {filtersActive ? (
                            <span className="ml-3 size-2 shrink-0 rounded-full bg-pronix-blue" aria-hidden />
                        ) : null}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default OpenProjectGridToolbarSection;
