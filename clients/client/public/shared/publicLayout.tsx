import {Outlet} from "react-router-dom";
import {AiChatProvider} from "@propertyManagementModule/clients/client/public/shared/aiChat/aiChatContext.tsx";
import PublicAiChat from "@propertyManagementModule/clients/client/public/shared/aiChat/publicAiChat.tsx";
import {PublicFavoritesProvider} from "@propertyManagementModule/clients/client/public/shared/favorites/publicFavoritesContext.tsx";
import PublicFavoritesPanelHost from "@propertyManagementModule/clients/client/public/shared/favorites/publicFavoritesPanelHost.tsx";
import PublicScrollToTop from "@propertyManagementModule/clients/client/public/shared/publicScrollToTop.tsx";
import {getSiteCompany} from "@coreModule/helpers/apiClient/siteCompany.ts";

/** Routes render their own Figma header via PageHeaderSection — no duplicate navbar here. */
function PublicLayout() {
    return (
        <PublicFavoritesProvider>
            <AiChatProvider>
                <PublicScrollToTop />
                <div className="min-h-screen min-w-0 w-full overflow-x-clip bg-white">
                    <Outlet />
                </div>
                {/* No visitor chat on the central portal (v1): the API refuses it there. */}
                {getSiteCompany() === null && <PublicAiChat />}
                <PublicFavoritesPanelHost />
            </AiChatProvider>
        </PublicFavoritesProvider>
    );
}

export default PublicLayout;
