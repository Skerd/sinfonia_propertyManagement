import {useState} from "react";
import ImageLightbox from "@propertyManagementModule/clients/client/public/shared/imageLightbox.tsx";
import {resolveMarketingMediaUrl} from "@propertyManagementModule/clients/client/public/shared/resolveMarketingMedia.ts";
import {projectsAssets} from "@propertyManagementModule/clients/client/public/projects/projectsAssets.ts";
import {projectAssets} from "@propertyManagementModule/clients/client/public/project/projectAssets.ts";
import {MarketingUnitSingle} from "@propertyManagementModule/clients/client/public/shared/publicTypes.ts";

type PropertyGallerySectionProps = {
    unit: MarketingUnitSingle;
};

function PropertyGallerySection({unit}: PropertyGallerySectionProps) {
    const images = (unit.imageGallery ?? [])
        .map((url) => resolveMarketingMediaUrl(url))
        .filter(Boolean) as string[];
    const displayImages = images.length > 0 ? images : [projectsAssets.cardPlaceholder];
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);

    const mainImage = displayImages[0];
    const topRight = displayImages[1] ?? mainImage;
    const bottomRight = displayImages[2] ?? displayImages[1] ?? mainImage;

    return (
        <>
            <div className="relative w-full" data-node-id="515:4305">
                <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-12 md:gap-6 lg:gap-8">
                    <button
                        type="button"
                        className="overflow-hidden rounded-[5px] md:col-span-7 lg:col-span-8"
                        onClick={() => setLightboxOpen(true)}
                        data-node-id="515:6179"
                    >
                        <img alt={unit.name} className="aspect-[994/811] w-full object-cover" src={mainImage} />
                    </button>
                    <div className="flex flex-col gap-4 md:col-span-5 md:gap-6 lg:col-span-4" data-node-id="515:4304">
                        <button
                            type="button"
                            className="overflow-hidden rounded-[5px]"
                            onClick={() => {
                                setActiveIndex(Math.min(1, displayImages.length - 1));
                                setLightboxOpen(true);
                            }}
                            data-node-id="515:6182"
                        >
                            <img alt="" aria-hidden className="aspect-[599/390] w-full object-cover" src={topRight} />
                        </button>
                        <button
                            type="button"
                            className="overflow-hidden rounded-[5px]"
                            onClick={() => {
                                setActiveIndex(Math.min(2, displayImages.length - 1));
                                setLightboxOpen(true);
                            }}
                            data-node-id="515:6187"
                        >
                            <img alt="" aria-hidden className="aspect-[599/390] w-full object-cover" src={bottomRight} />
                        </button>
                    </div>
                </div>
                {displayImages.length > 1 && (
                    <img
                        alt=""
                        aria-hidden
                        className="absolute bottom-4 left-1/2 hidden h-6 w-auto -translate-x-1/2 md:block lg:bottom-8"
                        src={projectAssets.galleryDots}
                    />
                )}
            </div>
            {lightboxOpen && (
                <ImageLightbox images={displayImages} initialIndex={activeIndex} onClose={() => setLightboxOpen(false)} />
            )}
        </>
    );
}

export default PropertyGallerySection;
