import {useState} from "react";
import ImageLightbox from "@propertyManagementModule/clients/client/public/shared/imageLightbox.tsx";
import {resolveMarketingMediaUrl} from "@propertyManagementModule/clients/client/public/shared/resolveMarketingMedia.ts";
import {projectsAssets} from "@propertyManagementModule/clients/client/public/projects/projectsAssets.ts";
import {MarketingUnitSingle} from "@propertyManagementModule/clients/client/public/shared/publicTypes.ts";

const TILE =
    "min-h-0 cursor-pointer overflow-hidden rounded-[5px] border border-pronix-border transition-colors hover:border-pronix-ink";

type PropertyGallerySectionProps = {
    unit: MarketingUnitSingle;
};

function PropertyGallerySection({unit}: PropertyGallerySectionProps) {
    const images = (unit.imageGallery ?? [])
        .map((url) => resolveMarketingMediaUrl(url))
        .filter(Boolean) as string[];
    const videos = ((unit as {videoGallery?: string[]}).videoGallery ?? [])
        .map((url) => resolveMarketingMediaUrl(url))
        .filter(Boolean) as string[];
    const displayImages = images.length > 0 ? images : [projectsAssets.cardPlaceholder];
    const lightboxMedia = [...displayImages, ...videos.filter((url) => !displayImages.includes(url))];
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);

    const mainImage = displayImages[0];
    const topRight = displayImages[1] ?? mainImage;
    const bottomRight = displayImages[2] ?? displayImages[1] ?? mainImage;
    const extraCount = Math.max(0, displayImages.length - 3);

    const openAt = (index: number) => {
        setActiveIndex(Math.min(index, displayImages.length - 1));
        setLightboxOpen(true);
    };

    return (
        <>
            <div
                className="grid aspect-[4/5] w-full grid-cols-1 grid-rows-[1.2fr_0.9fr_0.9fr] gap-3 sm:gap-4 md:aspect-[2/1] md:grid-cols-2 md:grid-rows-2 md:gap-5"
                data-node-id="515:4305"
            >
                <button
                    type="button"
                    className={`${TILE} md:row-span-2`}
                    onClick={() => openAt(0)}
                    data-node-id="515:6179"
                >
                    <img alt={unit.name} className="size-full object-cover" src={mainImage} />
                </button>
                <button
                    type="button"
                    className={TILE}
                    onClick={() => openAt(1)}
                    data-node-id="515:6182"
                >
                    <img alt="" aria-hidden className="size-full object-cover" src={topRight} />
                </button>
                {extraCount > 0 ? (
                    <div className="grid min-h-0 grid-cols-2 gap-3 sm:gap-4 md:gap-5" data-node-id="515:6187">
                        <button
                            type="button"
                            className={TILE}
                            onClick={() => openAt(2)}
                        >
                            <img alt="" aria-hidden className="size-full object-cover" src={bottomRight} />
                        </button>
                        <button
                            type="button"
                            className={`${TILE} flex items-center justify-center bg-white font-aeonik-medium text-2xl leading-none text-pronix-ink md:text-3xl lg:text-4xl`}
                            onClick={() => openAt(3)}
                            aria-label={`+${extraCount}`}
                        >
                            +{extraCount}
                        </button>
                    </div>
                ) : (
                    <button
                        type="button"
                        className={TILE}
                        onClick={() => openAt(2)}
                        data-node-id="515:6187"
                    >
                        <img alt="" aria-hidden className="size-full object-cover" src={bottomRight} />
                    </button>
                )}
            </div>
            {lightboxOpen && (
                <ImageLightbox images={lightboxMedia} initialIndex={activeIndex} onClose={() => setLightboxOpen(false)} />
            )}
        </>
    );
}

export default PropertyGallerySection;
