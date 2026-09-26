import {Link} from "react-router-dom";
import {compose} from "redux";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {
    PUBLIC_HEADING,
    PUBLIC_SUBTITLE,
} from "@propertyManagementModule/clients/client/public/shared/layout/publicLayoutTokens.ts";
import {projectsAssets} from "@propertyManagementModule/clients/client/public/projects/projectsAssets.ts";
import {usePublicFavorites} from "@propertyManagementModule/clients/client/public/shared/favorites/publicFavoritesContext.tsx";
import PublicFavoriteHeartButton from "@propertyManagementModule/clients/client/public/shared/favorites/publicFavoriteHeartButton.tsx";
import PublicFavoriteHeartIcon from "@propertyManagementModule/clients/client/public/shared/favorites/publicFavoriteHeartIcon.tsx";
import type {
    PublicFavoriteProject,
    PublicFavoriteUnit,
} from "@propertyManagementModule/clients/client/public/shared/favorites/publicFavoritesTypes.ts";
import {resolveMarketingMediaUrl} from "@propertyManagementModule/clients/client/public/shared/resolveMarketingMedia.ts";

const LANGUAGE_PATH = "src/modules/propertyManagement/clients/client/public/profile/portfolio/saved/index.tsx";

const rowClassName =
    "group relative flex min-w-0 items-stretch overflow-hidden rounded-[5px] border border-pronix-border bg-white transition duration-300 hover:-translate-y-0.5 hover:border-[rgba(24,24,24,0.35)] hover:shadow-lg";

const metaTitleClassName =
    "font-aeonik-medium text-lg leading-[1.2] text-pronix-ink not-italic transition group-hover:text-pronix-blue md:text-xl lg:text-[22px]";

const metaLineClassName =
    "font-aeonik-light text-sm leading-[1.4] text-pronix-ink-muted not-italic md:text-base";

const priceClassName =
    "mt-auto inline-flex w-fit rounded-[2px] border border-pronix-blue px-2.5 py-1.5 font-aeonik-medium text-sm leading-[1.2] text-pronix-blue not-italic md:text-base";

function resolveFavoriteImageSrc(imageUrl?: string): string {
    return resolveMarketingMediaUrl(imageUrl) ?? projectsAssets.cardPlaceholder;
}

function favoriteUnitTitle(unit: PublicFavoriteUnit): string {
    return [unit.projectName, unit.edificeName, unit.name]
        .map((part) => part?.trim())
        .filter((part): part is string => Boolean(part))
        .join(" · ");
}

function ProjectFavoriteRow({
    project,
    addLabel,
    removeLabel,
    fromPriceLabel,
}: {
    project: PublicFavoriteProject;
    addLabel: string;
    removeLabel: string;
    fromPriceLabel: string;
}) {
    return (
        <li className={rowClassName}>
            <Link
                to={`/project?projectId=${project._id}`}
                className="flex min-w-0 flex-1 items-center gap-4 p-3 md:gap-5 md:p-4"
            >
                <img
                    alt=""
                    className="size-20 shrink-0 rounded-[2px] object-cover md:size-24"
                    src={resolveFavoriteImageSrc(project.mainImage)}
                />
                <div className="flex min-w-0 flex-1 flex-col gap-1.5 py-0.5 md:gap-2">
                    <p className={metaTitleClassName}>{project.name}</p>
                    {project.location ? <p className={metaLineClassName}>{project.location}</p> : null}
                    {project.minSharePrice != null ? (
                        <p className={priceClassName}>
                            {fromPriceLabel} €{project.minSharePrice.toLocaleString()}/m²
                        </p>
                    ) : null}
                </div>
            </Link>
            <div className="flex shrink-0 items-start p-3 md:p-4">
                <PublicFavoriteHeartButton
                    kind="project"
                    project={project}
                    addLabel={addLabel}
                    removeLabel={removeLabel}
                />
            </div>
        </li>
    );
}

