import {lazy, Suspense} from "react";
import {Route, Routes} from "react-router-dom";
import ErrorBoundary from "@coreModule/components/custom/errors/errorBoundary.tsx";
import Loader from "@coreModule/components/custom/loader/loader.tsx";
import SitePageLayout from "@coreModule/clients/portal/shared/sitePageLayout.tsx";
import PortalNotFound from "@coreModule/clients/portal/notFound/index.tsx";

const ProjectsPage = lazy(() => import("./propertyProjects.tsx"));
const ProjectPage = lazy(() => import("./propertyProject.tsx"));
const UnitPage = lazy(() => import("./propertyUnit.tsx"));

/**
 * One real-estate company's developments in the portal: under `/properties` on its own site,
 * `/properties/<company>` on the apex. Inquiries become the company's leads.
 */
export default function PropertiesSiteRoutes() {
    return (
        <Suspense fallback={<Loader />}>
            <Routes>
                <Route element={<SitePageLayout />}>
                    <Route index element={<ErrorBoundary><ProjectsPage /></ErrorBoundary>} />
                    <Route path="projects/:projectId" element={<ErrorBoundary><ProjectPage /></ErrorBoundary>} />
                    <Route path="projects/:projectId/units/:unitId" element={<ErrorBoundary><UnitPage /></ErrorBoundary>} />
                    <Route path="*" element={<PortalNotFound />} />
                </Route>
            </Routes>
        </Suspense>
    );
}
