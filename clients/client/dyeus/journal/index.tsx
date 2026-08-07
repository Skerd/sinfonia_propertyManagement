import {type ComponentType, useEffect, useMemo, useState} from "react";
import {compose} from "redux";
import {Link} from "react-router-dom";
import {ArrowUpRight} from "lucide-react";
import withLanguage from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import Loader from "@coreModule/components/custom/loader.tsx";
import DyeusPageShell from "@propertyManagementModule/clients/client/dyeus/shared/dyeusPageShell.tsx";
import DyeusHeader from "@propertyManagementModule/clients/client/dyeus/shared/dyeusHeader.tsx";
import DyeusFooter from "@propertyManagementModule/clients/client/dyeus/shared/dyeusFooter.tsx";
import {useDyeusProjectId} from "@propertyManagementModule/clients/client/dyeus/shared/useDyeusProjectId.ts";
import {resolveMarketingMediaUrl} from "@propertyManagementModule/clients/client/public/shared/resolveMarketingMedia.ts";
import type {MarketingStoriesResponse} from "@propertyManagementModule/clients/client/public/shared/publicTypes.ts";
import DyeusMagazineSpread from "@propertyManagementModule/clients/client/dyeus/journal/dyeusMagazineSpread.tsx";

type JournalFilter = {
    projectId: string;
    storyTypeId?: string;
};

type JournalPageProps = WithAxiosType<MarketingStoriesResponse, JournalFilter>;

function storyHref(storyId: string, projectId?: string) {
    const params = new URLSearchParams();
    params.set("storyId", storyId);
    if (projectId) params.set("projectId", projectId);
    return `/journal/story?${params.toString()}`;
}

