import {
    useCallback,
    useEffect,
    useRef,
    useState,
    type MouseEvent,
    type PointerEvent as ReactPointerEvent,
} from "react";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    type CarouselApi,
} from "@coreModule/components/ui/carousel.tsx";
import ImageLightbox from "@propertyManagementModule/clients/client/public/shared/imageLightbox.tsx";
import {OpenProjectContentProps} from "@propertyManagementModule/clients/client/public/project/shared/openProjectShell.tsx";
import {resolveProjectGalleryImages} from "@propertyManagementModule/clients/client/public/project/shared/resolveProjectFallbackImage.ts";
import {projectsAssets} from "@propertyManagementModule/clients/client/public/projects/projectsAssets.ts";
import {
    PUBLIC_BODY,
    PUBLIC_SUBTITLE,
} from "@propertyManagementModule/clients/client/public/shared/layout/publicLayoutTokens.ts";

const DRAG_THRESHOLD_PX = 10;
const MOBILE_DESCRIPTION_COLLAPSE_CHARS = 180;

function OpenProjectGallerySection({project, resolveLanguageKey}: OpenProjectContentProps) {
    const displayImages = resolveProjectGalleryImages(project);
    const [api, setApi] = useState<CarouselApi | null>(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [descriptionExpanded, setDescriptionExpanded] = useState(false);
    const pointerStartX = useRef<number | null>(null);
    const didDragRef = useRef(false);
    const canDrag = displayImages.length > 1;

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

    const scrollTo = useCallback(
        (index: number) => {
            api?.scrollTo(index);
        },
        [api],
    );

    const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
        if (!canDrag || event.button !== 0) {
            return;
        }
        pointerStartX.current = event.clientX;
        didDragRef.current = false;
    };

    const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
        if (pointerStartX.current == null) {
            return;
        }
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
        setActiveIndex(index);
        setLightboxOpen(true);
    };

    const stats: {icon: string; label: string}[] = [];
    if (project.floorCount != null) {
        stats.push({
            icon: projectsAssets.iconFloors,
            label: `${project.floorCount} ${resolveLanguageKey("floors")}`,
        });
    }
    if (project.unitCount != null) {
        stats.push({
            icon: projectsAssets.iconUnits,
            label: `${project.unitCount} ${resolveLanguageKey("units")}`,
        });
    }
    if (project.edificeCount != null) {
        stats.push({
            icon: projectsAssets.iconBuild,
            label: `${project.edificeCount} ${resolveLanguageKey("buildings")}`,
        });
    }
    if (project.availableUnitCount != null) {
        stats.push({
            icon: projectsAssets.iconUnits,
            label: `${project.availableUnitCount} ${resolveLanguageKey("available")}`,
        });
    }

    const amenities = (project.amenities ?? []).filter((item) => item.trim().length > 0);

    const gallery = (
        <div className="relative flex min-w-0 flex-col" data-node-id="472:1229">
            <div
                className={`relative aspect-[963/605] w-full max-h-[70vh] overflow-hidden rounded-[5px] bg-[rgba(24,24,24,0.05)] select-none [-webkit-user-select:none] ${
                    canDrag ? "cursor-grab active:cursor-grabbing" : ""
                }`}
                data-node-id="472:1203"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
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
                        {displayImages.map((image, index) => (
                            <CarouselItem key={`${image}-${index}`} className="h-full basis-full pl-0">
                                <button
                                    type="button"
                                    className="flex size-full cursor-zoom-in items-center justify-center"
                                    onClick={(event) => handleSlideClick(event, index)}
                                >
                                    <img
                                        alt={index === 0 ? project.name : `${project.name} ${index + 1}`}
                                        className="pointer-events-none max-h-full max-w-full select-none object-contain [-webkit-user-drag:none]"
                                        src={image}
                                        draggable={false}
                                    />
                                </button>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                </Carousel>
            </div>
            {displayImages.length > 1 && (
                <div className="mt-4 flex items-center justify-center gap-3" data-node-id="472:1230">
                    {displayImages.map((_, index) => (
                        <button
                            key={index}
                            type="button"
                            onClick={() => scrollTo(index)}
                            className="rounded-full transition"
                            style={{
                                width: index === activeIndex ? 58.5 : 24,
                                height: 24,
                                background: index === activeIndex ? "#0247fe" : "rgba(24, 24, 24, 0.2)",
                            }}
                            aria-label={`Slide ${index + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );

    return (
        <div className="w-full" data-node-id="472:1198">
            {/*
              Mobile: location → gallery → description.
              Desktop: gallery floats right; location + description wrap beside and under it.
            */}
            <div className="flex flex-col gap-4 md:block md:flow-root">
                <div className="order-2 w-full min-w-0 md:order-none md:float-right md:mb-6 md:ml-8 md:w-[min(100%,58%)]">
                    {gallery}
                </div>

                {project.location && (
                    <p className={`order-1 md:order-none ${PUBLIC_SUBTITLE}`} data-node-id="472:1200">
                        {project.location}
                    </p>
                )}

                {project.description?.trim() ? (
                    <div className="order-3 md:order-none">
                        <p
                            className={`${PUBLIC_BODY} ${
                                !descriptionExpanded ? "line-clamp-4 md:line-clamp-none" : ""
                            }`}
                        >
                            {project.description}
                        </p>
                        {project.description.trim().length > MOBILE_DESCRIPTION_COLLAPSE_CHARS && (
                            <button
                                type="button"
                                className="mt-2 font-aeonik-medium text-base text-pronix-blue hover:underline md:hidden"
                                onClick={() => setDescriptionExpanded((open) => !open)}
                                aria-expanded={descriptionExpanded}
                            >
                                {resolveLanguageKey(descriptionExpanded ? "readLess" : "readMore")}
                            </button>
                        )}
                    </div>
                ) : null}
            </div>

            <div className="mt-6 flex flex-col gap-4">
                {stats.length > 0 && (
                    <div className="flex flex-wrap gap-3">
                        {stats.map((stat) => (
                            <span
                                key={stat.label}
                                className="inline-flex items-center gap-2 rounded-full border border-pronix-border px-4 py-2 font-aeonik-light text-base text-pronix-ink"
                            >
                                <img alt="" aria-hidden className="size-5" src={stat.icon} />
                                {stat.label}
                            </span>
                        ))}
                    </div>
                )}

                {project.minSharePrice != null && (
                    <p className="font-aeonik-medium text-xl text-pronix-blue not-italic md:text-2xl">
                        {resolveLanguageKey("fromPrice")} €{project.minSharePrice.toLocaleString()}
                        {project.projectedYieldPercent != null
                            ? ` · ${project.projectedYieldPercent}% ${resolveLanguageKey("yieldLabel")}`
                            : ""}
                    </p>
                )}

                {amenities.length > 0 && (
                    <div className="flex flex-col gap-2">
                        <p className="font-aeonik-medium text-base text-pronix-ink md:text-lg">
                            {resolveLanguageKey("amenitiesTitle")}
                        </p>
                        <ul className="flex flex-wrap gap-2">
                            {amenities.map((amenity) => (
                                <li
                                    key={amenity}
                                    className="rounded-[5px] bg-[rgba(24,24,24,0.04)] px-3 py-1.5 font-aeonik-light text-sm text-pronix-ink md:text-base"
                                >
                                    {amenity}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {lightboxOpen && (
                <ImageLightbox images={displayImages} initialIndex={activeIndex} onClose={() => setLightboxOpen(false)} />
            )}
        </div>
    );
}

export default OpenProjectGallerySection;
