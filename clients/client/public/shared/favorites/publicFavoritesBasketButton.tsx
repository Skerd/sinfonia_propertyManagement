import {ResolveLanguageKey} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {usePublicFavorites} from "@propertyManagementModule/clients/client/public/shared/favorites/publicFavoritesContext.tsx";
import PublicFavoriteHeartIcon from "@propertyManagementModule/clients/client/public/shared/favorites/publicFavoriteHeartIcon.tsx";

const heartButtonClassName =
    "relative flex size-9 shrink-0 items-center justify-center rounded-full border border-[rgba(24,24,24,0.1)] bg-white";

type PublicFavoritesBasketButtonProps = {
    resolveLanguageKey: ResolveLanguageKey;
};

function PublicFavoritesBasketButton({resolveLanguageKey}: PublicFavoritesBasketButtonProps) {
    const {totalCount, openPanel} = usePublicFavorites();
    const displayCount = totalCount > 99 ? "99+" : String(totalCount);

    return (
        <button
            type="button"
            className={heartButtonClassName}
            onClick={openPanel}
            aria-label={String(resolveLanguageKey("favoritesBasket"))}
        >
            <PublicFavoriteHeartIcon active={false} />
            {totalCount > 0 ? (
                <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 font-aeonik-medium text-xs text-white not-italic">
                    {displayCount}
                </span>
            ) : null}
        </button>
    );
}

export default PublicFavoritesBasketButton;
