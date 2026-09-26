import {Toaster} from "sonner";
import {Provider} from "react-redux";
import {store} from "@coreModule/helpers/redux/store/generalStore.ts";
import {LanguageProvider} from "@coreModule/helpers/context/providers/language-provider.tsx";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import ErrorBoundary from "@coreModule/components/custom/errors/errorBoundary.tsx";
import {lazy, Suspense} from "react";
import Loader from "@coreModule/components/custom/loader/loader.tsx";
import {useIsMobile} from "@coreModule/helpers/hooks/useMobile.tsx";
import PublicLayout from "@propertyManagementModule/clients/client/public/shared/publicLayout.tsx";
import PublicHomeIntroSplash from "@propertyManagementModule/clients/client/public/home/sections/publicHomeIntroSplash.tsx";
import {PublicIntroProvider} from "@propertyManagementModule/clients/client/public/shared/publicIntroContext.tsx";
import {PublicAuthProvider} from "@propertyManagementModule/clients/client/public/shared/publicAuthContext.tsx";
import PublicAuthGuard from "@propertyManagementModule/clients/client/public/shared/publicAuthGuard.tsx";
import {ensureDeviceId} from "@coreModule/helpers/context/localStorage/authenticationStorage.ts";

const HomePage = lazy(() => import("@propertyManagementModule/clients/client/public/home/index.tsx"));
const ProjectsPage = lazy(() => import("@propertyManagementModule/clients/client/public/projects/index.tsx"));
const AboutPage = lazy(() => import("@propertyManagementModule/clients/client/public/about/index.tsx"));
const InvestorsPage = lazy(() => import("@propertyManagementModule/clients/client/public/investors/index.tsx"));
const DevelopersPage = lazy(() => import("@propertyManagementModule/clients/client/public/developers/index.tsx"));
const ContactPage = lazy(() => import("@propertyManagementModule/clients/client/public/contact/index.tsx"));
const PrivacyPage = lazy(() => import("@propertyManagementModule/clients/client/public/privacy/index.tsx"));
const TermsPage = lazy(() => import("@propertyManagementModule/clients/client/public/terms/index.tsx"));
const PropertyPage = lazy(() => import("@propertyManagementModule/clients/client/public/property/index.tsx"));
const ProjectPage = lazy(() => import("@propertyManagementModule/clients/client/public/project/gallery/index.tsx"));
const OpenProjectFigmaPage = lazy(() => import("@propertyManagementModule/clients/client/public/openProjectFigma/index.tsx"));
const UnsubscribePage = lazy(() => import("@propertyManagementModule/clients/client/public/unsubscribe/index.tsx"));
const LoginPage = lazy(() => import("@propertyManagementModule/clients/client/public/auth/login/index.tsx"));
const SignUpPage = lazy(() => import("@propertyManagementModule/clients/client/public/auth/signup/index.tsx"));
const ActivatePage = lazy(() => import("@propertyManagementModule/clients/client/public/auth/activate/index.tsx"));
const ForgotPasswordPage = lazy(() => import("@propertyManagementModule/clients/client/public/auth/forgotPassword/index.tsx"));
const ResetPasswordPage = lazy(() => import("@propertyManagementModule/clients/client/public/auth/resetPassword/index.tsx"));
const ProfileLayout = lazy(() => import("@propertyManagementModule/clients/client/public/profile/profileLayout.tsx"));
const ProfileOverviewPage = lazy(() => import("@propertyManagementModule/clients/client/public/profile/overview/index.tsx"));
const PortfolioLayout = lazy(() => import("@propertyManagementModule/clients/client/public/profile/portfolio/portfolioLayout.tsx"));
const PortfolioOverviewPage = lazy(() => import("@propertyManagementModule/clients/client/public/profile/portfolio/overview/index.tsx"));
const PortfolioPropertiesPage = lazy(() => import("@propertyManagementModule/clients/client/public/profile/portfolio/properties/index.tsx"));
const PortfolioReservationsPage = lazy(() => import("@propertyManagementModule/clients/client/public/profile/portfolio/reservations/index.tsx"));
const PortfolioSavedPage = lazy(() => import("@propertyManagementModule/clients/client/public/profile/portfolio/saved/index.tsx"));

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
                <BrowserRouter>
                    <PublicAuthProvider>
                        <PublicIntroProvider>
                            <PublicHomeIntroSplash />
                            <Suspense fallback={<Loader />}>
                                <Routes>
                                    <Route element={<PublicLayout />}>
                                        <Route index element={<ErrorBoundary><HomePage /></ErrorBoundary>} />
                                        <Route path="projects" element={<ErrorBoundary><ProjectsPage /></ErrorBoundary>} />
                                        <Route path="about" element={<ErrorBoundary><AboutPage /></ErrorBoundary>} />
                                        <Route path="investors" element={<ErrorBoundary><InvestorsPage /></ErrorBoundary>} />
                                        <Route path="developers" element={<ErrorBoundary><DevelopersPage /></ErrorBoundary>} />
                                        <Route path="contact" element={<ErrorBoundary><ContactPage /></ErrorBoundary>} />
                                        <Route path="privacy" element={<ErrorBoundary><PrivacyPage /></ErrorBoundary>} />
                                        <Route path="terms" element={<ErrorBoundary><TermsPage /></ErrorBoundary>} />
                                        <Route path="property" element={<ErrorBoundary><PropertyPage /></ErrorBoundary>} />
                                        <Route path="project" element={<ErrorBoundary><ProjectPage /></ErrorBoundary>} />
                                        <Route path="open-project" element={<ErrorBoundary><OpenProjectFigmaPage /></ErrorBoundary>} />
                                        <Route path="open-project/:view" element={<ErrorBoundary><OpenProjectFigmaPage /></ErrorBoundary>} />
                                        <Route path="unsubscribe" element={<ErrorBoundary><UnsubscribePage /></ErrorBoundary>} />
                                        <Route path="login" element={<ErrorBoundary><LoginPage /></ErrorBoundary>} />
                                        <Route path="signup" element={<ErrorBoundary><SignUpPage /></ErrorBoundary>} />
                                        <Route path="activate/:code" element={<ErrorBoundary><ActivatePage /></ErrorBoundary>} />
                                        <Route path="forgot-password" element={<ErrorBoundary><ForgotPasswordPage /></ErrorBoundary>} />
                                        <Route path="reset-password/:code" element={<ErrorBoundary><ResetPasswordPage /></ErrorBoundary>} />
                                        <Route path="profile" element={<PublicAuthGuard />}>
                                            <Route element={<ProfileLayout />}>
                                                <Route index element={<ErrorBoundary><ProfileOverviewPage /></ErrorBoundary>} />
                                                <Route path="portfolio" element={<PortfolioLayout />}>
                                                    <Route index element={<ErrorBoundary><PortfolioOverviewPage /></ErrorBoundary>} />
                                                    <Route path="properties" element={<ErrorBoundary><PortfolioPropertiesPage /></ErrorBoundary>} />
                                                    <Route path="reservations" element={<ErrorBoundary><PortfolioReservationsPage /></ErrorBoundary>} />
                                                    <Route path="saved" element={<ErrorBoundary><PortfolioSavedPage /></ErrorBoundary>} />
                                                </Route>
                                            </Route>
                                        </Route>
                                    </Route>
                                </Routes>
                            </Suspense>
                        </PublicIntroProvider>
                    </PublicAuthProvider>
                </BrowserRouter>
            </LanguageProvider>
            <ToasterContainer />
        </Provider>
    );
}

export default PublicApp;
