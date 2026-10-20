import {Navigate, useLocation} from "react-router-dom";
import Loader from "@coreModule/components/custom/loader/loader.tsx";
import {safeNextPath} from "@coreModule/helpers/publicAuth/safeNextPath.ts";
import {usePublicAuth} from "@propertyManagementModule/clients/client/public/shared/publicAuthContext.tsx";

/** Sends already-authenticated users away from login/signup. */
function PublicGuestOnly({children}: {children: React.ReactNode}) {
    const {isAuthenticated, isHydrating} = usePublicAuth();
    const location = useLocation();

    if (isHydrating) {
        return <Loader />;
    }

    if (isAuthenticated) {
        return <Navigate to={safeNextPath(location.search, "/profile")} replace />;
    }

    return children;
}

export default PublicGuestOnly;
