import {compose} from "redux";
import withLanguage from "@coreModule/helpers/hocs/withLanguage.tsx";
import PublicFavoritesPanel from "@propertyManagementModule/clients/client/public/shared/favorites/publicFavoritesPanel.tsx";

function PublicFavoritesPanelHost({resolveLanguageKey}: {resolveLanguageKey: (key: string) => unknown}) {
    return <PublicFavoritesPanel resolveLanguageKey={resolveLanguageKey} />;
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/client/public/projects/index.tsx"),
)(PublicFavoritesPanelHost);
