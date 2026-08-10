import {useEffect, type ReactNode} from "react";
import {createPortal} from "react-dom";
import {Link} from "react-router-dom";
import {ResolveLanguageKey} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {projectsAssets} from "@propertyManagementModule/clients/client/public/projects/projectsAssets.ts";
import {usePublicFavorites} from "@propertyManagementModule/clients/client/public/shared/favorites/publicFavoritesContext.tsx";
import PublicFavoriteHeartButton from "@propertyManagementModule/clients/client/public/shared/favorites/publicFavoriteHeartButton.tsx";
import PublicFavoriteHeartIcon from "@propertyManagementModule/clients/client/public/shared/favorites/publicFavoriteHeartIcon.tsx";
import type {
    PublicFavoriteProject,
    PublicFavoriteUnit,
} from "@propertyManagementModule/clients/client/public/shared/favorites/publicFavoritesTypes.ts";
import {
    PUBLIC_CONTENT_FRAME,
    PUBLIC_HEADING,
    PUBLIC_SUBTITLE,
    PUBLIC_TITLE,
} from "@propertyManagementModule/clients/client/public/shared/layout/publicLayoutTokens.ts";
import {lockPublicBodyScroll} from "@propertyManagementModule/clients/client/public/shared/lockPublicBodyScroll.ts";
import {resolveMarketingMediaUrl} from "@propertyManagementModule/clients/client/public/shared/resolveMarketingMedia.ts";

type PublicFavoritesPanelProps = {
    resolveLanguageKey: ResolveLanguageKey;
};

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

type FavoriteRowShellProps = {
    to: string;
    imageUrl?: string;
    onNavigate: () => void;
    heart: ReactNode;
    children: ReactNode;
};

function FavoriteRowShell({to, imageUrl, onNavigate, heart, children}: FavoriteRowShellProps) {
    return (
        <li className={rowClassName}>
            <Link to={to} onClick={onNavigate} className="flex min-w-0 flex-1 items-center gap-4 p-3 md:gap-5 md:p-4">
                <img
                    alt=""
                    className="size-20 shrink-0 rounded-[2px] object-cover md:size-24"
                    src={resolveFavoriteImageSrc(imageUrl)}
                />
                <div className="flex min-w-0 flex-1 flex-col gap-1.5 py-0.5 md:gap-2">{children}</div>
            </Link>
            <div className="flex shrink-0 items-start p-3 md:p-4">{heart}</div>
        </li>
    );
}

function ProjectFavoriteRow({
    project,
    addLabel,
    removeLabel,
    fromPriceLabel,
    onNavigate,
}: {
    project: PublicFavoriteProject;
    addLabel: string;
    removeLabel: string;
    fromPriceLabel: string;
    onNavigate: () => void;
}) {
    return (
        <FavoriteRowShell
            to={`/project?projectId=${project._id}`}
            imageUrl={project.mainImage}
            onNavigate={onNavigate}
            heart={
                <PublicFavoriteHeartButton
                    kind="project"
                    project={project}
                    addLabel={addLabel}
                    removeLabel={removeLabel}
                />
            }
        >
            <p className={metaTitleClassName}>{project.name}</p>
            {project.location ? <p className={metaLineClassName}>{project.location}</p> : null}
            {project.minSharePrice != null ? (
                <p className={priceClassName}>
                    {fromPriceLabel} €{project.minSharePrice.toLocaleString()}/m²
                </p>
            ) : null}
        </FavoriteRowShell>
    );
}

function UnitFavoriteRow({
    unit,
    addLabel,
    removeLabel,
    onNavigate,
}: {
    unit: PublicFavoriteUnit;
    addLabel: string;
    removeLabel: string;
    onNavigate: () => void;
}) {
    return (
        <FavoriteRowShell
            to={`/property?projectId=${unit.projectId}&unitId=${unit.unitId}`}
            imageUrl={unit.imageUrl}
            onNavigate={onNavigate}
            heart={
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
                    }}
                    addLabel={addLabel}
                    removeLabel={removeLabel}
                />
            }
        >
            <p className={metaTitleClassName}>{unit.name}</p>
            {unit.projectName ? <p className={metaLineClassName}>{unit.projectName}</p> : null}
            {unit.floorLabel ? <p className={metaLineClassName}>{unit.floorLabel}</p> : null}
            {unit.price != null ? <p className={priceClassName}>€{unit.price.toLocaleString()}</p> : null}
        </FavoriteRowShell>
    );
}

