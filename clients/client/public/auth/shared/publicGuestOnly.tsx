import {Navigate, useLocation} from "react-router-dom";
import Loader from "@coreModule/components/custom/loader/loader.tsx";
import {usePublicAuth} from "@propertyManagementModule/clients/client/public/shared/publicAuthContext.tsx";

/** Sends already-authenticated users away from login/signup. */
function PublicGuestOnly({children}: {children: React.ReactNode}) {
    const {isAuthenticated, isHydrating} = usePublicAuth();
    const location = useLocation();

    if (isHydrating) {
        return <Loader />;
    }

    if (isAuthenticated) {
        const params = new URLSearchParams(location.search);
        const next = params.get("next");
        return <Navigate to={next && next.startsWith("/") ? next : "/profile"} replace />;
    }

    return children;
}

export default PublicGuestOnly;
