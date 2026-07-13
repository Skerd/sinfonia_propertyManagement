import {useState} from "react";
import {Link} from "react-router-dom";
import ImageLightbox from "@propertyManagementModule/clients/client/public/shared/imageLightbox.tsx";
import {OpenProjectContentProps} from "@propertyManagementModule/clients/client/public/project/shared/openProjectShell.tsx";
import {resolveProjectGalleryImages} from "@propertyManagementModule/clients/client/public/project/shared/resolveProjectFallbackImage.ts";
import ProjectViewActions from "@propertyManagementModule/clients/client/public/project/shared/projectViewActions.tsx";
import {PUBLIC_TITLE, PUBLIC_SUBTITLE} from "@propertyManagementModule/clients/client/public/shared/layout/publicLayoutTokens.ts";

function OpenProjectGallerySection({project}: OpenProjectContentProps) {
    const displayImages = resolveProjectGalleryImages(project);
    const [activeIndex, setActiveIndex] = useState(0);
    const [lightboxOpen, setLightboxOpen] = useState(false);

    return (
        <div className="flex w-full flex-col gap-6 lg:grid lg:grid-cols-[minmax(0,482px)_1fr] lg:items-start lg:gap-8">
            <div className="flex flex-col gap-2" data-node-id="472:1198">
                <h1 className={PUBLIC_TITLE} data-node-id="472:1199">
                    {project.name}
                </h1>
                {project.location && (
                    <p className={PUBLIC_SUBTITLE} data-node-id="472:1200">
                        {project.location}
                    </p>
                )}
                <Link
                    to={`/project/grid?projectId=${project._id}`}
                    className="mt-2 font-aeonik-light text-base text-pronix-blue hover:underline md:text-lg"
                >
                    Grid view
                </Link>
            </div>

            <div className="relative flex min-h-0 min-w-0 flex-1 flex-col" data-node-id="472:1229">
                <button
                    type="button"
                    className="relative aspect-[963/605] w-full max-h-[70vh] overflow-hidden rounded-[5px] bg-[rgba(24,24,24,0.05)]"
                    onClick={() => setLightboxOpen(true)}
                    data-node-id="472:1203"
                >
                    <img alt={project.name} className="size-full object-contain" src={displayImages[activeIndex]} />
                </button>
                {displayImages.length > 1 && (
                    <div className="mt-4 flex items-center justify-center gap-3" data-node-id="472:1230">
                        {displayImages.map((_, index) => (
                            <button
                                key={index}
                                type="button"
                                onClick={() => setActiveIndex(index)}
                                className="rounded-full transition"
                                style={{
                                    width: index === activeIndex ? 58.5 : 24,
                                    height: 24,
                                    background: index === activeIndex ? "#0247fe" : "rgba(24, 24, 24, 0.2)",
                                }}
                                aria-label={`Slide ${index + 1}`}
                            />
                        ))}
                    </div>
                )}
            </div>

            <div className="lg:col-span-2">
                <ProjectViewActions />
            </div>

            {lightboxOpen && (
                <ImageLightbox images={displayImages} initialIndex={activeIndex} onClose={() => setLightboxOpen(false)} />
            )}
        </div>
    );
}

export default OpenProjectGallerySection;
