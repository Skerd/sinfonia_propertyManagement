import {useState} from "react";
import {MarketingProjectSingle} from "@propertyManagementModule/clients/client/public/shared/publicTypes.ts";
import ImageLightbox from "@propertyManagementModule/clients/client/public/shared/imageLightbox.tsx";

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
                <button type="button" onClick={() => setLightboxOpen(true)} className="size-full cursor-zoom-in">
                    <img alt={project.name} className="size-full object-cover" src={images[activeIndex]} />
                </button>
                {images.length > 1 && (
                    <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2">
                        {images.map((img, index) => (
                            <button
                                key={img}
                                type="button"
                                onClick={() => setActiveIndex(index)}
                                className={`size-16 overflow-hidden rounded-[3px] border-2 ${index === activeIndex ? "border-white" : "border-transparent opacity-70"}`}
                            >
                                <img alt="" className="size-full object-cover" src={img} />
                            </button>
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
