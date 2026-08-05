import {Link} from "react-router-dom";
import {MarketingProject} from "@propertyManagementModule/clients/client/public/shared/publicTypes.ts";
import {PublicLanguageProps} from "@propertyManagementModule/clients/client/public/shared/publicTypes.ts";
import {projectsAssets} from "@propertyManagementModule/clients/client/public/projects/projectsAssets.ts";
import ProjectCardImageCarousel from "@propertyManagementModule/clients/client/public/projects/components/projectCardImageCarousel.tsx";
import PublicFavoriteHeartButton from "@propertyManagementModule/clients/client/public/shared/favorites/publicFavoriteHeartButton.tsx";
import {resolveProjectCardImages} from "@propertyManagementModule/clients/client/public/project/shared/resolveProjectFallbackImage.ts";
import {
    PUBLIC_CARD_TITLE,
    PUBLIC_SUBTITLE,
} from "@propertyManagementModule/clients/client/public/shared/layout/publicLayoutTokens.ts";

type FigmaProjectCardProps = PublicLanguageProps & {
    project: MarketingProject;
};

function FigmaProjectCard({project, resolveLanguageKey}: FigmaProjectCardProps) {
    const images = resolveProjectCardImages(project);

    return (
        <Link
            to={`/project/gallery?projectId=${project._id}`}
            draggable={false}
            onDragStart={(event) => event.preventDefault()}
            className="relative flex w-full min-w-0 cursor-pointer flex-col overflow-hidden rounded-[5px] border border-pronix-border bg-white transition duration-300 hover:-translate-y-1 hover:shadow-lg"
            data-name="Project card"
            data-node-id="268:716"
        >
            <div className="flex flex-col gap-5 p-4 sm:gap-6 sm:p-6">
                <div className="relative w-full" data-node-id="277:226">
                    <ProjectCardImageCarousel images={images} alt={project.name} />

                    <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-4">
                        <div className="pointer-events-auto flex flex-wrap gap-2">
                            {(project.availableUnitCount ?? 0) > 0 ? (
                                <span
                                    className="rounded-full bg-[rgba(91,184,93,0.4)] px-4 py-2 font-aeonik-light text-base leading-[1.2] text-white backdrop-blur-[17px]"
                                    data-node-id="278:661"
                                >
                                    {resolveLanguageKey("available")}
                                </span>
                            ) : null}
                        </div>
                        <PublicFavoriteHeartButton
                            kind="project"
                            project={project}
                            addLabel={String(resolveLanguageKey("favoritesAdd"))}
                            removeLabel={String(resolveLanguageKey("favoritesRemove"))}
                            nodeId="545:1846"
                        />
                    </div>
                </div>

                <div className="flex min-w-0 flex-col gap-2" data-node-id="278:310">
                    <h2 className={`${PUBLIC_CARD_TITLE} wrap-break-word`} data-node-id="268:718">
                        {project.name}
                    </h2>
                    {project.location && (
                        <p
                            className={`${PUBLIC_SUBTITLE} wrap-break-word text-pronix-ink-muted`}
                            data-node-id="278:308"
                        >
                            {project.location}
                        </p>
                    )}
                </div>

                <div className="flex w-full min-w-0 flex-col" data-node-id="278:314">
                    <div className="flex flex-wrap gap-3" data-node-id="278:255">
                        <span className="inline-flex items-center gap-2 rounded-full border border-pronix-border px-4 py-2 font-aeonik-light text-base text-pronix-ink">
                            <img alt="" aria-hidden className="size-5" src={projectsAssets.iconFloors} />
                            {project.floorCount != null
                                ? `${project.floorCount} ${resolveLanguageKey("floors")}`
                                : resolveLanguageKey("floors")}
                        </span>
                        <span className="inline-flex items-center gap-2 rounded-full border border-pronix-border px-4 py-2 font-aeonik-light text-base text-pronix-ink">
                            <img alt="" aria-hidden className="size-5" src={projectsAssets.iconUnits} />
                            {project.unitCount != null
                                ? `${project.unitCount} ${resolveLanguageKey("units")}`
                                : resolveLanguageKey("units")}
                        </span>
                        <span className="inline-flex items-center gap-2 rounded-full border border-pronix-border px-4 py-2 font-aeonik-light text-base text-pronix-ink">
                            <img alt="" aria-hidden className="size-5" src={projectsAssets.iconBuild} />
                            {resolveLanguageKey("buildYear")}
                        </span>
                    </div>
                    {project.minSharePrice != null && (
                        <div className="mt-6 flex justify-center" data-node-id="278:322">
                            <p
                                className="rounded-[2px] border border-pronix-blue px-3 py-3 font-aeonik-medium text-xl leading-[1.2] text-pronix-blue not-italic sm:text-2xl"
                                data-node-id="278:320"
                            >
                                {resolveLanguageKey("fromPrice")} €{project.minSharePrice.toLocaleString()}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
}

export default FigmaProjectCard;
