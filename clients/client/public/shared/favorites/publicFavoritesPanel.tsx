import {useEffect} from "react";
import {createPortal} from "react-dom";
import {Link} from "react-router-dom";
import {ResolveLanguageKey} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {projectsAssets} from "@propertyManagementModule/clients/client/public/projects/projectsAssets.ts";
import {usePublicFavorites} from "@propertyManagementModule/clients/client/public/shared/favorites/publicFavoritesContext.tsx";
import PublicFavoriteHeartButton from "@propertyManagementModule/clients/client/public/shared/favorites/publicFavoriteHeartButton.tsx";
import {
    PUBLIC_CONTENT_FRAME,
    PUBLIC_HEADING,
    PUBLIC_SUBTITLE,
    PUBLIC_TITLE,
} from "@propertyManagementModule/clients/client/public/shared/layout/publicLayoutTokens.ts";

type PublicFavoritesPanelProps = {
    resolveLanguageKey: ResolveLanguageKey;
};

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
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [panelOpen, closePanel]);

    if (!panelOpen) {
        return null;
    }

    const addLabel = String(resolveLanguageKey("favoritesAdd"));
    const removeLabel = String(resolveLanguageKey("favoritesRemove"));

    return createPortal(
        <div
            className="fixed inset-0 z-[150] flex flex-col sm:items-center sm:justify-center sm:bg-black/40 sm:p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="public-favorites-title"
            onClick={closePanel}
        >
            <div
                className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-white sm:max-h-[90vh] sm:w-full sm:max-w-5xl sm:flex-none sm:rounded-[5px] sm:shadow-lg"
                onClick={(event) => event.stopPropagation()}
            >
                <div className={`${PUBLIC_CONTENT_FRAME} flex flex-col gap-10 py-8 md:gap-12 md:py-12`}>
                    <div className="flex items-center justify-between border-b border-pronix-border pb-6">
                        <h2 id="public-favorites-title" className={PUBLIC_TITLE}>
                            {resolveLanguageKey("favoritesTitle")}
                        </h2>
                        <button type="button" onClick={closePanel} aria-label={String(resolveLanguageKey("favoritesClose"))}>
                            <img alt="" aria-hidden className="size-8 md:size-9" src={projectsAssets.filterClose} />
                        </button>
                    </div>

                    {totalCount === 0 ? (
                        <p className={`${PUBLIC_SUBTITLE} text-pronix-ink-muted`}>{resolveLanguageKey("favoritesEmpty")}</p>
                    ) : (
                        <div className="flex flex-col gap-10 md:gap-12">
                            {favorites.projects.length > 0 ? (
                                <section className="flex flex-col gap-4">
                                    <h3 className={PUBLIC_HEADING}>{resolveLanguageKey("favoritesProjects")}</h3>
                                    <ul className="flex flex-col gap-4">
                                        {favorites.projects.map((project) => (
                                            <li
                                                key={project._id}
                                                className="flex items-center gap-4 rounded-[5px] border border-pronix-border p-4"
                                            >
                                                <img
                                                    alt=""
                                                    className="size-16 shrink-0 rounded-[2px] object-cover md:size-20"
                                                    src={project.mainImage ?? projectsAssets.cardPlaceholder}
                                                />
                                                <div className="min-w-0 flex-1">
                                                    <Link
                                                        to={`/project/gallery?projectId=${project._id}`}
                                                        className="font-aeonik-medium text-lg text-pronix-ink hover:underline not-italic md:text-xl"
                                                        onClick={closePanel}
                                                    >
                                                        {project.name}
                                                    </Link>
                                                    {project.location ? (
                                                        <p className="mt-1 font-aeonik-light text-sm text-pronix-ink-muted not-italic md:text-base">
                                                            {project.location}
                                                        </p>
                                                    ) : null}
                                                    {project.minSharePrice != null ? (
                                                        <p className="mt-1 font-aeonik-light text-sm text-pronix-blue not-italic md:text-base">
                                                            €{project.minSharePrice.toLocaleString()}/m²
                                                        </p>
                                                    ) : null}
                                                </div>
                                                <PublicFavoriteHeartButton
                                                    kind="project"
                                                    project={project}
                                                    addLabel={addLabel}
                                                    removeLabel={removeLabel}
                                                />
                                            </li>
                                        ))}
                                    </ul>
                                </section>
                            ) : null}

                            {favorites.units.length > 0 ? (
                                <section className="flex flex-col gap-4">
                                    <h3 className={PUBLIC_HEADING}>{resolveLanguageKey("favoritesUnits")}</h3>
                                    <ul className="flex flex-col gap-4">
                                        {favorites.units.map((unit) => (
                                            <li
                                                key={`${unit.projectId}-${unit.unitId}`}
                                                className="flex items-center gap-4 rounded-[5px] border border-pronix-border p-4"
                                            >
                                                <img
                                                    alt=""
                                                    className="size-16 shrink-0 rounded-[2px] object-cover md:size-20"
                                                    src={unit.imageUrl ?? projectsAssets.cardPlaceholder}
                                                />
                                                <div className="min-w-0 flex-1">
                                                    <Link
                                                        to={`/property?projectId=${unit.projectId}&unitId=${unit.unitId}`}
                                                        className="font-aeonik-medium text-lg text-pronix-ink hover:underline not-italic md:text-xl"
                                                        onClick={closePanel}
                                                    >
                                                        {unit.name}
                                                    </Link>
                                                    {unit.projectName ? (
                                                        <p className="mt-1 font-aeonik-light text-sm text-pronix-ink-muted not-italic md:text-base">
                                                            {unit.projectName}
                                                        </p>
                                                    ) : null}
                                                    {unit.floorLabel ? (
                                                        <p className="mt-1 font-aeonik-light text-sm text-pronix-ink-muted not-italic md:text-base">
                                                            {unit.floorLabel}
                                                        </p>
                                                    ) : null}
                                                    {unit.price != null ? (
                                                        <p className="mt-1 font-aeonik-light text-sm text-pronix-blue not-italic md:text-base">
                                                            €{unit.price.toLocaleString()}
                                                        </p>
                                                    ) : null}
                                                </div>
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
                                            </li>
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
