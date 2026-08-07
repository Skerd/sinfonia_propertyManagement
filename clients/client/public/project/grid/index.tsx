import {useEffect, useMemo, useState} from "react";
import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import Loader from "@coreModule/components/custom/loader.tsx";
import PublicPageShell from "@propertyManagementModule/clients/client/public/shared/layout/publicPageShell.tsx";
import PublicSection from "@propertyManagementModule/clients/client/public/shared/layout/publicSection.tsx";
import PageHeaderSection from "@propertyManagementModule/clients/client/public/shared/sections/pageHeaderSection.tsx";
import FooterSection from "@propertyManagementModule/clients/client/public/home/sections/footerSection.tsx";
import CtaSection from "@propertyManagementModule/clients/client/public/shared/sections/ctaSection.tsx";
import OpenProjectGridToolbarSection from "@propertyManagementModule/clients/client/public/project/sections/openProjectGridToolbarSection.tsx";
import OpenProjectGridCardsSection from "@propertyManagementModule/clients/client/public/project/sections/openProjectGridCardsSection.tsx";
import OpenProjectUnitsFilterPanel from "@propertyManagementModule/clients/client/public/project/components/openProjectUnitsFilterPanel.tsx";
import ConstructionProgressSection from "@propertyManagementModule/clients/client/public/project/sections/constructionProgressSection.tsx";
import {useProjectId} from "@propertyManagementModule/clients/client/public/project/shared/useProjectId.ts";
import {useProjectViewerParams} from "@propertyManagementModule/clients/client/public/project/shared/useProjectViewerParams.ts";
import {useProjectUnitStatusFilter} from "@propertyManagementModule/clients/client/public/project/shared/useProjectUnitStatusFilter.ts";
import {MarketingProjectSingleResponse} from "@propertyManagementModule/clients/client/public/project/shared/openProjectShell.tsx";
import {flattenCatalogUnits} from "@propertyManagementModule/clients/client/public/project/shared/flattenCatalogUnits.ts";
import {deriveUnitPriceBounds} from "@propertyManagementModule/clients/client/public/project/shared/applyProjectUnitsFilters.ts";
import {
    createDefaultUnitFilters,
    hasActiveUnitFilters,
    ProjectUnitsSortKey,
} from "@propertyManagementModule/clients/client/public/project/shared/projectUnitsFilterTypes.ts";

type ProjectGridPageProps = WithLanguageType & WithAxiosType<MarketingProjectSingleResponse, {projectId: string}>;

function ProjectGridPage(props: ProjectGridPageProps) {
    const {resolveLanguageKey, currentLanguage, languageCode, data, loading, onFilterChange} = props;
    const projectId = useProjectId();
    const {edificeId, floorId} = useProjectViewerParams();
    const {activeFilter, setActiveFilter} = useProjectUnitStatusFilter();
    const [sortKey, setSortKey] = useState<ProjectUnitsSortKey>("default");
    const [filterPanelOpen, setFilterPanelOpen] = useState(false);
    const project = data?.project;

    const allUnits = useMemo(() => (project ? flattenCatalogUnits(project) : []), [project]);
    const priceBounds = useMemo(() => deriveUnitPriceBounds(allUnits), [allUnits]);

    const [appliedUnitFilters, setAppliedUnitFilters] = useState(() => createDefaultUnitFilters(priceBounds));
    const [draftUnitFilters, setDraftUnitFilters] = useState(() => createDefaultUnitFilters(priceBounds));
    const [priceSamples, setPriceSamples] = useState<number[]>([]);

    useEffect(() => {
        if (projectId) {
            onFilterChange({projectId});
        }
        // onFilterChange identity changes every withAxios render — do not add to deps.
    }, [projectId]);

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

    const apartmentCount = useMemo(() => {
        const scoped = allUnits.filter((unit) => {
            if (edificeId && unit.edificeId !== edificeId) return false;
            if (floorId && unit.floorId !== floorId) return false;
            return true;
        });
        if (activeFilter === "all") return scoped.length;
        return scoped.filter((unit) => unit.status === activeFilter).length;
    }, [allUnits, edificeId, floorId, activeFilter]);
    const filtersActive = hasActiveUnitFilters(appliedUnitFilters, priceBounds);

    const contentProps = project
        ? {resolveLanguageKey, currentLanguage, languageCode, project}
        : null;

    function openFilterPanel() {
        setDraftUnitFilters(appliedUnitFilters);
        setFilterPanelOpen(true);
    }

    function handleApplyFilters() {
        setAppliedUnitFilters(draftUnitFilters);
        setFilterPanelOpen(false);
    }

    function handleResetFilters() {
        const defaults = createDefaultUnitFilters(priceBounds);
        setDraftUnitFilters(defaults);
        setAppliedUnitFilters(defaults);
        setFilterPanelOpen(false);
    }

    return (
        <PublicPageShell nodeId="494:548" nodeName="Open project - Grid view">
            <PublicSection flush>
                <PageHeaderSection variant="light" />
            </PublicSection>
            {loading && !project ? (
                <PublicSection>
                    <div className="flex min-h-[400px] items-center justify-center">
                        <Loader />
                    </div>
                </PublicSection>
            ) : !project ? (
                <PublicSection>
                    <p className="font-aeonik-light text-lg text-pronix-ink-muted not-italic md:text-2xl">
                        {resolveLanguageKey("notFound")}
                    </p>
                </PublicSection>
            ) : (
                <>
                    <PublicSection nodeId="495:670">
                        <div className="flex flex-col gap-6 md:gap-8">
                            <OpenProjectGridToolbarSection
                                {...contentProps!}
                                apartmentCount={apartmentCount}
                                activeFilter={activeFilter}
                                onFilterChange={setActiveFilter}
                                sortKey={sortKey}
                                onSortChange={setSortKey}
                                filtersActive={filtersActive}
                                onOpenFilters={openFilterPanel}
                            />
                            <OpenProjectGridCardsSection
                                {...contentProps!}
                                activeFilter={activeFilter}
                                unitFilters={appliedUnitFilters}
                                priceBounds={priceBounds}
                                sortKey={sortKey}
                                edificeId={edificeId || undefined}
                                floorId={floorId || undefined}
                            />
                        </div>
                    </PublicSection>
                    <PublicSection nodeId="construction-progress">
                        <ConstructionProgressSection projectId={projectId!} />
                    </PublicSection>
                    <OpenProjectUnitsFilterPanel
                        open={filterPanelOpen}
                        draft={draftUnitFilters}
                        bounds={priceBounds}
                        priceSamples={priceSamples}
                        onClose={() => setFilterPanelOpen(false)}
                        onDraftChange={setDraftUnitFilters}
                        onApply={handleApplyFilters}
                        onReset={handleResetFilters}
                        resolveLanguageKey={resolveLanguageKey}
                    />
                </>
            )}
            <PublicSection nodeId="497:1211">
                <CtaSection />
            </PublicSection>
            <PublicSection nodeId="497:1231" flush fullBleed>
                <FooterSection />
            </PublicSection>
        </PublicPageShell>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/client/public/project/grid/index.tsx"),
    withAxios<MarketingProjectSingleResponse, {projectId: string}>(
        {method: "post", url: "/api/realEstate/marketingProjectCatalog/single", data: {}},
        true,
    ),
    withDebug(true, true),
)(ProjectGridPage);
