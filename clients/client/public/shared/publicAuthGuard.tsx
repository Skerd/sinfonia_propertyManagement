import {Navigate, Outlet, useLocation} from "react-router-dom";
import Loader from "@coreModule/components/custom/loader/loader.tsx";
import {usePublicAuth} from "@propertyManagementModule/clients/client/public/shared/publicAuthContext.tsx";

/** Blocks unauthenticated access to /profile and nested routes. */
function PublicAuthGuard() {
    const {isAuthenticated, isHydrating} = usePublicAuth();
    const location = useLocation();

    if (isHydrating) {
        return <Loader />;
    }

    if (!isAuthenticated) {
        const next = `${location.pathname}${location.search}`;
        return <Navigate to={`/login?next=${encodeURIComponent(next)}`} replace />;
    }

    return <Outlet />;
}

export default PublicAuthGuard;
