import {useMemo, useState} from "react";
import {Play} from "lucide-react";
import DyeusMediaLightbox from "@propertyManagementModule/clients/client/dyeus/shared/dyeusMediaLightbox.tsx";
import {resolveMarketingMediaUrl} from "@propertyManagementModule/clients/client/public/shared/resolveMarketingMedia.ts";
import {
    fillLanguageTemplate,
    type MarketingUnitSingle,
} from "@propertyManagementModule/clients/client/public/shared/publicTypes.ts";
import type {DyeusPropertyCopy} from "@propertyManagementModule/clients/client/dyeus/property/dyeusPropertyFormat.ts";

const VIDEO_EXT_RE = /\.(mp4|webm|ogg|mov|m4v)(\?|#|$)/i;

const TILE =
    "min-h-0 cursor-pointer overflow-hidden border border-dyeus-border bg-dyeus-sand/40 transition-colors hover:border-dyeus-ink";

type DyeusPropertyGallerySectionProps = {
    unit: MarketingUnitSingle;
    t: DyeusPropertyCopy;
    compact?: boolean;
};

function isVideoUrl(url: string) {
    return VIDEO_EXT_RE.test(url);
}

function uniqueUrls(urls: Array<string | undefined>): string[] {
    const seen = new Set<string>();
    const result: string[] = [];
    for (const url of urls) {
        if (!url || seen.has(url)) continue;
        seen.add(url);
        result.push(url);
    }
    return result;
}

function DyeusPropertyGallerySection({unit, t, compact = false}: DyeusPropertyGallerySectionProps) {
    const images = useMemo(() => {
        const main = resolveMarketingMediaUrl(unit.mainImage);
        const gallery = (unit.imageGallery ?? []).map((url) => resolveMarketingMediaUrl(url));
        return uniqueUrls([main, ...gallery]).filter((url) => !isVideoUrl(url));
    }, [unit.mainImage, unit.imageGallery]);

    const videos = useMemo(() => {
        const galleryVideos = (unit.imageGallery ?? [])
            .map((url) => resolveMarketingMediaUrl(url))
            .filter((url): url is string => Boolean(url) && isVideoUrl(url));
        const videoGallery = (unit.videoGallery ?? []).map((url) => resolveMarketingMediaUrl(url));
        return uniqueUrls([...videoGallery, ...galleryVideos]);
    }, [unit.imageGallery, unit.videoGallery]);

    const [lightbox, setLightbox] = useState<{kind: "image" | "video"; index: number} | null>(null);

    const extraCount = Math.max(0, images.length - 3);
    const mainImage = images[0];
    const topRight = images[1];
    const bottomRight = images[2];

    const openImageAt = (index: number) => {
        if (images.length === 0) return;
        setLightbox({kind: "image", index: Math.min(index, images.length - 1)});
    };

    if (images.length === 0 && videos.length === 0) {
        return null;
    }

    const mosaicClassName = compact
        ? images.length === 1
            ? "grid aspect-[16/10] w-full grid-cols-1"
            : "grid aspect-[16/10] w-full grid-cols-2 gap-2"
        : images.length === 1
            ? "grid aspect-[2/1] w-full grid-cols-1"
            : images.length === 2
              ? "grid aspect-[4/5] w-full grid-cols-1 grid-rows-2 gap-3 sm:gap-4 md:aspect-[2/1] md:grid-cols-2 md:grid-rows-1 md:gap-5"
              : "grid aspect-[4/5] w-full grid-cols-1 grid-rows-[1.2fr_0.9fr_0.9fr] gap-3 sm:gap-4 md:aspect-[2/1] md:grid-cols-2 md:grid-rows-2 md:gap-5";

    return (
        <>
            {images.length > 0 ? (
                <div className={mosaicClassName}>
                    <button
                        type="button"
                        className={`${TILE} ${!compact && images.length >= 3 ? "md:row-span-2" : ""}`}
                        onClick={() => openImageAt(0)}
                        aria-label={fillLanguageTemplate(t("openImage"), {index: 1})}
                    >
                        <img alt={unit.name} className="size-full object-cover" src={mainImage} />
                    </button>
                    {topRight ? (
                        <button
                            type="button"
                            className={TILE}
                            onClick={() => openImageAt(1)}
                            aria-label={fillLanguageTemplate(t("openImage"), {index: 2})}
                        >
                            <img alt="" aria-hidden className="size-full object-cover" src={topRight} />
                        </button>
                    ) : null}
                    {compact ? null : extraCount > 0 && bottomRight ? (
                        <div className="grid min-h-0 grid-cols-2 gap-3 sm:gap-4 md:gap-5">
                            <button
                                type="button"
                                className={TILE}
                                onClick={() => openImageAt(2)}
                                aria-label={fillLanguageTemplate(t("openImage"), {index: 3})}
                            >
                                <img alt="" aria-hidden className="size-full object-cover" src={bottomRight} />
                            </button>
                            <button
                                type="button"
                                className={`${TILE} flex items-center justify-center bg-dyeus-white font-dyeus-serif text-2xl font-bold leading-none text-dyeus-ink md:text-3xl lg:text-4xl`}
                                onClick={() => openImageAt(3)}
                                aria-label={fillLanguageTemplate(t("morePhotos"), {count: extraCount})}
                            >
                                +{extraCount}
                            </button>
                        </div>
                    ) : bottomRight ? (
                        <button
                            type="button"
                            className={TILE}
                            onClick={() => openImageAt(2)}
                            aria-label={fillLanguageTemplate(t("openImage"), {index: 3})}
                        >
                            <img alt="" aria-hidden className="size-full object-cover" src={bottomRight} />
                        </button>
                    ) : null}
                </div>
            ) : null}

            {compact ? null : videos.length > 0 ? (
                <div className={`grid gap-3 sm:grid-cols-2 md:gap-5 ${images.length > 0 ? "mt-3 md:mt-5" : ""}`}>
                    {videos.map((src, index) => (
                        <button
                            key={`${src}-${index}`}
                            type="button"
                            onClick={() => setLightbox({kind: "video", index})}
                            className={`group relative aspect-video ${TILE}`}
                            aria-label={fillLanguageTemplate(t("playVideo"), {index: index + 1})}
                        >
                            <video
                                src={src}
                                muted
                                playsInline
                                preload="metadata"
                                className="pointer-events-none size-full object-cover"
                            />
                            <span className="absolute inset-0 flex items-center justify-center bg-dyeus-ink/25 transition group-hover:bg-dyeus-ink/40">
                                <span className="flex size-12 items-center justify-center rounded-full bg-dyeus-cream/95 text-dyeus-ink shadow-sm">
                                    <Play className="ml-0.5 size-5 fill-current" strokeWidth={1.25} />
                                </span>
                            </span>
                        </button>
                    ))}
                </div>
            ) : null}

            {lightbox ? (
                <DyeusMediaLightbox
                    kind={lightbox.kind}
                    images={images}
                    videos={videos}
                    initialIndex={lightbox.index}
                    onClose={() => setLightbox(null)}
                />
            ) : null}
        </>
    );
}

export default DyeusPropertyGallerySection;
