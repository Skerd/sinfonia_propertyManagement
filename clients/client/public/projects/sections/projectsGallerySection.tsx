import {useEffect, useState} from "react";
import {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import Loader from "@coreModule/components/custom/loader.tsx";
import FigmaProjectCard from "@propertyManagementModule/clients/client/public/projects/center/figmaProjectCard.tsx";
import ProjectsFilterPanel from "@propertyManagementModule/clients/client/public/projects/components/projectsFilterPanel.tsx";
import PublicFavoritesBasketButton from "@propertyManagementModule/clients/client/public/shared/favorites/publicFavoritesBasketButton.tsx";
import {projectsAssets} from "@propertyManagementModule/clients/client/public/projects/projectsAssets.ts";
import {Link} from "react-router-dom";
import {MarketingProjectsCatalogResponse} from "@propertyManagementModule/clients/client/public/shared/publicTypes.ts";
import {buildCatalogFilterRequest} from "@propertyManagementModule/clients/client/public/projects/shared/applyProjectsFilters.ts";
import {
    createDefaultFilters,
    hasActiveFunctionalFilters,
    ProjectsFilterState,
} from "@propertyManagementModule/clients/client/public/projects/shared/projectsFilterTypes.ts";
import {
    PUBLIC_GALLERY_PAGE_TITLE,
    PUBLIC_GRID_CELL,
    PUBLIC_GRID_PROJECTS_GALLERY,
    PUBLIC_HEADING,
    PUBLIC_SECTION_BASE,
    PUBLIC_SUBTITLE,
} from "@propertyManagementModule/clients/client/public/shared/layout/publicLayoutTokens.ts";

type ProjectsGallerySectionProps = WithLanguageType & WithAxiosType<MarketingProjectsCatalogResponse>;

function ProjectsGallerySection(props: ProjectsGallerySectionProps) {
    const {resolveLanguageKey, data, loading, onFilterChange} = props;
    const [filterOpen, setFilterOpen] = useState(false);

    const projects = data?.projects ?? [];
    const filterOptions = data?.filterOptions;
    const priceBounds = filterOptions?.priceBounds ?? {min: 0, max: 0};
    const projectOptions = filterOptions?.projects ?? [];
    const cityOptions = filterOptions?.cities ?? [];

    const [appliedFilters, setAppliedFilters] = useState<ProjectsFilterState>(() => createDefaultFilters(priceBounds));
    const [draftFilters, setDraftFilters] = useState<ProjectsFilterState>(() => createDefaultFilters(priceBounds));
    const [catalogPriceSamples, setCatalogPriceSamples] = useState<number[]>([]);

    useEffect(() => {
        if (filterOptions?.priceBounds) {
            const defaults = createDefaultFilters(filterOptions.priceBounds);
            setAppliedFilters(defaults);
            setDraftFilters(defaults);
        }
    }, [filterOptions?.priceBounds.min, filterOptions?.priceBounds.max]);

    useEffect(() => {
        const samples = projects.flatMap((project) =>
            [project.minSharePrice, project.maxSharePrice].filter(
                (price): price is number => price != null && price > 0,
            ),
        );

        if (!hasActiveFunctionalFilters(appliedFilters, priceBounds) && samples.length > 0) {
            setCatalogPriceSamples(samples);
        }
    }, [projects, appliedFilters, priceBounds]);

    const filtersActive = hasActiveFunctionalFilters(appliedFilters, priceBounds);

    function openFilterPanel() {
        setDraftFilters(appliedFilters);
        setFilterOpen(true);
    }

    function handleApplyFilters() {
        setAppliedFilters(draftFilters);
        onFilterChange(buildCatalogFilterRequest(draftFilters));
        setFilterOpen(false);
    }

    function handleResetFilters() {
        const defaults = createDefaultFilters(priceBounds);
        setDraftFilters(defaults);
        setAppliedFilters(defaults);
        onFilterChange(buildCatalogFilterRequest(defaults));
        setFilterOpen(false);
    }

    return (
        <div className={PUBLIC_SECTION_BASE} data-node-id="278:690">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between" data-node-id="268:390">
                <h1 className={`shrink-0 ${PUBLIC_GALLERY_PAGE_TITLE}`} data-node-id="268:238">
                    {resolveLanguageKey("title")}
                </h1>
                <div className="flex shrink-0 items-center gap-4">
                    <PublicFavoritesBasketButton resolveLanguageKey={resolveLanguageKey} />
                    <button
                        type="button"
                        onClick={openFilterPanel}
                        className="flex shrink-0 cursor-pointer items-center gap-4 rounded-[5px] border border-pronix-border px-4 py-2 transition duration-200 hover:border-[rgba(24,24,24,0.28)] hover:bg-pronix-ink/[0.02] sm:px-6 sm:py-2.5"
                        data-node-id="268:380"
                    >
                    <img
                        alt=""
                        aria-hidden
                        className="size-9 shrink-0"
                        src={projectsAssets.filterIcon}
                        data-node-id="268:375"
                    />
                    <span className="font-aeonik-light text-xl text-pronix-ink not-italic md:text-2xl lg:text-3xl">
                        {resolveLanguageKey("filterButton")}
                    </span>
                    {filtersActive ? (
                        <span className="size-2 shrink-0 rounded-full bg-pronix-blue" aria-hidden />
                    ) : null}
                    </button>
                </div>
            </div>

            <div className="mt-4 min-h-[280px] md:mt-6" data-node-id="277:225">
                {loading ? (
                    <Loader />
                ) : projects.length === 0 ? (
                    <div
                        className="mx-auto flex max-w-lg flex-col items-center justify-center rounded-[5px] border border-pronix-border p-8 md:p-12"
                        data-node-id="268:716-empty"
                    >
                        <img
                            alt=""
                            aria-hidden
                            className="mb-8 aspect-[515/320] w-full max-w-md rounded-[2px] object-cover"
                            src={projectsAssets.cardPlaceholder}
                        />
                        <p className={`text-center ${PUBLIC_HEADING}`}>{resolveLanguageKey("empty")}</p>
                        <p className={`mt-4 text-center ${PUBLIC_SUBTITLE} text-pronix-ink-muted`}>
                            {resolveLanguageKey("emptyHint")}
                        </p>
                        <Link
                            to="/contact"
                            className="mt-8 rounded-[5px] bg-pronix-blue px-8 py-3 font-aeonik-medium text-white not-italic md:text-lg"
                        >
                            {resolveLanguageKey("emptyCta")}
                        </Link>
                    </div>
                ) : (
                    <div className={PUBLIC_GRID_PROJECTS_GALLERY}>
                        {projects.map((project) => (
                            <div key={project._id} className={PUBLIC_GRID_CELL}>
                                <FigmaProjectCard
                                    project={project}
                                    resolveLanguageKey={resolveLanguageKey}
                                    currentLanguage={props.currentLanguage}
                                    languageCode={props.languageCode}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <ProjectsFilterPanel
                open={filterOpen}
                draft={draftFilters}
                bounds={priceBounds}
                priceSamples={catalogPriceSamples}
                projectOptions={projectOptions.map((option) => ({id: option._id, name: option.name}))}
                cityOptions={cityOptions}
                onClose={() => setFilterOpen(false)}
                onDraftChange={setDraftFilters}
                onApply={handleApplyFilters}
                onReset={handleResetFilters}
                resolveLanguageKey={resolveLanguageKey}
            />
        </div>
    );
}

export default ProjectsGallerySection;
