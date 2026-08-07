import {type ComponentType, useEffect, useMemo} from "react";
import {compose} from "redux";
import {Link} from "react-router-dom";
import {ArrowUpRight} from "lucide-react";
import withLanguage from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import Loader from "@coreModule/components/custom/loader.tsx";
import DyeusPageShell from "@propertyManagementModule/clients/client/dyeus/shared/dyeusPageShell.tsx";
import DyeusHeader from "@propertyManagementModule/clients/client/dyeus/shared/dyeusHeader.tsx";
import DyeusFooter from "@propertyManagementModule/clients/client/dyeus/shared/dyeusFooter.tsx";
import {dyeusAssets} from "@propertyManagementModule/clients/client/dyeus/shared/dyeusAssets.ts";
import {useDyeusProjectId} from "@propertyManagementModule/clients/client/dyeus/shared/useDyeusProjectId.ts";
import {resolveMarketingMediaUrl} from "@propertyManagementModule/clients/client/public/shared/resolveMarketingMedia.ts";
import type {MarketingStoriesResponse} from "@propertyManagementModule/clients/client/public/shared/publicTypes.ts";

type AboutStoriesFilter = {
    projectId: string;
};

type AboutPageProps = WithAxiosType<MarketingStoriesResponse, AboutStoriesFilter>;

const introFacts = [
    {label: "Location:", value: "Dhermi, Albania"},
    {label: "Year:", value: "2027"},
    {label: "Project size:", value: "6500 m²"},
    {label: "Apartments:", value: "47"},
    {label: "Duplex:", value: "18"},
] as const;

const facilityFacts = [
    "150 Parking Spaces",
    "5100 m² Underground Parking Area",
    "3000 m² Landscape Green Area",
    "1 Boutique Hotel",
] as const;

const pressTickerItems = ["Appearances", "News & Press"] as const;

const fallbackPressStories = [
    {
        _id: "fallback-1",
        title: "A Local's Guide to Dhërmi, Beyond the Beaches",
        meta: "June 18, 2025 • News",
        image: dyeusAssets.aboutPress1,
        href: "/journal",
    },
    {
        _id: "fallback-2",
        title: "Where to Find the Best Sunsets on the Albanian Riviera",
        meta: "June 18, 2025 • News",
        image: dyeusAssets.aboutPress2,
        href: "/journal",
    },
    {
        _id: "fallback-3",
        title: "Seven Beaches Within Reach of DYEUS",
        meta: "June 18, 2025 • News",
        image: dyeusAssets.aboutPress3,
        href: "/journal",
    },
] as const;

function storyHref(storyId: string, projectId?: string) {
    const params = new URLSearchParams();
    params.set("storyId", storyId);
    if (projectId) params.set("projectId", projectId);
    return `/journal/story?${params.toString()}`;
}

function formatStoryMeta(publishedAt?: string, storyTypeName?: string) {
    const dateLabel = publishedAt
        ? new Date(publishedAt).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
          })
        : null;
    const typeLabel = storyTypeName || "News";
    if (dateLabel) return `${dateLabel} • ${typeLabel}`;
    return typeLabel;
}

