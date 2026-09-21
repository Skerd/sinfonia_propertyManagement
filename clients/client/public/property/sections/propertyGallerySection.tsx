import {useState} from "react";
import {cn} from "@coreModule/components/lib/utils.ts";
import ImageLightbox from "@propertyManagementModule/clients/client/public/shared/imageLightbox.tsx";
import PdfLightbox from "@propertyManagementModule/clients/client/public/shared/pdfLightbox.tsx";
import {resolveMarketingMediaUrl} from "@propertyManagementModule/clients/client/public/shared/resolveMarketingMedia.ts";
import {projectsAssets} from "@propertyManagementModule/clients/client/public/projects/projectsAssets.ts";
import {MarketingUnitSingle} from "@propertyManagementModule/clients/client/public/shared/publicTypes.ts";
import PdfFirstPageThumb from "@coreModule/components/custom/pdf/PdfFirstPageThumb.tsx";

const TILE =
    "min-h-0 cursor-pointer overflow-hidden rounded-[5px] border border-pronix-border transition-colors hover:border-pronix-ink";

type PropertyGallerySectionProps = {
    unit: MarketingUnitSingle;
    /** Shorter gallery for dense side panels (e.g. open-project unit panel). */
    compact?: boolean;
};

type GalleryTile = {
    kind: "image" | "pdf";
    src: string;
};

function uniqueUrls(urls: Array<string | undefined>): string[] {
    const seen = new Set<string>();
    const result: string[] = [];
    for (const url of urls) {
        if (!url || seen.has(url)) {
            continue;
        }
        seen.add(url);
        result.push(url);
    }
    return result;
}

function GallerySlot({
    src,
    alt,
    className,
    nodeId,
    onOpen,
}: {
    src: string;
    alt?: string;
    className?: string;
    nodeId?: string;
    onOpen: () => void;
}) {
    return (
        <button type="button" className={cn(TILE, className)} onClick={onOpen} data-node-id={nodeId}>
            <img alt={alt ?? ""} aria-hidden={!alt} className="size-full object-cover" src={src} />
        </button>
    );
}

function PropertyGallerySection({unit, compact = false}: PropertyGallerySectionProps) {
    const booklet = resolveMarketingMediaUrl(unit.marketingBooklet);
    const images = uniqueUrls((unit.imageGallery ?? []).map((url) => resolveMarketingMediaUrl(url))).filter(
        (url) => url !== booklet,
    );
    const videos = uniqueUrls((unit.videoGallery ?? []).map((url) => resolveMarketingMediaUrl(url)));
    const tiles: GalleryTile[] = [
        ...(booklet ? [{kind: "pdf" as const, src: booklet}] : []),
        ...images.map((src) => ({kind: "image" as const, src})),
    ];
    const displayTiles: GalleryTile[] = tiles.length > 0 ? tiles : [{kind: "image", src: projectsAssets.cardPlaceholder}];
    const lightboxImages = [
        ...images,
        ...videos.filter((url) => !images.includes(url)),
    ];
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const [pdfOpen, setPdfOpen] = useState(false);

    const count = displayTiles.length;
    const main = displayTiles[0];
    const topRight = displayTiles[1];
    const bottomRight = displayTiles[2];
    const extraCount = Math.max(0, count - 3);

    const openAt = (index: number) => {
        const tile = displayTiles[index];
        if (!tile) {
            return;
        }
        if (tile.kind === "pdf") {
            setPdfOpen(true);
            return;
        }
        const imageIndex = displayTiles.slice(0, index + 1).filter((item) => item.kind === "image").length - 1;
        setActiveIndex(Math.max(0, imageIndex));
        setLightboxOpen(true);
    };

    const extraOverlayClass = compact
        ? `${TILE} flex items-center justify-center bg-white font-aeonik-medium text-sm leading-none text-pronix-ink`
        : `${TILE} flex items-center justify-center bg-white font-aeonik-medium text-2xl leading-none text-pronix-ink md:text-3xl lg:text-4xl`;
    const extraGridGap = compact ? "gap-1.5" : "gap-3 sm:gap-4 md:gap-5";

    const mosaicClassName = compact
        ? count === 1
            ? "grid h-[calc(70dvh/2)] min-h-[12rem] max-h-[24rem] w-full grid-cols-1"
            : count === 2
                ? "grid h-[calc(70dvh/2)] min-h-[12rem] max-h-[24rem] w-full grid-cols-[1.4fr_1fr] gap-1.5"
                : "grid h-[calc(70dvh/2)] min-h-[12rem] max-h-[24rem] w-full grid-cols-[1.4fr_1fr] grid-rows-2 gap-1.5"
        : count === 1
            ? "grid aspect-[4/5] w-full grid-cols-1 md:aspect-[2/1]"
            : count === 2
                ? "grid aspect-[4/5] w-full grid-cols-1 grid-rows-2 gap-3 sm:gap-4 md:aspect-[2/1] md:grid-cols-[1.4fr_1fr] md:grid-rows-1 md:gap-5"
                : "grid aspect-[4/5] w-full grid-cols-1 grid-rows-[1.2fr_0.9fr_0.9fr] gap-3 sm:gap-4 md:aspect-[2/1] md:grid-cols-2 md:grid-rows-2 md:gap-5";

    const renderTile = (tile: GalleryTile, index: number, className?: string, nodeId?: string, alt?: string) => {
        if (tile.kind === "pdf") {
            return (
                <button
                    type="button"
                    className={cn(TILE, "h-full min-h-0 w-full", className)}
                    onClick={() => openAt(index)}
                    data-node-id={nodeId}
                >
                    <PdfFirstPageThumb src={tile.src} fit="contain" className="size-full bg-white" />
                </button>
            );
        }
        return (
            <GallerySlot
                src={tile.src}
                alt={alt}
                className={className}
                nodeId={nodeId}
                onOpen={() => openAt(index)}
            />
        );
    };

    return (
        <>
            <div className={mosaicClassName} data-node-id="515:4305">
                {renderTile(
                    main,
                    0,
                    count >= 3 ? (compact ? "row-span-2" : "md:row-span-2") : undefined,
                    "515:6179",
                    unit.name,
                )}
                {topRight ? renderTile(topRight, 1, undefined, "515:6182") : null}
                {extraCount > 0 && bottomRight ? (
                    <div className={cn("grid min-h-0 grid-cols-2", extraGridGap)} data-node-id="515:6187">
                        {renderTile(bottomRight, 2)}
                        <button
                            type="button"
                            className={extraOverlayClass}
                            onClick={() => openAt(3)}
                            aria-label={`+${extraCount}`}
                        >
                            +{extraCount}
                        </button>
                    </div>
                ) : bottomRight ? (
                    renderTile(bottomRight, 2, undefined, "515:6187")
                ) : null}
            </div>
            {lightboxOpen && lightboxImages.length > 0 && (
                <ImageLightbox images={lightboxImages} initialIndex={activeIndex} onClose={() => setLightboxOpen(false)} />
            )}
            {pdfOpen && booklet ? <PdfLightbox src={booklet} onClose={() => setPdfOpen(false)} /> : null}
        </>
    );
}

export default PropertyGallerySection;
