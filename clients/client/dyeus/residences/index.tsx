import {useEffect} from "react";
import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import Loader from "@coreModule/components/custom/loader.tsx";
import DyeusPageShell from "@propertyManagementModule/clients/client/dyeus/shared/dyeusPageShell.tsx";
import DyeusHeader from "@propertyManagementModule/clients/client/dyeus/shared/dyeusHeader.tsx";
import DyeusFooter from "@propertyManagementModule/clients/client/dyeus/shared/dyeusFooter.tsx";
import {useDyeusProjectId} from "@propertyManagementModule/clients/client/dyeus/shared/useDyeusProjectId.ts";
import DyeusResidencesProjectInfo from "@propertyManagementModule/clients/client/dyeus/residences/dyeusResidencesProjectInfo.tsx";
import DyeusResidencesPolygonViewer from "@propertyManagementModule/clients/client/dyeus/residences/dyeusResidencesPolygonViewer.tsx";
import DyeusResidencesUnitsGrid from "@propertyManagementModule/clients/client/dyeus/residences/dyeusResidencesUnitsGrid.tsx";
import type {MarketingProjectSingle} from "@propertyManagementModule/clients/client/public/shared/publicTypes.ts";

type MarketingProjectSingleResponse = {project: MarketingProjectSingle};

type ResidencesPageProps = WithLanguageType &
    WithAxiosType<MarketingProjectSingleResponse, {projectId: string}>;

function ResidencesPage({data, loading, onFilterChange, resolveLanguageKey}: ResidencesPageProps) {
    const t = (key: string) => String(resolveLanguageKey(key));
    const {projectId, loading: resolvingProject} = useDyeusProjectId();

    useEffect(() => {
        if (projectId) {
            onFilterChange({projectId});
        }
        // onFilterChange identity changes every withAxios render — do not add to deps.
    }, [projectId]);

    const project = data?.project;

    return (
        <DyeusPageShell nodeId="44:residences" nodeName={t("eyebrow")}>
            <div className="relative">
                <DyeusHeader variant="solid" />
                <div className="mx-auto max-w-[1440px] px-6 pb-16 pt-28 md:px-12 md:pt-36">
                    <p className="font-dyeus-sans text-xs uppercase tracking-[0.24em] text-dyeus-bronze">
                        {t("eyebrow")}
                    </p>
                    <h1 className="mt-3 font-dyeus-serif text-5xl md:text-7xl">
                        {project?.name ?? t("fallbackTitle")}
                    </h1>

                    {(resolvingProject || (loading && !project)) && (
                        <div className="mt-12 flex min-h-[50vh] items-center justify-center">
                            <Loader />
                        </div>
                    )}

                    {!resolvingProject && !projectId && (
                        <p className="mt-12 font-dyeus-sans text-sm text-dyeus-ink-muted">
                            {t("noProject")}
                        </p>
                    )}

                    {project ? (
                        <div className="mt-8 flex flex-col gap-10 md:mt-10 md:gap-16">
                            <DyeusResidencesProjectInfo project={project} />
                            <DyeusResidencesPolygonViewer project={project} />
                            <DyeusResidencesUnitsGrid project={project} />
                        </div>
                    ) : null}
                </div>
            </div>
            <DyeusFooter />
        </DyeusPageShell>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/client/dyeus/residences/index.tsx"),
    withAxios<MarketingProjectSingleResponse, {projectId: string}>(
        {method: "post", url: "/api/realEstate/marketingProjectCatalog/single", data: {}},
        true,
    ),
    withDebug(true, true),
)(ResidencesPage);
