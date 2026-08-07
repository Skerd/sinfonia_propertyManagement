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
import DyeusMediaLightbox from "@propertyManagementModule/clients/client/dyeus/shared/dyeusMediaLightbox.tsx";
import {resolveProjectGalleryImages} from "@propertyManagementModule/clients/client/public/project/shared/resolveProjectFallbackImage.ts";
import {dyeusAssets} from "@propertyManagementModule/clients/client/dyeus/shared/dyeusAssets.ts";
import type {MarketingProjectSingle} from "@propertyManagementModule/clients/client/public/shared/publicTypes.ts";

const DRAG_THRESHOLD_PX = 10;
const MOBILE_DESCRIPTION_COLLAPSE_CHARS = 180;

type DyeusResidencesProjectInfoProps = {
    project: MarketingProjectSingle;
};

function DyeusResidencesProjectInfo({project}: DyeusResidencesProjectInfoProps) {
    const displayImages = resolveProjectGalleryImages(project);
    const [api, setApi] = useState<CarouselApi | null>(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [descriptionExpanded, setDescriptionExpanded] = useState(false);
    const pointerStartX = useRef<number | null>(null);
    const didDragRef = useRef(false);
    const canDrag = displayImages.length > 1;

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
        setActiveIndex(index);
        setLightboxOpen(true);
    };

    const stats: string[] = [];
    if (project.floorCount != null) stats.push(`${project.floorCount} Floors`);
    if (project.unitCount != null) stats.push(`${project.unitCount} Units`);
    if (project.edificeCount != null) stats.push(`${project.edificeCount} Buildings`);
    if (project.availableUnitCount != null) stats.push(`${project.availableUnitCount} Available`);

    const amenities = (project.amenities ?? []).filter((item) => item.trim().length > 0);
    const location = [project.location, project.city].filter(Boolean).join(" · ");

    const gallery = (
        <div className="relative flex min-w-0 flex-col">
            <div
                className={`relative aspect-[963/605] w-full max-h-[70vh] overflow-hidden bg-dyeus-sand select-none [-webkit-user-select:none] ${
                    canDrag ? "cursor-grab active:cursor-grabbing" : ""
                }`}
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
                                        className="pointer-events-none max-h-full max-w-full select-none object-cover [-webkit-user-drag:none]"
                                        src={image || dyeusAssets.villaFeature}
                                        draggable={false}
                                    />
                                </button>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                </Carousel>
            </div>
            {displayImages.length > 1 && (
                <div className="mt-4 flex items-center justify-center gap-3">
                    {displayImages.map((_, index) => (
                        <button
                            key={index}
                            type="button"
                            onClick={() => scrollTo(index)}
                            className="rounded-full transition"
                            style={{
                                width: index === activeIndex ? 48 : 20,
                                height: 8,
                                background: index === activeIndex ? "#8B6B4A" : "rgba(36, 28, 22, 0.2)",
                            }}
                            aria-label={`Slide ${index + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );

    return (
        <div className="w-full">
            {/*
              Mobile: location → gallery → description.
              Desktop: gallery floats right; location + description wrap beside and under it.
            */}
            <div className="flex flex-col gap-4 md:block md:flow-root">
                <div className="order-2 w-full min-w-0 md:order-none md:float-right md:mb-6 md:ml-8 md:w-[min(100%,58%)]">
                    {gallery}
                </div>

                {location ? (
                    <p className="order-1 font-dyeus-sans text-base text-dyeus-ink-muted md:order-none md:text-lg">
                        {location}
                    </p>
                ) : null}

                {project.description?.trim() ? (
                    <div className="order-3 md:order-none">
                        <p
                            className={`whitespace-pre-line font-dyeus-sans text-sm leading-relaxed text-dyeus-ink md:text-base ${
                                !descriptionExpanded ? "line-clamp-4 md:line-clamp-none" : ""
                            }`}
                        >
                            {project.description}
                        </p>
                        {project.description.trim().length > MOBILE_DESCRIPTION_COLLAPSE_CHARS && (
                            <button
                                type="button"
                                className="mt-2 font-dyeus-sans text-sm text-dyeus-bronze underline underline-offset-4 md:hidden"
                                onClick={() => setDescriptionExpanded((open) => !open)}
                                aria-expanded={descriptionExpanded}
                            >
                                {descriptionExpanded ? "Read less" : "Read more"}
                            </button>
                        )}
                    </div>
                ) : null}
            </div>

            <div className="mt-6 flex flex-col gap-4">
                {stats.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {stats.map((stat) => (
                            <span
                                key={stat}
                                className="inline-flex items-center border border-dyeus-border px-4 py-2 font-dyeus-sans text-sm text-dyeus-ink"
                            >
                                {stat}
                            </span>
                        ))}
                    </div>
                )}

                {project.minSharePrice != null && (
                    <p className="font-dyeus-serif text-2xl text-dyeus-bronze md:text-3xl">
                        From €{project.minSharePrice.toLocaleString()}
                        {project.projectedYieldPercent != null
                            ? ` · ${project.projectedYieldPercent}% yield`
                            : ""}
                    </p>
                )}

                {amenities.length > 0 && (
                    <div className="flex flex-col gap-2">
                        <p className="font-dyeus-sans text-xs uppercase tracking-[0.2em] text-dyeus-bronze">
                            Amenities
                        </p>
                        <ul className="flex flex-wrap gap-2">
                            {amenities.map((amenity) => (
                                <li
                                    key={amenity}
                                    className="bg-dyeus-sand px-3 py-1.5 font-dyeus-sans text-sm text-dyeus-ink"
                                >
                                    {amenity}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {lightboxOpen && (
                <DyeusMediaLightbox
                    kind="image"
                    images={displayImages}
                    initialIndex={activeIndex}
                    onClose={() => setLightboxOpen(false)}
                />
            )}
        </div>
    );
}

export default DyeusResidencesProjectInfo;
