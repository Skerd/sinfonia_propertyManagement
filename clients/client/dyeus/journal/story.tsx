import {
    type ComponentType,
    type MouseEvent,
    type PointerEvent as ReactPointerEvent,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import {compose} from "redux";
import {Link, useSearchParams} from "react-router-dom";
import {Play} from "lucide-react";
import withLanguage from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import Loader from "@coreModule/components/custom/loader.tsx";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    type CarouselApi,
} from "@coreModule/components/ui/carousel.tsx";
import DyeusPageShell from "@propertyManagementModule/clients/client/dyeus/shared/dyeusPageShell.tsx";
import DyeusHeader from "@propertyManagementModule/clients/client/dyeus/shared/dyeusHeader.tsx";
import DyeusFooter from "@propertyManagementModule/clients/client/dyeus/shared/dyeusFooter.tsx";
import DyeusMediaLightbox from "@propertyManagementModule/clients/client/dyeus/shared/dyeusMediaLightbox.tsx";
import {resolveMarketingMediaUrl} from "@propertyManagementModule/clients/client/public/shared/resolveMarketingMedia.ts";
import type {MarketingStorySingleResponse} from "@propertyManagementModule/clients/client/public/shared/publicTypes.ts";

type StoryPageProps = WithAxiosType<MarketingStorySingleResponse, {storyId: string}>;

type LightboxState =
    | {kind: "image"; index: number}
    | {kind: "video"; index: number}
    | null;

const DRAG_THRESHOLD_PX = 10;

function dedupeUrls(urls: Array<string | undefined | null>): string[] {
    const seen = new Set<string>();
    const result: string[] = [];
    for (const raw of urls) {
        const url = resolveMarketingMediaUrl(raw) ?? raw ?? undefined;
        if (!url || seen.has(url)) continue;
        seen.add(url);
        result.push(url);
    }
    return result;
}

function formatPublishedAt(value?: string) {
    if (!value) return undefined;
    try {
        return new Date(value).toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    } catch {
        return value;
    }
}

