import {useEffect, type ReactNode} from "react";
import {compose} from "redux";
import {Link} from "react-router-dom";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import Loader from "@coreModule/components/custom/loader.tsx";
import PublicPageShell from "@propertyManagementModule/clients/client/public/shared/layout/publicPageShell.tsx";
import PublicSection from "@propertyManagementModule/clients/client/public/shared/layout/publicSection.tsx";
import PageHeaderSection from "@propertyManagementModule/clients/client/public/shared/sections/pageHeaderSection.tsx";
import {PUBLIC_CONTAINER} from "@propertyManagementModule/clients/client/public/shared/layout/publicLayoutTokens.ts";
import {useProjectId} from "@propertyManagementModule/clients/client/public/project/shared/useProjectId.ts";
import {MarketingProjectSingle} from "@propertyManagementModule/clients/client/public/shared/publicTypes.ts";

export type MarketingProjectSingleResponse = {project: MarketingProjectSingle};

export type OpenProjectContentProps = WithLanguageType & {
    project: MarketingProjectSingle;
};

function toContentProps(props: WithLanguageType, project: MarketingProjectSingle): OpenProjectContentProps {
    return {
        resolveLanguageKey: props.resolveLanguageKey,
        currentLanguage: props.currentLanguage,
        languageCode: props.languageCode,
        project,
    };
}

type OpenProjectShellProps = WithLanguageType &
    WithAxiosType<MarketingProjectSingleResponse, {projectId: string}> & {
        nodeId: string;
        nodeName: string;
        renderContent: (props: OpenProjectContentProps) => ReactNode;
    };

function OpenProjectShellInner({
    resolveLanguageKey,
    currentLanguage,
    languageCode,
    data,
    loading,
    onFilterChange,
    nodeId,
    nodeName,
    renderContent,
}: OpenProjectShellProps) {
    const projectId = useProjectId();

    useEffect(() => {
        if (projectId) {
            onFilterChange({projectId});
        }
        // onFilterChange identity changes every withAxios render — do not add to deps.
    }, [projectId]);

    const project = data?.project;

    return (
        <PublicPageShell nodeId={nodeId} nodeName={nodeName}>
            <PublicSection>
                <div className={`${PUBLIC_CONTAINER} flex min-h-[calc(100vh-120px)] flex-col gap-6 py-6`}>
                    <PageHeaderSection variant="light" />
                    {!projectId ? (
                        <p className="font-aeonik-light text-lg text-pronix-ink-muted md:text-2xl">
                            {resolveLanguageKey("missingProjectId")}
                        </p>
                    ) : loading && !project ? (
                        <div className="flex flex-1 items-center justify-center py-24">
                            <Loader />
                        </div>
                    ) : !project ? (
                        <p className="font-aeonik-light text-lg text-pronix-ink-muted md:text-2xl">
                            {resolveLanguageKey("notFound")}
                        </p>
                    ) : (
                        <>
                            <Link
                                to="/projects"
                                className="font-aeonik-light text-base text-pronix-blue hover:underline md:text-lg"
                            >
                                ← {resolveLanguageKey("backToProjects")}
                            </Link>
                            {renderContent(toContentProps({resolveLanguageKey, currentLanguage, languageCode}, project))}
                        </>
                    )}
                </div>
            </PublicSection>
        </PublicPageShell>
    );
}

export function createOpenProjectPage(
    languagePath: string,
    nodeId: string,
    nodeName: string,
    Content: (props: OpenProjectContentProps) => ReactNode,
) {
    function Page(props: WithLanguageType & WithAxiosType<MarketingProjectSingleResponse, {projectId: string}>) {
        return <OpenProjectShellInner {...props} nodeId={nodeId} nodeName={nodeName} renderContent={Content} />;
    }

    return compose(
        withLanguage(languagePath),
        withAxios<MarketingProjectSingleResponse, {projectId: string}>(
            {method: "post", url: "/api/realEstate/marketingProjectCatalog/single", data: {}},
            true,
        ),
        withDebug(true, true),
    )(Page);
}