function UnitFavoriteRow({
    unit,
    addLabel,
    removeLabel,
}: {
    unit: PublicFavoriteUnit;
    addLabel: string;
    removeLabel: string;
}) {
    return (
        <li className={rowClassName}>
            <Link
                to={`/property?projectId=${unit.projectId}&unitId=${unit.unitId}`}
                className="flex min-w-0 flex-1 items-center gap-4 p-3 md:gap-5 md:p-4"
            >
                <img
                    alt=""
                    className="size-20 shrink-0 rounded-[2px] object-cover md:size-24"
                    src={resolveFavoriteImageSrc(unit.imageUrl)}
                />
                <div className="flex min-w-0 flex-1 flex-col gap-1.5 py-0.5 md:gap-2">
                    <p className={metaTitleClassName}>{favoriteUnitTitle(unit)}</p>
                    {unit.floorLabel ? <p className={metaLineClassName}>{unit.floorLabel}</p> : null}
                    {unit.price != null ? <p className={priceClassName}>€{unit.price.toLocaleString()}</p> : null}
                </div>
            </Link>
            <div className="flex shrink-0 items-start p-3 md:p-4">
                <PublicFavoriteHeartButton
                    kind="unit"
                    projectId={unit.projectId}
                    projectName={unit.projectName}
                    unit={{
                        _id: unit.unitId,
                        name: unit.name,
                        status: "available",
                        imageUrl: unit.imageUrl,
                        price: unit.price,
                        floorLabel: unit.floorLabel,
                        edificeName: unit.edificeName,
                    }}
                    addLabel={addLabel}
                    removeLabel={removeLabel}
                />
            </div>
        </li>
    );
}

type SavedPageProps = WithLanguageType;

function SavedPageInner({resolveLanguageKey}: SavedPageProps) {
    const {favorites} = usePublicFavorites();
    const projectCount = favorites.projects.length;
    const unitCount = favorites.units.length;
    const totalCount = projectCount + unitCount;
    const addLabel = String(resolveLanguageKey("favoritesAdd"));
    const removeLabel = String(resolveLanguageKey("favoritesRemove"));
    const fromPriceLabel = String(resolveLanguageKey("fromPrice"));

    if (totalCount === 0) {
        return (
            <div className="mx-auto flex max-w-md flex-col items-center justify-center gap-5 py-10 text-center md:py-16">
                <div className="flex size-14 items-center justify-center rounded-full border border-pronix-border bg-white">
                    <PublicFavoriteHeartIcon active={false} />
                </div>
                <div className="flex flex-col gap-2">
                    <p className={PUBLIC_HEADING}>{resolveLanguageKey("emptyTitle")}</p>
                    <p className={`${PUBLIC_SUBTITLE} text-pronix-ink-muted`}>
                        {resolveLanguageKey("emptyHint")}
                    </p>
                </div>
                <Link
                    to="/projects"
                    className="mt-2 rounded-[5px] bg-pronix-blue px-8 py-3 font-aeonik-medium text-white not-italic transition hover:opacity-90 md:text-lg"
                >
                    {resolveLanguageKey("browseCta")}
                </Link>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-10 md:gap-12">
            {projectCount > 0 ? (
                <section className="flex flex-col gap-4 md:gap-5">
                    <div className="flex items-baseline justify-between gap-3">
                        <h3 className={PUBLIC_HEADING}>{resolveLanguageKey("projectsHeading")}</h3>
                        <span className="font-aeonik-light text-base text-pronix-ink-muted not-italic md:text-lg">
                            {projectCount}
                        </span>
                    </div>
                    <ul className="flex flex-col gap-3 md:gap-4">
                        {favorites.projects.map((project) => (
                            <ProjectFavoriteRow
                                key={project._id}
                                project={project}
                                addLabel={addLabel}
                                removeLabel={removeLabel}
                                fromPriceLabel={fromPriceLabel}
                            />
                        ))}
                    </ul>
                </section>
            ) : null}

            {unitCount > 0 ? (
                <section className="flex flex-col gap-4 md:gap-5">
                    <div className="flex items-baseline justify-between gap-3">
                        <h3 className={PUBLIC_HEADING}>{resolveLanguageKey("unitsHeading")}</h3>
                        <span className="font-aeonik-light text-base text-pronix-ink-muted not-italic md:text-lg">
                            {unitCount}
                        </span>
                    </div>
                    <ul className="flex flex-col gap-3 md:gap-4">
                        {favorites.units.map((unit) => (
                            <UnitFavoriteRow
                                key={`${unit.projectId}-${unit.unitId}`}
                                unit={unit}
                                addLabel={addLabel}
                                removeLabel={removeLabel}
                            />
                        ))}
                    </ul>
                </section>
            ) : null}
        </div>
    );
}

export default compose(
    withLanguage(LANGUAGE_PATH),
    withDebug(true, true),
)(SavedPageInner);
