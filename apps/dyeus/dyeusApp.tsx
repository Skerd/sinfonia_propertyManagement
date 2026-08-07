import {Toaster} from "sonner";
import {Provider} from "react-redux";
import {store} from "@coreModule/helpers/redux/store/generalStore.ts";
import {LanguageProvider} from "@coreModule/helpers/context/providers/language-provider.tsx";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import ErrorBoundary from "@coreModule/components/custom/errorBoundary.tsx";
import {lazy, Suspense} from "react";
import Loader from "@coreModule/components/custom/loader.tsx";
import {useIsMobile} from "@coreModule/helpers/hooks/useMobile.tsx";
import {getLocalStorageValue, setLocalStorageValue} from "@coreModule/helpers/context/localStorage/localStorageProvider.ts";
import {generateUUID} from "@coreModule/helpers/general";
import DyeusLayout from "@propertyManagementModule/clients/client/dyeus/shared/dyeusLayout.tsx";
import {sinfoniaRouterBasename} from "@coreModule/helpers/sinfoniaRouterBasename";

const HomePage = lazy(() => import("@propertyManagementModule/clients/client/dyeus/home/index.tsx"));
const AboutPage = lazy(() => import("@propertyManagementModule/clients/client/dyeus/about/index.tsx"));
const ResidencesPage = lazy(() => import("@propertyManagementModule/clients/client/dyeus/residences/index.tsx"));
const GalleryPage = lazy(() => import("@propertyManagementModule/clients/client/dyeus/gallery/index.tsx"));
const JournalPage = lazy(() => import("@propertyManagementModule/clients/client/dyeus/journal/index.tsx"));
const JournalStoryPage = lazy(() => import("@propertyManagementModule/clients/client/dyeus/journal/story.tsx"));
const ContactPage = lazy(() => import("@propertyManagementModule/clients/client/dyeus/contact/index.tsx"));
const PrivacyPage = lazy(() => import("@propertyManagementModule/clients/client/dyeus/privacy/index.tsx"));
const TermsPage = lazy(() => import("@propertyManagementModule/clients/client/dyeus/terms/index.tsx"));
const PropertyPage = lazy(() => import("@propertyManagementModule/clients/client/dyeus/property/index.tsx"));

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

function DyeusApp() {
    const deviceId = getLocalStorageValue("deviceId");
    if (!deviceId) {
        setLocalStorageValue("deviceId", generateUUID());
    }

    return (
        <Provider store={store}>
            <LanguageProvider storageKey="vite-ui-language">
                <BrowserRouter basename={sinfoniaRouterBasename()}>
                    <Suspense fallback={<Loader />}>
                        <Routes>
                            <Route element={<DyeusLayout />}>
                                <Route index element={<ErrorBoundary><HomePage /></ErrorBoundary>} />
                                <Route path="about" element={<ErrorBoundary><AboutPage /></ErrorBoundary>} />
                                <Route path="residences" element={<ErrorBoundary><ResidencesPage /></ErrorBoundary>} />
                                <Route path="gallery" element={<ErrorBoundary><GalleryPage /></ErrorBoundary>} />
                                <Route path="journal" element={<ErrorBoundary><JournalPage /></ErrorBoundary>} />
                                <Route path="journal/story" element={<ErrorBoundary><JournalStoryPage /></ErrorBoundary>} />
                                <Route path="contact" element={<ErrorBoundary><ContactPage /></ErrorBoundary>} />
                                <Route path="privacy" element={<ErrorBoundary><PrivacyPage /></ErrorBoundary>} />
                                <Route path="terms" element={<ErrorBoundary><TermsPage /></ErrorBoundary>} />
                                <Route path="property" element={<ErrorBoundary><PropertyPage /></ErrorBoundary>} />
                            </Route>
                        </Routes>
                    </Suspense>
                </BrowserRouter>
            </LanguageProvider>
            <ToasterContainer />
        </Provider>
    );
}

export default DyeusApp;
