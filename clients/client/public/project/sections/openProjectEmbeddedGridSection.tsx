import {useEffect, useMemo, useState} from "react";
import {OpenProjectContentProps} from "@propertyManagementModule/clients/client/public/project/shared/openProjectShell.tsx";
import OpenProjectGridCardsSection from "@propertyManagementModule/clients/client/public/project/sections/openProjectGridCardsSection.tsx";
import OpenProjectUnitsFilterPanel from "@propertyManagementModule/clients/client/public/project/components/openProjectUnitsFilterPanel.tsx";
import PublicFavoritesBasketButton from "@propertyManagementModule/clients/client/public/shared/favorites/publicFavoritesBasketButton.tsx";
import {projectsAssets} from "@propertyManagementModule/clients/client/public/projects/projectsAssets.ts";
import {flattenCatalogUnits} from "@propertyManagementModule/clients/client/public/project/shared/flattenCatalogUnits.ts";
import {deriveUnitPriceBounds} from "@propertyManagementModule/clients/client/public/project/shared/applyProjectUnitsFilters.ts";
import {
    createDefaultUnitFilters,
    hasActiveUnitFilters,
    PROJECT_UNITS_SORT_KEYS,
    ProjectUnitsSortKey,
} from "@propertyManagementModule/clients/client/public/project/shared/projectUnitsFilterTypes.ts";
import {PUBLIC_HEADING} from "@propertyManagementModule/clients/client/public/shared/layout/publicLayoutTokens.ts";

const STATUS_FILTERS = ["available", "sold", "reserved", "all"] as const;

const sortSelectClassName =
    "min-w-0 flex-1 cursor-pointer appearance-none border-0 bg-transparent font-aeonik-light text-lg text-pronix-ink not-italic outline-none md:text-2xl";

function countUnits(project: OpenProjectContentProps["project"]) {
    if (project.unitCount != null) {
        return project.unitCount;
    }
    return (
        project.edifices?.reduce(
            (sum, edifice) => sum + (edifice.floors?.reduce((fSum, floor) => fSum + (floor.units?.length ?? 0), 0) ?? 0),
            0,
        ) ?? 0
    );
}

function OpenProjectEmbeddedGridSection(props: OpenProjectContentProps) {
    const {project, resolveLanguageKey} = props;
    const [activeFilter, setActiveFilter] = useState("all");
    const [sortKey, setSortKey] = useState<ProjectUnitsSortKey>("default");
    const [filterPanelOpen, setFilterPanelOpen] = useState(false);

    const allUnits = useMemo(() => flattenCatalogUnits(project), [project]);
    const priceBounds = useMemo(() => deriveUnitPriceBounds(allUnits), [allUnits]);
    const apartmentCount = useMemo(() => countUnits(project), [project]);

    const [appliedUnitFilters, setAppliedUnitFilters] = useState(() => createDefaultUnitFilters(priceBounds));
    const [draftUnitFilters, setDraftUnitFilters] = useState(() => createDefaultUnitFilters(priceBounds));
    const [priceSamples, setPriceSamples] = useState<number[]>([]);

    useEffect(() => {
        const defaults = createDefaultUnitFilters(priceBounds);
        setAppliedUnitFilters(defaults);
        setDraftUnitFilters(defaults);
    }, [priceBounds.min, priceBounds.max]);

    useEffect(() => {
        const samples = allUnits
            .map((unit) => unit.price)
            .filter((price): price is number => price != null && price > 0);

        if (!hasActiveUnitFilters(appliedUnitFilters, priceBounds) && samples.length > 0) {
            setPriceSamples(samples);
        }
    }, [allUnits, appliedUnitFilters, priceBounds]);

    const filtersActive = hasActiveUnitFilters(appliedUnitFilters, priceBounds);

    function openFilterPanel() {
        setDraftUnitFilters(appliedUnitFilters);
        setFilterPanelOpen(true);
    }

    return (
        <div className="flex w-full flex-col gap-6 md:gap-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <h2 className={PUBLIC_HEADING}>{resolveLanguageKey("gridSectionTitle")}</h2>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
                    <p className="font-aeonik-light text-lg text-pronix-ink not-italic md:text-2xl">
                        {apartmentCount} {resolveLanguageKey("apartmentsLabel")}
                    </p>
                    <label className="flex w-full max-w-xs cursor-pointer items-center justify-between gap-4 rounded-[5px] border border-pronix-border px-4 py-2 sm:w-auto md:px-6">
                        <span className="sr-only">{resolveLanguageKey("sortBy")}</span>
                        <select
                            value={sortKey}
                            onChange={(event) => setSortKey(event.target.value as ProjectUnitsSortKey)}
                            className={sortSelectClassName}
                            aria-label={String(resolveLanguageKey("sortBy"))}
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

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-3 md:gap-8">
                    {STATUS_FILTERS.map((filter) => (
                        <button
                            key={filter}
                            type="button"
                            onClick={() => setActiveFilter(filter)}
                            className={`font-aeonik-light text-base not-italic transition md:text-2xl ${
                                activeFilter === filter
                                    ? "rounded-[5px] bg-pronix-blue px-4 py-2 text-white md:px-6"
                                    : "text-pronix-ink"
                            }`}
                        >
                            {resolveLanguageKey(`filter${filter.charAt(0).toUpperCase()}${filter.slice(1)}`)}
                        </button>
                    ))}
                </div>
                <div className="flex shrink-0 items-center gap-4">
                    <PublicFavoritesBasketButton resolveLanguageKey={resolveLanguageKey} />
                    <button
                        type="button"
                        onClick={openFilterPanel}
                        className="flex shrink-0 cursor-pointer items-center gap-4 rounded-[5px] border border-pronix-border px-4 py-2 transition duration-200 hover:border-[rgba(24,24,24,0.28)] hover:bg-pronix-ink/[0.02] sm:px-6 sm:py-2.5"
                    >
                        <img alt="" aria-hidden className="size-9 shrink-0" src={projectsAssets.filterIcon} />
                        <span className="font-aeonik-light text-xl text-pronix-ink not-italic md:text-2xl lg:text-3xl">
                            {resolveLanguageKey("filtersLabel")}
                        </span>
                        {filtersActive ? (
                            <span className="size-2 shrink-0 rounded-full bg-pronix-blue" aria-hidden />
                        ) : null}
                    </button>
                </div>
            </div>

            <OpenProjectGridCardsSection
                {...props}
                activeFilter={activeFilter}
                unitFilters={appliedUnitFilters}
                priceBounds={priceBounds}
                sortKey={sortKey}
            />

            <OpenProjectUnitsFilterPanel
                open={filterPanelOpen}
                draft={draftUnitFilters}
                bounds={priceBounds}
                priceSamples={priceSamples}
                onClose={() => setFilterPanelOpen(false)}
                onDraftChange={setDraftUnitFilters}
                onApply={() => {
                    setAppliedUnitFilters(draftUnitFilters);
                    setFilterPanelOpen(false);
                }}
                onReset={() => {
                    const defaults = createDefaultUnitFilters(priceBounds);
                    setDraftUnitFilters(defaults);
                    setAppliedUnitFilters(defaults);
                    setFilterPanelOpen(false);
                }}
                resolveLanguageKey={resolveLanguageKey}
            />
        </div>
    );
}

export default OpenProjectEmbeddedGridSection;
