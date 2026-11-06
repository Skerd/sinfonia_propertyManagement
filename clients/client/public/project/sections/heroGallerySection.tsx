import {useState} from "react";
import {MarketingProjectSingle} from "@propertyManagementModule/clients/client/public/shared/publicTypes.ts";
import ImageLightbox from "@propertyManagementModule/clients/client/public/shared/imageLightbox.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import {Button} from "@coreModule/components/ui/button.tsx";

type HeroGallerySectionProps = {
    project: MarketingProjectSingle;
};

function HeroGallerySection({project}: HeroGallerySectionProps) {
    const images = [project.mainImage, ...(project.imageGallery ?? [])].filter(Boolean) as string[];
    const [activeIndex, setActiveIndex] = useState(0);
    const [lightboxOpen, setLightboxOpen] = useState(false);

    if (images.length === 0) return null;

    return (
        <>
            <section className="relative h-[min(70vh,640px)] overflow-hidden">
                <Button
                    type="button"
                    variant="bare"
                    className="size-full cursor-zoom-in"
                    onClick={() => setLightboxOpen(true)}
                >
                    <img alt={project.name} className="size-full object-cover" src={images[activeIndex]} />
                </Button>
                {images.length > 1 && (
                    <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2">
                        {images.map((img, index) => (
                            <Button
                                type="button"
                                variant="bare"
                                key={img}
                                className={cn(`size-16 overflow-hidden rounded-xs border-2 ${index === activeIndex ? "border-overlay-foreground" : "border-transparent opacity-70"}`)}
                                onClick={() => setActiveIndex(index)}
                            >
                                <img alt="" className="size-full object-cover" src={img} />
                            </Button>
                        ))}
                    </div>
                )}
            </section>
            {lightboxOpen && (
                <ImageLightbox images={images} initialIndex={activeIndex} onClose={() => setLightboxOpen(false)} />
            )}
        </>
    );
}

export default HeroGallerySection;
