import {Outlet} from "react-router-dom";
import {AiChatProvider} from "@propertyManagementModule/clients/client/public/shared/aiChat/aiChatContext.tsx";
import PublicAiChat from "@propertyManagementModule/clients/client/public/shared/aiChat/publicAiChat.tsx";
import {PublicFavoritesProvider} from "@propertyManagementModule/clients/client/public/shared/favorites/publicFavoritesContext.tsx";
import PublicFavoritesPanelHost from "@propertyManagementModule/clients/client/public/shared/favorites/publicFavoritesPanelHost.tsx";

/** Routes render their own Figma header via PageHeaderSection — no duplicate navbar here. */
function PublicLayout() {
    return (
        <PublicFavoritesProvider>
            <AiChatProvider>
                <div className="min-h-screen bg-white">
                    <Outlet />
                </div>
                <PublicAiChat />
                <PublicFavoritesPanelHost />
            </AiChatProvider>
        </PublicFavoritesProvider>
    );
}

export default PublicLayout;
