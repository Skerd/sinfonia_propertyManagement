import {useCallback, useEffect, useState} from "react";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    type CarouselApi,
} from "@coreModule/components/ui/carousel.tsx";
import PolygonSelector from "@coreModule/components/custom/polygonSelector.tsx";
import {resolveProjectGalleryImages} from "@propertyManagementModule/clients/client/public/project/shared/resolveProjectFallbackImage.ts";
import type {MarketingProjectSingle} from "@propertyManagementModule/clients/client/public/shared/publicTypes.ts";

type OpenProjectFigmaGalleryStageProps = {
    project: MarketingProjectSingle;
    selectedEdificeId?: string;
    onSelectEdifice?: (edificeId: string) => void;
};

function OpenProjectFigmaGalleryStage({
    project,
    selectedEdificeId,
    onSelectEdifice,
}: OpenProjectFigmaGalleryStageProps) {
    const images = resolveProjectGalleryImages(project);
    const polygons = project.edificesCoordinates ?? [];
    const edificeCount = project.edifices?.length ?? 0;
    const showPolygons = edificeCount > 1 && polygons.length > 0 && Boolean(onSelectEdifice);
    const [api, setApi] = useState<CarouselApi | null>(null);
    const [activeIndex, setActiveIndex] = useState(0);

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

    if (showPolygons) {
        const overlayImage = images[0] ?? project.edifices?.[0]?.mainImage ?? project.mainImage ?? "";
        return (
            <div className="relative h-full min-h-[28rem] w-full overflow-hidden rounded-[5px] lg:min-h-0" data-node-id="472:1229">
                <div className="absolute inset-0 [&_[data-slot=card]]:size-full [&_[data-slot=card]]:border-0 [&_[data-slot=card]]:bg-transparent [&_[data-slot=card]]:p-0 [&_[data-slot=card]]:shadow-none">
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
            </div>
        );
    }

    return (
        <div className="relative h-full min-h-0 w-full overflow-hidden rounded-[5px]" data-node-id="472:1229">
            <Carousel setApi={setApi} className="h-full min-h-0 w-full [&_[data-slot=carousel-content]]:h-full">
                <CarouselContent className="ml-0 h-full">
                    {images.map((src, index) => (
                        <CarouselItem key={`${src}-${index}`} className="flex h-full items-start justify-center pl-0">
                            <img
                                alt=""
                                className="max-h-full max-w-full object-contain object-top"
                                src={src}
                            />
                        </CarouselItem>
                    ))}
                </CarouselContent>
            </Carousel>
            {images.length > 1 ? (
                <div className="absolute inset-x-0 bottom-6 z-10 flex justify-center gap-2">
                    {images.map((_, index) => (
                        <button
                            key={index}
                            type="button"
                            aria-label={`Slide ${index + 1}`}
                            onClick={() => scrollTo(index)}
                            className={`h-2 rounded-full transition ${
                                index === activeIndex ? "w-8 bg-white" : "w-2 bg-white/50"
                            }`}
                        />
                    ))}
                </div>
            ) : null}
        </div>
    );
}

export default OpenProjectFigmaGalleryStage;