function StoryPageInner({data, loading, error, onFilterChange}: StoryPageProps) {
    const [searchParams] = useSearchParams();
    const storyId = searchParams.get("storyId")?.trim() ?? "";
    const projectId = searchParams.get("projectId")?.trim() ?? "";
    const story = data?.story;
    const requestedIdRef = useRef("");
    const [lightbox, setLightbox] = useState<LightboxState>(null);
    const [api, setApi] = useState<CarouselApi | null>(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const pointerStartX = useRef<number | null>(null);
    const didDragRef = useRef(false);

    useEffect(() => {
        if (!storyId) {
            requestedIdRef.current = "";
            return;
        }
        if (requestedIdRef.current === storyId) return;
        requestedIdRef.current = storyId;
        onFilterChange({storyId});
        // onFilterChange identity changes every withAxios render — do not add to deps.
    }, [storyId]);

    const images = useMemo(
        () => dedupeUrls([story?.mainImage, ...(story?.imageGallery ?? [])]),
        [story?.mainImage, story?.imageGallery],
    );
    const videos = useMemo(
        () => dedupeUrls(story?.videoGallery ?? []),
        [story?.videoGallery],
    );
    const canDrag = images.length > 1;

    useEffect(() => {
        if (!api) return;
        const onSelect = () => setActiveIndex(api.selectedScrollSnap());
        onSelect();
        api.on("select", onSelect);
        api.on("reInit", onSelect);
        return () => {
            api.off("select", onSelect);
            api.off("reInit", onSelect);
        };
    }, [api]);

    useEffect(() => {
        setActiveIndex(0);
        api?.scrollTo(0, true);
    }, [story?._id, api]);

    const scrollTo = useCallback(
        (index: number) => {
            api?.scrollTo(index);
        },
        [api],
    );

    const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
        if (!canDrag || event.button !== 0) return;
        pointerStartX.current = event.clientX;
        didDragRef.current = false;
    };

    const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
        if (pointerStartX.current == null) return;
        if (Math.abs(event.clientX - pointerStartX.current) >= DRAG_THRESHOLD_PX) {
            didDragRef.current = true;
        }
    };

    const handlePointerUp = () => {
        pointerStartX.current = null;
    };

    const handleSlideClick = (event: MouseEvent<HTMLButtonElement>, index: number) => {
        if (didDragRef.current) {
            event.preventDefault();
            didDragRef.current = false;
            return;
        }
        setLightbox({kind: "image", index});
    };

    const journalHref = projectId
        ? `/journal?projectId=${encodeURIComponent(projectId)}`
        : story?.projectId
            ? `/journal?projectId=${encodeURIComponent(story.projectId)}`
            : "/journal";

    const publishedLabel = formatPublishedAt(story?.publishedAt);
    const metaParts = [
        story?.projectName,
        story?.edificeName,
        story?.unitName,
    ].filter(Boolean);

    return (
        <DyeusPageShell nodeId="44:journal-story" nodeName="Journal Story">
            <div className="relative">
                <DyeusHeader variant="solid" />
                <div className="mx-auto max-w-[1440px] px-6 pb-20 pt-28 md:px-12 md:pb-28 md:pt-36">
                    <Link
                        to={journalHref}
                        className="font-dyeus-sans text-xs uppercase tracking-[0.2em] text-dyeus-ink-muted transition hover:text-dyeus-ink"
                    >
                        ← Journal
                    </Link>

                    {!storyId ? (
                        <p className="mt-10 font-dyeus-sans text-dyeus-ink-muted">Missing story parameter.</p>
                    ) : error ? (
                        <p className="mt-10 font-dyeus-sans text-dyeus-ink-muted">Unable to load this story.</p>
                    ) : loading && !story ? (
                        <div className="mt-20 flex justify-center">
                            <Loader />
                        </div>
                    ) : !story ? (
                        <p className="mt-10 font-dyeus-sans text-dyeus-ink-muted">Story not found.</p>
                    ) : (
                        <article className="mt-10">
                            <p className="font-dyeus-sans text-xs uppercase tracking-[0.24em] text-dyeus-bronze">
                                Journal
                            </p>
                            <h1 className="mt-4 max-w-4xl font-dyeus-serif text-4xl md:text-6xl lg:text-7xl">
                                {story.title}
                            </h1>

                            <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 font-dyeus-sans text-sm text-dyeus-ink-muted">
                                {publishedLabel ? <time dateTime={story.publishedAt}>{publishedLabel}</time> : null}
                                {metaParts.length > 0 ? (
                                    <span className="text-dyeus-ink/40">·</span>
                                ) : null}
                                {metaParts.length > 0 ? <span>{metaParts.join(" · ")}</span> : null}
                            </div>

                            {story.excerpt ? (
                                <p className="mt-8 max-w-3xl font-dyeus-sans text-lg leading-relaxed text-dyeus-ink-muted md:text-xl">
                                    {story.excerpt}
                                </p>
                            ) : null}

                            {images.length > 0 ? (
                                <div className="mt-12">
                                    <div
                                        className={`relative aspect-[16/9] w-full overflow-hidden bg-dyeus-sand/40 select-none [-webkit-user-select:none] md:aspect-[21/9] ${
                                            canDrag ? "cursor-grab active:cursor-grabbing" : ""
                                        }`}
                                        onPointerDown={handlePointerDown}
                                        onPointerMove={handlePointerMove}
                                        onPointerUp={handlePointerUp}
                                        onPointerCancel={handlePointerUp}
                                        aria-label="Image gallery"
                                    >
                                        <Carousel
                                            setApi={setApi}
                                            opts={{
                                                loop: canDrag,
                                                align: "start",
                                                dragFree: false,
                                                watchDrag: canDrag,
                                                dragThreshold: DRAG_THRESHOLD_PX,
                                            }}
                                            className="absolute inset-0 size-full select-none [&_[data-slot=carousel-content]]:h-full"
                                        >
                                            <CarouselContent className="-ml-0 h-full">
                                                {images.map((src, index) => (
                                                    <CarouselItem key={`${src}-${index}`} className="h-full basis-full pl-0">
                                                        <button
                                                            type="button"
                                                            className="size-full cursor-zoom-in"
                                                            onClick={(event) => handleSlideClick(event, index)}
                                                            aria-label={`Open image ${index + 1}`}
                                                        >
                                                            <img
                                                                src={src}
                                                                alt=""
                                                                className="pointer-events-none size-full select-none object-cover [-webkit-user-drag:none]"
                                                                draggable={false}
                                                            />
                                                        </button>
                                                    </CarouselItem>
                                                ))}
                                            </CarouselContent>
                                        </Carousel>
                                    </div>

                                    {images.length > 1 ? (
                                        <div className="mt-4 flex items-center justify-center gap-3">
                                            {images.map((_, index) => (
                                                <button
                                                    key={index}
                                                    type="button"
                                                    onClick={() => scrollTo(index)}
                                                    className="rounded-full transition"
                                                    style={{
                                                        width: index === activeIndex ? 48 : 20,
                                                        height: 8,
                                                        background:
                                                            index === activeIndex
                                                                ? "#8B6B4A"
                                                                : "rgba(36, 28, 22, 0.2)",
                                                    }}
                                                    aria-label={`Slide ${index + 1}`}
                                                />
                                            ))}
                                        </div>
                                    ) : null}
                                </div>
                            ) : null}

                            <div className="mx-auto mt-12 max-w-3xl">
                                <div className="whitespace-pre-wrap font-dyeus-sans text-base leading-[1.8] text-dyeus-ink md:text-lg">
                                    {story.content}
                                </div>
                            </div>

                            {videos.length > 0 ? (
                                <section className="mt-16" aria-label="Video gallery">
                                    <p className="mb-6 font-dyeus-sans text-xs uppercase tracking-[0.2em] text-dyeus-bronze">
                                        Videos
                                    </p>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        {videos.map((src, index) => (
                                            <button
                                                key={src}
                                                type="button"
                                                onClick={() => setLightbox({kind: "video", index})}
                                                className="group relative aspect-video cursor-pointer overflow-hidden bg-dyeus-sand"
                                                aria-label={`Play video ${index + 1}`}
                                            >
                                                <video
                                                    src={src}
                                                    muted
                                                    playsInline
                                                    preload="metadata"
                                                    className="pointer-events-none size-full object-cover"
                                                />
                                                <span className="absolute inset-0 flex items-center justify-center bg-dyeus-ink/25 transition group-hover:bg-dyeus-ink/40">
                                                    <span className="flex size-14 items-center justify-center rounded-full bg-dyeus-cream/95 text-dyeus-ink shadow-sm">
                                                        <Play className="ml-0.5 size-6 fill-current" strokeWidth={1.25} />
                                                    </span>
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </section>
                            ) : null}
                        </article>
                    )}
                </div>
            </div>
            <DyeusFooter />

            {lightbox ? (
                <DyeusMediaLightbox
                    kind={lightbox.kind}
                    images={images}
                    videos={videos}
                    initialIndex={lightbox.index}
                    onClose={() => setLightbox(null)}
                />
            ) : null}
        </DyeusPageShell>
    );
}

export default compose(
    withAxios<MarketingStorySingleResponse, {storyId: string}>(
        {method: "post", url: "/api/realEstate/marketingStories/single", data: {}},
        true,
    ),
    withLanguage("src/modules/propertyManagement/clients/client/dyeus/journal/story.tsx"),
    withDebug(true, true),
)(StoryPageInner) as unknown as ComponentType;
