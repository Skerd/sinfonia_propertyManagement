import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    useCarousel,
} from "@coreModule/components/ui/carousel.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import PolygonSelector from "@coreModule/components/custom/polygonSelector.tsx";
import {
    resolveProjectFallbackImage,
    resolveProjectGalleryImages,
    resolveProjectGalleryMedia,
} from "@propertyManagementModule/clients/client/public/project/shared/resolveProjectFallbackImage.ts";
import type {
    MarketingEdificeListItem,
    MarketingProjectSingle,
} from "@propertyManagementModule/clients/client/public/shared/publicTypes.ts";

type GallerySlide =
    | {kind: "polygon"; key: "polygon"}
    | {kind: "image"; key: string; url: string}
    | {kind: "video"; key: string; url: string};

type OpenProjectFigmaGalleryStageProps = {
    project: MarketingProjectSingle;
    selectedEdificeId?: string;
    selectedEdifice?: MarketingEdificeListItem;
    onSelectEdifice?: (edificeId: string) => void;
};

function GalleryStageBody({
    slides,
    overlayImage,
    polygons,
    selectedEdificeId,
    onSelectEdifice,
}: {
    slides: GallerySlide[];
    overlayImage: string;
    polygons: NonNullable<MarketingProjectSingle["edificesCoordinates"]>;
    selectedEdificeId?: string;
    onSelectEdifice?: (edificeId: string) => void;
}) {
    const {api} = useCarousel();
    const [activeIndex, setActiveIndex] = useState(0);
    const videoRefs = useRef(new Map<number, HTMLVideoElement>());

    useEffect(() => {
        if (!api) {
            return;
        }
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
        if (!api) {
            return;
        }
        const root = api.rootNode();
        if (!root) {
            return;
        }
        let lastWidth = 0;
        const ro = new ResizeObserver((entries) => {
            const width = entries[0]?.contentRect.width ?? 0;
            if (width <= 0 || width === lastWidth) {
                return;
            }
            lastWidth = width;
            api.reInit();
        });
        ro.observe(root);
        return () => ro.disconnect();
    }, [api]);

    useEffect(() => {
        videoRefs.current.forEach((video, index) => {
            if (index !== activeIndex) {
                video.pause();
            }
        });
    }, [activeIndex]);

    const setVideoRef = useCallback(
        (index: number) => (el: HTMLVideoElement | null) => {
            if (el) {
                videoRefs.current.set(index, el);
                return;
            }
            videoRefs.current.delete(index);
        },
        [],
    );

    return (
        <>
            <CarouselContent className="ml-0 h-full">
                {slides.map((slide, index) => (
                    <CarouselItem key={slide.key} className="h-full min-h-0 pl-0">
                        {slide.kind === "polygon" ? (
                            <div className="relative size-full overflow-hidden [&_[data-slot=card]]:size-full [&_[data-slot=card]]:border-0 [&_[data-slot=card]]:bg-transparent [&_[data-slot=card]]:p-0 [&_[data-slot=card]]:shadow-none">
                                <PolygonSelector
                                    fillHeight
                                    dashboard
                                    borderless
                                    disabled
                                    hideControls
                                    objectFit="contain"
                                    objectPosition="top"
                                    phantomsAlwaysVisible
                                    imageUrl={overlayImage}
                                    phantomPoints={polygons}
                                    onFloorClick={(item) => onSelectEdifice?.(item._id)}
                                    stayHovered={selectedEdificeId}
                                    externalHoveredId={selectedEdificeId ?? ""}
                                    initialPoints={[]}
                                    onPointsChange={() => {}}
                                />
                            </div>
                        ) : slide.kind === "video" ? (
                            <div className="flex size-full cursor-grab items-center justify-center bg-black active:cursor-grabbing">
                                <video
                                    ref={setVideoRef(index)}
                                    src={slide.url}
                                    className="max-h-full max-w-full object-contain"
                                    controls
                                    playsInline
                                    preload="metadata"
                                    aria-label={`Video ${index + 1}`}
                                />
                            </div>
                        ) : (
                            <div className="flex size-full cursor-grab items-start justify-center active:cursor-grabbing">
                                <img
                                    alt=""
                                    className="pointer-events-none max-h-full max-w-full select-none object-contain object-top [-webkit-user-drag:none]"
                                    src={slide.url}
                                    draggable={false}
                                />
                            </div>
                        )}
                    </CarouselItem>
                ))}
            </CarouselContent>
            {slides.length > 1 ? (
                <div className="pointer-events-none absolute inset-x-0 bottom-6 z-30 flex justify-center">
                    <div className="pointer-events-auto flex gap-2 rounded-full bg-black/35 px-3 py-2">
                        {slides.map((slide, index) => (
                            <button
                                key={slide.key}
                                type="button"
                                aria-label={`Slide ${index + 1}`}
                                aria-current={index === activeIndex ? "true" : undefined}
                                onClick={() => api?.scrollTo(index)}
                                className={`h-2 rounded-full transition ${
                                    index === activeIndex ? "w-8 bg-white" : "w-2 bg-white/50"
                                }`}
                            />
                        ))}
                    </div>
                </div>
            ) : null}
        </>
    );
}

function OpenProjectFigmaGalleryStage({
    project,
    selectedEdificeId,
    selectedEdifice,
    onSelectEdifice,
}: OpenProjectFigmaGalleryStageProps) {
    const polygons = project.edificesCoordinates ?? [];
    const edificeCount = project.edifices?.length ?? 0;
    const showPolygons = edificeCount > 1 && polygons.length > 0 && Boolean(onSelectEdifice);
    const overlayImage =
        resolveProjectGalleryImages(project)[0]
        ?? selectedEdifice?.mainImage
        ?? resolveProjectFallbackImage(project);
    const media = useMemo(
        () => resolveProjectGalleryMedia(project, selectedEdifice),
        [project, selectedEdifice],
    );
    const slides = useMemo<GallerySlide[]>(() => {
        const next: GallerySlide[] = [];
        if (showPolygons) {
            next.push({kind: "polygon", key: "polygon"});
        }
        for (const item of media) {
            if (showPolygons && item.kind === "image" && item.url === overlayImage) {
                continue;
            }
            next.push({kind: item.kind, key: `${item.kind}-${item.url}`, url: item.url});
        }
        if (next.length === 0) {
            next.push({kind: "image", key: `image-${overlayImage}`, url: overlayImage});
        }
        return next;
    }, [media, overlayImage, showPolygons]);
    const canDrag = slides.length > 1;
    const carouselOpts = useMemo(
        () => ({
            loop: canDrag,
            align: "start" as const,
            dragFree: false,
            watchDrag: canDrag,
            dragThreshold: 10,
        }),
        [canDrag],
    );

    return (
        <div className="relative h-full min-h-[28rem] w-full overflow-hidden rounded-[5px] lg:min-h-0" data-node-id="472:1229">
            <Carousel
                key={selectedEdificeId ?? project._id}
                opts={carouselOpts}
                aria-label="Gallery"
                className={cn(
                    "absolute inset-0 size-full touch-pan-y select-none [&_[data-slot=carousel-content]]:size-full",
                    canDrag && "cursor-grab active:cursor-grabbing",
                )}
            >
                <GalleryStageBody
                    slides={slides}
                    overlayImage={overlayImage}
                    polygons={polygons}
                    selectedEdificeId={selectedEdificeId}
                    onSelectEdifice={onSelectEdifice}
                />
            </Carousel>
        </div>
    );
}

export default OpenProjectFigmaGalleryStage;
