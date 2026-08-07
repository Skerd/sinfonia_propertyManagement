import {useEffect, useMemo, useState} from "react";
import {compose} from "redux";
import {Play} from "lucide-react";
import withLanguage from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import Loader from "@coreModule/components/custom/loader.tsx";
import DyeusPageShell from "@propertyManagementModule/clients/client/dyeus/shared/dyeusPageShell.tsx";
import DyeusHeader from "@propertyManagementModule/clients/client/dyeus/shared/dyeusHeader.tsx";
import DyeusFooter from "@propertyManagementModule/clients/client/dyeus/shared/dyeusFooter.tsx";
import DyeusMediaLightbox from "@propertyManagementModule/clients/client/dyeus/shared/dyeusMediaLightbox.tsx";
import {useDyeusProjectId} from "@propertyManagementModule/clients/client/dyeus/shared/useDyeusProjectId.ts";
import {dyeusAssets} from "@propertyManagementModule/clients/client/dyeus/shared/dyeusAssets.ts";
import {resolveMarketingMediaUrl} from "@propertyManagementModule/clients/client/public/shared/resolveMarketingMedia.ts";
import type {MarketingProjectSingle} from "@propertyManagementModule/clients/client/public/shared/publicTypes.ts";

type MarketingProjectSingleResponse = {project: MarketingProjectSingle};
type GalleryPageProps = WithAxiosType<MarketingProjectSingleResponse, {projectId: string}>;

type LightboxState =
    | {kind: "image"; index: number}
    | {kind: "video"; index: number}
    | null;

const fallbackImages = [
    dyeusAssets.hero,
    dyeusAssets.villaPool,
    dyeusAssets.terrace,
    dyeusAssets.interior,
    dyeusAssets.architecture,
    dyeusAssets.lounge,
    dyeusAssets.night,
    dyeusAssets.coastline,
    dyeusAssets.lifestyle,
] as const;

function dedupeUrls(urls: Array<string | undefined | null>): string[] {
    const seen = new Set<string>();
    const result: string[] = [];
    for (const raw of urls) {
        const url = resolveMarketingMediaUrl(raw) ?? raw ?? undefined;
        if (!url || seen.has(url)) continue;
        seen.add(url);
        result.push(url);
    }
    return result;
}

function GalleryPage({data, loading, onFilterChange}: GalleryPageProps) {
    const {projectId, loading: resolvingProject} = useDyeusProjectId();
    const [lightbox, setLightbox] = useState<LightboxState>(null);

    useEffect(() => {
        if (projectId) {
            onFilterChange({projectId});
        }
        // onFilterChange identity changes every withAxios render — do not add to deps.
    }, [projectId]);

    const project = data?.project;

    const images = useMemo(() => {
        if (!project) return [...fallbackImages];
        return dedupeUrls([project.mainImage, ...(project.imageGallery ?? [])]);
    }, [project]);

    const videos = useMemo(() => {
        if (!project?.videoGallery?.length) return [];
        return dedupeUrls(project.videoGallery);
    }, [project]);

    const showLoader = resolvingProject || (loading && !project && !!projectId);
    const showSectionLabels = videos.length > 0 && images.length > 0;

    return (
        <DyeusPageShell nodeId="44:gallery" nodeName="Gallery">
            <div className="relative">
                <DyeusHeader variant="solid" />
                <div className="mx-auto max-w-[1440px] px-6 pb-16 pt-28 md:px-12 md:pt-36">
                    <p className="font-dyeus-sans text-xs uppercase tracking-[0.24em] text-dyeus-bronze">Gallery</p>
                    <h1 className="mt-4 font-dyeus-serif text-5xl md:text-7xl">Spaces &amp; atmosphere</h1>

                    {showLoader ? (
                        <div className="mt-16 flex min-h-[280px] items-center justify-center">
                            <Loader />
                        </div>
                    ) : (
                        <>
                            {images.length > 0 ? (
                                <section className="mt-12" aria-label="Image gallery">
                                    {showSectionLabels ? (
                                        <p className="mb-6 font-dyeus-sans text-xs uppercase tracking-[0.2em] text-dyeus-bronze">
                                            Images
                                        </p>
                                    ) : null}
                                    <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
                                        {images.map((src, index) => (
                                            <button
                                                key={src}
                                                type="button"
                                                onClick={() => setLightbox({kind: "image", index})}
                                                className="mb-4 block w-full cursor-zoom-in break-inside-avoid overflow-hidden"
                                                aria-label={`Open image ${index + 1}`}
                                            >
                                                <img src={src} alt="" className="w-full object-cover" />
                                            </button>
                                        ))}
                                    </div>
                                </section>
                            ) : null}

                            {videos.length > 0 ? (
                                <section className={images.length > 0 ? "mt-16" : "mt-12"} aria-label="Video gallery">
                                    {showSectionLabels || images.length === 0 ? (
                                        <p className="mb-6 font-dyeus-sans text-xs uppercase tracking-[0.2em] text-dyeus-bronze">
                                            Videos
                                        </p>
                                    ) : null}
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        {videos.map((src, index) => (
                                            <button
                                                key={src}
                                                type="button"
                                                onClick={() => setLightbox({kind: "video", index})}
                                                className="group relative aspect-video cursor-pointer overflow-hidden bg-dyeus-sand"
                                                aria-label={`Play video ${index + 1}`}
                                            >
                                                <video
                                                    src={src}
                                                    muted
                                                    playsInline
                                                    preload="metadata"
                                                    className="pointer-events-none size-full object-cover"
                                                />
                                                <span className="absolute inset-0 flex items-center justify-center bg-dyeus-ink/25 transition group-hover:bg-dyeus-ink/40">
                                                    <span className="flex size-14 items-center justify-center rounded-full bg-dyeus-cream/95 text-dyeus-ink shadow-sm">
                                                        <Play className="ml-0.5 size-6 fill-current" strokeWidth={1.25} />
                                                    </span>
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </section>
                            ) : null}

                            {!showLoader && project && images.length === 0 && videos.length === 0 ? (
                                <p className="mt-12 font-dyeus-sans text-sm text-dyeus-ink-muted">
                                    No gallery media has been added to this project yet.
                                </p>
                            ) : null}
                        </>
                    )}
                </div>
            </div>
            <DyeusFooter />

            {lightbox ? (
                <DyeusMediaLightbox
                    kind={lightbox.kind}
                    images={images}
                    videos={videos}
                    initialIndex={lightbox.index}
                    onClose={() => setLightbox(null)}
                />
            ) : null}
        </DyeusPageShell>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/client/dyeus/gallery/index.tsx"),
    withAxios<MarketingProjectSingleResponse, {projectId: string}>(
        {method: "post", url: "/api/realEstate/marketingProjectCatalog/single", data: {}},
        true,
    ),
    withDebug(true, true),
)(GalleryPage);
