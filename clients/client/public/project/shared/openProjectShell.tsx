import {useEffect, type ReactNode} from "react";
import {compose} from "redux";
import {Link} from "react-router-dom";
import {ChevronLeft} from "lucide-react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import Loader from "@coreModule/components/custom/loader.tsx";
import PublicPageShell from "@propertyManagementModule/clients/client/public/shared/layout/publicPageShell.tsx";
import PublicSection from "@propertyManagementModule/clients/client/public/shared/layout/publicSection.tsx";
import PageHeaderSection from "@propertyManagementModule/clients/client/public/shared/sections/pageHeaderSection.tsx";
import {useProjectId} from "@propertyManagementModule/clients/client/public/project/shared/useProjectId.ts";
import {MarketingProjectSingle} from "@propertyManagementModule/clients/client/public/shared/publicTypes.ts";
import {PUBLIC_GALLERY_PAGE_TITLE} from "@propertyManagementModule/clients/client/public/shared/layout/publicLayoutTokens.ts";

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
            <PublicSection flush>
                <PageHeaderSection variant="light" />
            </PublicSection>
            {!projectId ? (
                <PublicSection>
                    <p className="font-aeonik-light text-lg text-pronix-ink-muted md:text-2xl">
                        {resolveLanguageKey("missingProjectId")}
                    </p>
                </PublicSection>
            ) : loading && !project ? (
                <PublicSection>
                    <div className="flex min-h-[400px] items-center justify-center">
                        <Loader />
                    </div>
                </PublicSection>
            ) : !project ? (
                <PublicSection>
                    <p className="font-aeonik-light text-lg text-pronix-ink-muted md:text-2xl">
                        {resolveLanguageKey("notFound")}
                    </p>
                </PublicSection>
            ) : (
                <>
                    <PublicSection flush contentFrame>
                        <div className="flex min-w-0 items-center gap-2 sm:gap-3 md:gap-4">
                            <Link
                                to="/projects"
                                className="-ml-2 flex shrink-0 items-center justify-center rounded-[5px] p-1 text-pronix-ink transition hover:bg-[rgba(24,24,24,0.04)] sm:-ml-2.5 md:-ml-3"
                                aria-label={String(resolveLanguageKey("backToProjects"))}
                            >
                                <ChevronLeft className="size-8 sm:size-10 md:size-12" strokeWidth={1.5} aria-hidden />
                            </Link>
                            <h1 className={`min-w-0 flex-1 wrap-break-word ${PUBLIC_GALLERY_PAGE_TITLE}`}>
                                {project.name}
                            </h1>
                        </div>
                    </PublicSection>
                    <PublicSection>
                        <div className="flex min-h-[calc(100vh-200px)] flex-col gap-4 md:gap-6">
                            {renderContent(toContentProps({resolveLanguageKey, currentLanguage, languageCode}, project))}
                        </div>
                    </PublicSection>
                </>
            )}
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