function PublicFavoritesPanel({resolveLanguageKey}: PublicFavoritesPanelProps) {
    const {favorites, panelOpen, closePanel, totalCount} = usePublicFavorites();

    useEffect(() => {
        if (!panelOpen) {
            return;
        }
        const onKey = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                closePanel();
            }
        };
        const unlockScroll = lockPublicBodyScroll();
        window.addEventListener("keydown", onKey);
        return () => {
            unlockScroll();
            window.removeEventListener("keydown", onKey);
        };
    }, [panelOpen, closePanel]);

    if (!panelOpen) {
        return null;
    }

    const addLabel = String(resolveLanguageKey("favoritesAdd"));
    const removeLabel = String(resolveLanguageKey("favoritesRemove"));
    const fromPriceLabel = String(resolveLanguageKey("fromPrice"));
    const projectCount = favorites.projects.length;
    const unitCount = favorites.units.length;

    return createPortal(
        <div
            className="fixed inset-0 z-[150] flex flex-col sm:items-center sm:justify-center sm:bg-black/40 sm:p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="public-favorites-title"
            onClick={closePanel}
        >
            <div
                className="flex min-h-0 flex-1 flex-col overflow-hidden bg-white sm:max-h-[90vh] sm:w-full sm:max-w-5xl sm:flex-none sm:rounded-[5px] sm:shadow-lg"
                onClick={(event) => event.stopPropagation()}
            >
                <div className={`${PUBLIC_CONTENT_FRAME} flex shrink-0 items-center justify-between border-b border-pronix-border py-6 md:py-8`}>
                    <div className="min-w-0">
                        <h2 id="public-favorites-title" className={PUBLIC_TITLE}>
                            {resolveLanguageKey("favoritesTitle")}
                        </h2>
                        {totalCount > 0 ? (
                            <p className={`${PUBLIC_SUBTITLE} mt-2 text-pronix-ink-muted`}>
                                {totalCount}{" "}
                                {totalCount === 1
                                    ? resolveLanguageKey("favoritesSavedOne")
                                    : resolveLanguageKey("favoritesSavedMany")}
                            </p>
                        ) : null}
                    </div>
                    <button
                        type="button"
                        onClick={closePanel}
                        className="flex size-11 shrink-0 items-center justify-center rounded-[5px] border border-pronix-border transition hover:border-pronix-ink"
                        aria-label={String(resolveLanguageKey("favoritesClose"))}
                    >
                        <img alt="" aria-hidden className="size-8 md:size-9" src={projectsAssets.filterClose} />
                    </button>
                </div>

                <div className={`${PUBLIC_CONTENT_FRAME} min-h-0 flex-1 overflow-y-auto py-8 md:py-10`}>
                    {totalCount === 0 ? (
                        <div className="mx-auto flex max-w-md flex-col items-center justify-center gap-5 py-10 text-center md:py-16">
                            <div className="flex size-14 items-center justify-center rounded-full border border-pronix-border bg-white">
                                <PublicFavoriteHeartIcon active={false} />
                            </div>
                            <div className="flex flex-col gap-2">
                                <p className={`${PUBLIC_HEADING}`}>{resolveLanguageKey("favoritesEmpty")}</p>
                                <p className={`${PUBLIC_SUBTITLE} text-pronix-ink-muted`}>
                                    {resolveLanguageKey("favoritesEmptyHint")}
                                </p>
                            </div>
                            <Link
                                to="/projects"
                                onClick={closePanel}
                                className="mt-2 rounded-[5px] bg-pronix-blue px-8 py-3 font-aeonik-medium text-white not-italic transition hover:opacity-90 md:text-lg"
                            >
                                {resolveLanguageKey("favoritesBrowse")}
                            </Link>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-10 md:gap-12">
                            {projectCount > 0 ? (
                                <section className="flex flex-col gap-4 md:gap-5">
                                    <div className="flex items-baseline justify-between gap-3">
                                        <h3 className={PUBLIC_HEADING}>{resolveLanguageKey("favoritesProjects")}</h3>
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
                                                onNavigate={closePanel}
                                            />
                                        ))}
                                    </ul>
                                </section>
                            ) : null}

                            {unitCount > 0 ? (
                                <section className="flex flex-col gap-4 md:gap-5">
                                    <div className="flex items-baseline justify-between gap-3">
                                        <h3 className={PUBLIC_HEADING}>{resolveLanguageKey("favoritesUnits")}</h3>
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
                                                onNavigate={closePanel}
                                            />
                                        ))}
                                    </ul>
                                </section>
                            ) : null}
                        </div>
                    )}
                </div>
            </div>
        </div>,
        document.body,
    );
}

export default PublicFavoritesPanel;