function AboutPageInner({data, loading, error, onFilterChange}: AboutPageProps) {
    const {projectId, loading: resolvingProject} = useDyeusProjectId();

    useEffect(() => {
        if (!projectId) return;
        onFilterChange({projectId});
        // onFilterChange identity changes every withAxios render — do not add to deps.
    }, [projectId]);

    const liveStories = useMemo(() => {
        return (data?.stories ?? []).slice(0, 3).map((story) => ({
            _id: story._id,
            title: story.title,
            meta: formatStoryMeta(story.publishedAt, story.storyTypeName),
            image: resolveMarketingMediaUrl(story.mainImage) || dyeusAssets.aboutPress1,
            href: storyHref(story._id, projectId || story.projectId),
        }));
    }, [data?.stories, projectId]);

    const pressStories = liveStories.length > 0 ? liveStories : [...fallbackPressStories];
    const showPressLoader = resolvingProject || (loading && liveStories.length === 0 && !!projectId && !error);
    const pressTicker = [...pressTickerItems, ...pressTickerItems, ...pressTickerItems, ...pressTickerItems];

    return (
        <DyeusPageShell nodeId="199:35" nodeName="About us">
            <div className="relative">
                <DyeusHeader variant="solid" />

                <section className="mx-auto max-w-[1728px] px-6 pt-28 md:px-[60px] md:pt-36">
                    <h1 className="max-w-[1130px] font-dyeus-serif text-[clamp(2.25rem,5vw,4rem)] font-bold leading-none text-dyeus-ink">
                        The making of DYEUS, on the west-facing coast above Dhërmi, Albania
                    </h1>

                    <div className="mt-10 grid grid-cols-1 gap-3 font-dyeus-sans text-2xl leading-[1.2] text-dyeus-ink md:mt-14 md:grid-cols-[1fr_1.15fr] md:text-[32px]">
                        <a href="#introduction" className="transition-colors hover:text-dyeus-bronze">
                            About DYEUS
                        </a>
                        <a href="#making" className="transition-colors hover:text-dyeus-bronze">
                            From wild shore to residence
                        </a>
                    </div>
                </section>

                <section className="mt-6 w-full md:mt-8" aria-label="Coastline">
                    <div className="relative aspect-[1730/902] w-full overflow-hidden bg-dyeus-sand/40">
                        <video
                            autoPlay
                            loop
                            muted
                            playsInline
                            preload="auto"
                            poster={dyeusAssets.aboutHeroPoster}
                            aria-hidden
                            className="pointer-events-none absolute inset-0 size-full object-cover"
                            src={dyeusAssets.aboutHeroVideo}
                        />
                    </div>
                </section>

                <section
                    id="introduction"
                    className="mx-auto max-w-[1728px] scroll-mt-28 px-6 py-16 md:px-[60px] md:py-20"
                >
                    <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
                        <h2 className="font-dyeus-serif text-[32px] font-bold leading-[1.2] text-dyeus-ink">
                            Introduction
                        </h2>
                        <div className="w-full max-w-[802px]">
                            {introFacts.map((fact, index) => (
                                <div
                                    key={fact.label}
                                    className={`flex items-start justify-between gap-6 p-3 text-lg tracking-[0.46px] text-dyeus-ink md:text-2xl ${
                                        index === 0 ? "border-y border-dyeus-border" : "border-b border-dyeus-border"
                                    }`}
                                >
                                    <p className="font-dyeus-serif font-bold">{fact.label}</p>
                                    <p className="font-dyeus-serif text-right">{fact.value}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <p className="mt-10 ml-auto max-w-[415px] font-dyeus-serif text-base leading-[1.2] text-dyeus-ink md:mt-14 md:text-xl">
                        It comprises 65 residences across two typologies: 47 apartments and 18 duplexes,
                        arranged over a 6,500 m² site with 3,000 m² of landscaped grounds, each oriented to
                        the Ionian and opening onto a private sea-view terrace. Shared facilities include a
                        boutique hotel, infinity pools, a pool bar and restaurant, private beach, gardens,
                        and 150 parking spaces across a 5,100 m² underground level.
                    </p>
                </section>

                <section
                    id="making"
                    className="mx-auto max-w-[1728px] scroll-mt-28 px-6 pb-16 md:px-[60px] md:pb-24"
                >
                    <div className="grid gap-6 lg:grid-cols-[688fr_802fr] lg:gap-11">
                        <div className="relative aspect-[688/860] overflow-hidden bg-dyeus-sand/40">
                            <img
                                src={dyeusAssets.aboutPool}
                                alt=""
                                className="size-full object-cover"
                            />
                        </div>

                        <div className="flex flex-col gap-6">
                            <div className="grid gap-6 sm:grid-cols-2 sm:gap-11">
                                <div className="relative aspect-[379/473] overflow-hidden bg-dyeus-sand/40">
                                    <img
                                        src={dyeusAssets.aboutStairs}
                                        alt=""
                                        className="size-full object-cover"
                                    />
                                </div>
                                <div className="relative aspect-[379/473] overflow-hidden border border-dyeus-border bg-dyeus-cream">
                                    <img
                                        src={dyeusAssets.aboutPlan}
                                        alt=""
                                        className="size-full object-cover mix-blend-darken"
                                    />
                                </div>
                            </div>

                            <div className="flex items-end justify-between gap-6">
                                <div className="w-full max-w-[480px]">
                                    {facilityFacts.map((fact) => (
                                        <div
                                            key={fact}
                                            className="border-b border-dyeus-border p-3 font-dyeus-serif text-base leading-[1.2] text-dyeus-ink md:text-xl"
                                        >
                                            {fact}
                                        </div>
                                    ))}
                                </div>
                                <div className="hidden size-[120px] shrink-0 overflow-hidden md:block">
                                    <img
                                        src={dyeusAssets.mandala}
                                        alt=""
                                        className="relative left-[-36.85%] top-[-36.51%] size-[173.33%] max-w-none"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="mx-auto flex max-w-[1486px] flex-col items-center gap-10 px-6 py-16 md:gap-12 md:px-[60px] md:py-24">
                    <div className="h-[72px] w-px bg-dyeus-ink md:h-[124px]" aria-hidden />
                    <div className="space-y-6 text-center md:space-y-8">
                        <p className="font-dyeus-serif text-[clamp(1.75rem,4vw,4rem)] font-bold leading-none text-dyeus-ink">
                            We didn&apos;t set out to build on this coast. We set out to be worthy of it,{" "}
                            <span className="text-dyeus-bronze">
                                and to add only what Dhërmi could carry.
                            </span>
                        </p>
                        <p className="font-dyeus-serif text-2xl font-bold leading-[1.2] text-dyeus-ink md:text-[40px]">
                            Artech Group
                        </p>
                    </div>
                    <div className="h-[72px] w-px bg-dyeus-ink md:h-[124px]" aria-hidden />
                </section>

                <section className="mx-auto max-w-[1728px] px-6 pb-16 md:px-[60px] md:pb-24">
                    <div className="relative aspect-[1608/862] overflow-hidden bg-dyeus-sand/40">
                        <img
                            src={dyeusAssets.aboutArtech}
                            alt=""
                            className="size-full object-cover"
                        />
                    </div>
                    <div className="mt-8 flex flex-col gap-8 lg:mt-12 lg:flex-row lg:items-start lg:justify-between">
                        <h2 className="shrink-0 font-dyeus-serif text-[32px] font-bold leading-[1.2] text-dyeus-ink">
                            Artech Group
                        </h2>
                        <div className="grid w-full max-w-[972px] gap-7 md:grid-cols-2">
                            <p className="font-dyeus-serif text-base leading-none text-dyeus-ink md:text-xl">
                                ARTECH is a Tirana-based architecture studio working across Albania and
                                internationally, on projects from residential and hospitality to universities,
                                workplace and social housing. DYEUS draws on that breadth — a hospitality-grade
                                development shaped by a studio fluent across building types.
                            </p>
                            <p className="font-dyeus-serif text-base leading-none text-dyeus-ink md:text-xl">
                                ARTECH&apos;s work is thoughtful, contextual and forward-looking, pairing design
                                excellence with technical rigor. Shaped by collaborations with leading European
                                practices, the studio brings global experience and local knowledge to DYEUS,
                                drawing the residences from the Dhërmi coastline itself.
                            </p>
                        </div>
                    </div>
                </section>

                <section className="overflow-hidden pb-20 md:pb-28" aria-label="News and press">
                    <div className="dyeus-marquee mb-10 flex w-max items-center gap-12 md:mb-11">
                        {pressTicker.map((item, index) => (
                            <div key={`${item}-${index}`} className="flex items-center gap-12">
                                <div className="size-10 shrink-0 overflow-hidden md:size-[65px]">
                                    <img
                                        src={dyeusAssets.mandala}
                                        alt=""
                                        className="relative left-[-36.85%] top-[-36.51%] size-[173.33%] max-w-none"
                                    />
                                </div>
                                <p className="whitespace-nowrap font-dyeus-serif text-3xl font-bold leading-none text-dyeus-ink md:text-[64px]">
                                    {item}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className="mx-auto max-w-[1728px] px-6 md:px-[60px]">
                        {showPressLoader ? (
                            <div className="flex items-center justify-center py-24">
                                <Loader />
                            </div>
                        ) : (
                            <div className="grid gap-8 md:grid-cols-3">
                                {pressStories.map((story) => (
                                    <Link key={story._id} to={story.href} className="group block">
                                        <article className="relative aspect-[521/665] overflow-hidden bg-dyeus-sand/40">
                                            <img
                                                src={story.image}
                                                alt=""
                                                className="size-full object-cover transition duration-700 group-hover:scale-105"
                                            />
                                            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-black/5" />
                                            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-6">
                                                <div className="min-w-0 space-y-2">
                                                    <p className="font-dyeus-sans text-sm text-white/90 md:text-xl">
                                                        {story.meta}
                                                    </p>
                                                    <h3 className="font-dyeus-serif text-2xl font-extrabold leading-none text-white md:text-[32px]">
                                                        {story.title}
                                                    </h3>
                                                </div>
                                                <ArrowUpRight className="size-8 shrink-0 text-white transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                                            </div>
                                        </article>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            </div>
            <DyeusFooter />
        </DyeusPageShell>
    );
}

export default compose(
    withAxios<MarketingStoriesResponse, AboutStoriesFilter>(
        {method: "post", url: "/api/realEstate/marketingStories", data: {}},
        false,
    ),
    withLanguage("src/modules/propertyManagement/clients/client/dyeus/about/index.tsx"),
    withDebug(true, true),
)(AboutPageInner) as unknown as ComponentType;