function JournalPageInner({data, loading, error, onFilterChange}: JournalPageProps) {
    const {projectId, loading: resolvingProject} = useDyeusProjectId();
    const [selectedStoryTypeId, setSelectedStoryTypeId] = useState<string>("");

    useEffect(() => {
        if (!projectId) return;
        const next: JournalFilter = {projectId};
        if (selectedStoryTypeId) next.storyTypeId = selectedStoryTypeId;
        onFilterChange(next);
        // onFilterChange identity changes every withAxios render — do not add to deps.
    }, [projectId, selectedStoryTypeId]);

    const stories = useMemo(() => data?.stories ?? [], [data?.stories]);
    const storyTypes = useMemo(() => data?.storyTypes ?? [], [data?.storyTypes]);
    const magazine = data?.magazine;
    const showLoader = resolvingProject || (loading && stories.length === 0 && !!projectId && !error);
    const showMagazine = !!(magazine?.title || magazine?.description || magazine?.fileUrl);

    return (
        <DyeusPageShell nodeId="89:9" nodeName="Journal">
            <div className="relative">
                <DyeusHeader variant="solid" />
                <div className="mx-auto max-w-[1440px] px-6 pb-20 pt-28 md:px-12 md:pb-28 md:pt-36">
                    <p className="font-dyeus-sans text-xs uppercase tracking-[0.24em] text-dyeus-bronze">Journal</p>
                    <div className="mt-4 flex flex-col gap-6 md:flex-row md:items-end md:justify-between md:gap-16">
                        <h1 className="font-dyeus-serif text-5xl md:text-7xl">Stories from Dyeus</h1>
                        <p className="max-w-[28rem] shrink-0 font-dyeus-sans text-base leading-relaxed text-dyeus-ink md:text-lg">
                            Notes from Dhërmi — on the building of DYEUS, the life of the coast, and what it
                            means to own a piece of the Albanian Riviera.
                        </p>
                    </div>

                    {storyTypes.length > 0 ? (
                        <div className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-3">
                            <span className="font-dyeus-sans text-sm text-dyeus-ink-muted md:text-base">
                                Filter by:
                            </span>
                            <button
                                type="button"
                                onClick={() => setSelectedStoryTypeId("")}
                                className={cn(
                                    "rounded-[5px] px-6 py-3 font-dyeus-sans text-base transition-colors md:text-lg",
                                    !selectedStoryTypeId
                                        ? "bg-dyeus-bronze text-white"
                                        : "text-dyeus-ink hover:text-dyeus-bronze",
                                )}
                            >
                                All
                            </button>
                            {storyTypes.map((type) => {
                                const active = selectedStoryTypeId === type._id;
                                return (
                                    <button
                                        key={type._id}
                                        type="button"
                                        onClick={() => setSelectedStoryTypeId(type._id)}
                                        className={cn(
                                            "rounded-[5px] px-6 py-3 font-dyeus-sans text-base transition-colors md:text-lg",
                                            active
                                                ? "bg-dyeus-bronze text-white"
                                                : "text-dyeus-ink hover:text-dyeus-bronze",
                                        )}
                                    >
                                        {type.name}
                                    </button>
                                );
                            })}
                        </div>
                    ) : null}

                    {showLoader ? (
                        <div className="mt-14 flex items-center justify-center py-24">
                            <Loader />
                        </div>
                    ) : !projectId || error || stories.length === 0 ? (
                        <p className="mt-14 font-dyeus-sans text-sm text-dyeus-ink-muted">
                            Stories will appear here once published.
                        </p>
                    ) : (
                        <div className="mt-14 grid gap-8 md:grid-cols-3">
                            {stories.map((story) => {
                                const image = resolveMarketingMediaUrl(story.mainImage);
                                return (
                                    <Link
                                        key={story._id}
                                        to={storyHref(story._id, projectId || story.projectId)}
                                        className="group block"
                                    >
                                        <article className="relative aspect-[521/665] overflow-hidden bg-dyeus-sand/40">
                                            {image ? (
                                                <img
                                                    src={image}
                                                    alt=""
                                                    className="size-full object-cover transition duration-700 group-hover:scale-105"
                                                />
                                            ) : null}
                                            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-black/5" />
                                            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-6">
                                                <div className="min-w-0">
                                                    {story.storyTypeName ? (
                                                        <p className="font-dyeus-sans text-sm text-white/90 md:text-base">
                                                            {story.storyTypeName}
                                                        </p>
                                                    ) : null}
                                                    <h2 className="mt-2 font-dyeus-serif text-2xl font-extrabold leading-tight text-white md:text-[32px]">
                                                        {story.title}
                                                    </h2>
                                                </div>
                                                <ArrowUpRight className="size-8 shrink-0 text-white transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                                            </div>
                                        </article>
                                    </Link>
                                );
                            })}
                        </div>
                    )}

                    {showMagazine ? (
                        <section
                            className="mt-20 border border-[rgba(24,24,24,0.2)] bg-[#ede9e0] px-6 py-10 md:mt-28 md:px-12 md:py-14"
                            data-node-id="398:129"
                        >
                            <div className="flex flex-col items-center gap-10 lg:flex-row lg:gap-16">
                                <div className="w-full shrink-0 overflow-hidden lg:w-[48%]">
                                    <DyeusMagazineSpread fileUrl={magazine?.fileUrl} />
                                </div>
                                <div className="flex w-full flex-col items-start gap-8 lg:w-[48%]">
                                    <div className="space-y-3">
                                        <h2 className="font-dyeus-serif text-4xl font-black leading-[1.1] text-[#061935] md:text-5xl lg:text-[64px]">
                                            {magazine?.title || "The DYEUS Magazine: A closer look"}
                                        </h2>
                                        {magazine?.description ? (
                                            <p className="font-dyeus-sans text-lg leading-[1.3] text-[rgba(6,25,53,0.7)] md:text-2xl">
                                                {magazine.description}
                                            </p>
                                        ) : null}
                                    </div>
                                    {magazine?.fileUrl ? (
                                        <a
                                            href={magazine.fileUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center justify-center rounded-[5px] border border-[rgba(24,24,24,0.2)] px-12 py-4 font-dyeus-serif text-xl font-bold text-dyeus-ink transition-colors hover:border-dyeus-ink hover:bg-dyeus-ink hover:text-dyeus-cream md:text-2xl"
                                        >
                                            View magazine
                                        </a>
                                    ) : null}
                                </div>
                            </div>
                        </section>
                    ) : null}
                </div>
            </div>
            <DyeusFooter />
        </DyeusPageShell>
    );
}

export default compose(
    withAxios<MarketingStoriesResponse, JournalFilter>(
        {method: "post", url: "/api/realEstate/marketingStories", data: {}},
        false,
    ),
    withLanguage("src/modules/propertyManagement/clients/client/dyeus/journal/index.tsx"),
    withDebug(true, true),
)(JournalPageInner) as unknown as ComponentType;
