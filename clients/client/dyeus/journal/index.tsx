import {type ComponentType, useEffect, useMemo} from "react";
import {compose} from "redux";
import {Link} from "react-router-dom";
import withLanguage from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import Loader from "@coreModule/components/custom/loader.tsx";
import DyeusPageShell from "@propertyManagementModule/clients/client/dyeus/shared/dyeusPageShell.tsx";
import DyeusHeader from "@propertyManagementModule/clients/client/dyeus/shared/dyeusHeader.tsx";
import DyeusFooter from "@propertyManagementModule/clients/client/dyeus/shared/dyeusFooter.tsx";
import {useDyeusProjectId} from "@propertyManagementModule/clients/client/dyeus/shared/useDyeusProjectId.ts";
import {resolveMarketingMediaUrl} from "@propertyManagementModule/clients/client/public/shared/resolveMarketingMedia.ts";
import type {MarketingStoriesResponse} from "@propertyManagementModule/clients/client/public/shared/publicTypes.ts";

type JournalPageProps = WithAxiosType<MarketingStoriesResponse, {projectId: string}>;

function storyHref(storyId: string, projectId?: string) {
    const params = new URLSearchParams();
    params.set("storyId", storyId);
    if (projectId) params.set("projectId", projectId);
    return `/journal/story?${params.toString()}`;
}

function JournalPageInner({data, loading, error, onFilterChange}: JournalPageProps) {
    const {projectId, loading: resolvingProject} = useDyeusProjectId();

    useEffect(() => {
        if (projectId) {
            onFilterChange({projectId});
        }
        // onFilterChange identity changes every withAxios render — do not add to deps.
    }, [projectId]);

    const stories = useMemo(() => data?.stories ?? [], [data?.stories]);
    const showLoader = resolvingProject || (loading && stories.length === 0 && !!projectId);

    return (
        <DyeusPageShell nodeId="44:journal" nodeName="Journal">
            <div className="relative">
                <DyeusHeader variant="solid" />
                <div className="mx-auto max-w-[1440px] px-6 pb-20 pt-28 md:px-12 md:pb-28 md:pt-36">
                    <p className="font-dyeus-sans text-xs uppercase tracking-[0.24em] text-dyeus-bronze">Journal</p>
                    <h1 className="mt-4 font-dyeus-serif text-5xl md:text-7xl">Stories from Dyeus</h1>

                    {showLoader ? (
                        <div className="mt-14 flex items-center justify-center py-24">
                            <Loader />
                        </div>
                    ) : !projectId || error || stories.length === 0 ? (
                        <p className="mt-14 font-dyeus-sans text-sm text-dyeus-ink-muted">
                            Stories will appear here once published.
                        </p>
                    ) : (
                        <div className="mt-14 grid gap-10 md:grid-cols-3">
                            {stories.map((story) => {
                                const image = resolveMarketingMediaUrl(story.mainImage);
                                return (
                                    <Link
                                        key={story._id}
                                        to={storyHref(story._id, projectId || story.projectId)}
                                        className="group block"
                                    >
                                        <article>
                                            <div className="relative aspect-[4/3] overflow-hidden bg-dyeus-sand/40">
                                                {image ? (
                                                    <img
                                                        src={image}
                                                        alt=""
                                                        className="size-full object-cover transition duration-700 group-hover:scale-105"
                                                    />
                                                ) : null}
                                            </div>
                                            <h2 className="mt-5 font-dyeus-serif text-2xl transition group-hover:text-dyeus-bronze md:text-3xl">
                                                {story.title}
                                            </h2>
                                            {story.excerpt ? (
                                                <p className="mt-3 font-dyeus-sans text-sm leading-relaxed text-dyeus-ink-muted">
                                                    {story.excerpt}
                                                </p>
                                            ) : null}
                                        </article>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
            <DyeusFooter />
        </DyeusPageShell>
    );
}

export default compose(
    withAxios<MarketingStoriesResponse, {projectId: string}>(
        {method: "post", url: "/api/realEstate/marketingStories", data: {}},
        false,
    ),
    withLanguage("src/modules/propertyManagement/clients/client/dyeus/journal/index.tsx"),
    withDebug(true, true),
)(JournalPageInner) as unknown as ComponentType;
