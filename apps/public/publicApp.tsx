import {Toaster} from "sonner";
import {Provider} from "react-redux";
import {store} from "@coreModule/helpers/redux/store/generalStore.ts";
import {LanguageProvider} from "@coreModule/helpers/context/providers/language-provider.tsx";
import {BrowserRouter} from "react-router-dom";
import PublicSiteRoutes from "@propertyManagementModule/clients/client/public/shared/publicSiteRoutes.tsx";
import {useIsMobile} from "@coreModule/helpers/hooks/useMobile.tsx";
import {ensureDeviceId} from "@coreModule/helpers/context/localStorage/authenticationStorage.ts";
import {TooltipProvider} from "@coreModule/components/animate-ui/components/animate/tooltip.tsx";

function ToasterContainer() {
    const isMobile = useIsMobile();
    return (
        <Toaster
            closeButton
            richColors
            position={isMobile ? "top-right" : "bottom-right"}
            expand={false}
            duration={1500}
        />
    );
}

function PublicApp() {

    ensureDeviceId();

    return (
        <Provider store={store}>
            <LanguageProvider>
                <TooltipProvider>
                <BrowserRouter>
                    <PublicSiteRoutes />
                </BrowserRouter>
                </TooltipProvider>
            </LanguageProvider>
            <ToasterContainer />
        </Provider>
    );
}

export default PublicApp;
