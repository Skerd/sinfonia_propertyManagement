import {
    useCallback,
    useEffect,
    useRef,
    useState,
    type MouseEvent,
    type PointerEvent as ReactPointerEvent,
    type SyntheticEvent,
} from "react";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    type CarouselApi,
} from "@coreModule/components/ui/carousel.tsx";

const DRAG_THRESHOLD_PX = 10;

type ProjectCardImageCarouselProps = {
    images: string[];
    alt: string;
};

function stopCardNavigation(event: SyntheticEvent) {
    event.preventDefault();
    event.stopPropagation();
}

function ProjectCardImageCarousel({images, alt}: ProjectCardImageCarouselProps) {
    const [api, setApi] = useState<CarouselApi | null>(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const pointerStartX = useRef<number | null>(null);
    const didDragRef = useRef(false);
    const canDrag = images.length > 1;

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

    /** Taps open the project; pans only block navigation after a real drag. */
    const handleCarouselClick = (event: MouseEvent<HTMLDivElement>) => {
        if (didDragRef.current) {
            stopCardNavigation(event);
            didDragRef.current = false;
        }
    };

    const showDots = canDrag;

    return (
        <div
            className="relative aspect-[515/449] min-h-[12.5rem] w-full overflow-hidden rounded-[2px]"
            onClick={handleCarouselClick}
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
                className={`size-full select-none ${canDrag ? "cursor-grab active:cursor-grabbing" : ""}`}
            >
                <CarouselContent className="-ml-0 size-full">
                    {images.map((image, index) => (
                        <CarouselItem key={`${image}-${index}`} className="basis-full pl-0">
                            <img
                                alt={index === 0 ? alt : `${alt} ${index + 1}`}
                                className="pointer-events-none aspect-[515/449] min-h-[12.5rem] size-full select-none object-cover"
                                src={image}
                                draggable={false}
                            />
                        </CarouselItem>
                    ))}
                </CarouselContent>
            </Carousel>

            {showDots && (
                <div
                    className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center gap-1.5"
                    data-node-id="277:227"
                >
                    {images.map((image, index) => (
                        <button
                            key={`dot-${image}-${index}`}
                            type="button"
                            aria-label={`Show image ${index + 1} of ${images.length}`}
                            aria-current={index === activeIndex ? "true" : undefined}
                            className={`pointer-events-auto shrink-0 rounded-full transition ${
                                index === activeIndex ? "h-3 w-8 bg-white" : "size-3 bg-white/50"
                            }`}
                            onClick={(event) => {
                                stopCardNavigation(event);
                                scrollTo(index);
                            }}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default ProjectCardImageCarousel;
