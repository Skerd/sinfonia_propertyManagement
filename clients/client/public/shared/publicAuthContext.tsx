import {createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode} from "react";
import {useDispatch, useSelector} from "react-redux";
import {useNavigate} from "react-router-dom";
import useHttpRequest, {type HttpRequest} from "@coreModule/helpers/hooks/useHttpRequest.ts";
import {getToken} from "@coreModule/helpers/context/localStorage/authenticationStorage.ts";
import {RootState} from "@coreModule/helpers/redux/store/generalStore.ts";
import {
    type AuthUser,
    signOut,
    updateToken,
    updateUserData,
} from "@coreModule/helpers/redux/slices/authSlice.ts";
import {ValidateTokenFormResponseType} from "armonia/src/modules/core/api/user/public/validateToken/validateToken.form.response.type.ts";

const VALIDATE_TOKEN_REQUEST: HttpRequest = {method: "get", url: "/api/user/validateToken"};

type PublicAuthContextValue = {
    isAuthenticated: boolean;
    isHydrating: boolean;
    user: AuthUser;
    signOutPublic: () => void;
};

const PublicAuthContext = createContext<PublicAuthContextValue | null>(null);

function isAuthenticatedUser(user: AuthUser): boolean {
    return Boolean(user.id);
}

/**
 * Thin public-site session: validates an existing token on boot and reacts to
 * the API client's session expiry. Does not use the panel AuthenticationProvider
 * (that redirects to /authenticate/login).
 */
export function PublicAuthProvider({children}: {children: ReactNode}) {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const token = useSelector((state: RootState) => state.authentication.token);
    const user = useSelector((state: RootState) => state.authentication.user);
    const sessionExpired = useSelector((state: RootState) => state.authentication.sessionExpired);
    const [isHydrating, setIsHydrating] = useState(() => Boolean(getToken()));

    const signOutPublic = useCallback(() => {
        dispatch(signOut());
        navigate("/login");
    }, [dispatch, navigate]);

    // The public site has no expiry dialog: end the session and send the visitor to log in once.
    // Signing out clears the flag, so later navigations are not redirected again.
    useEffect(() => {
        if (!sessionExpired) return;
        dispatch(signOut());
        navigate("/login");
    }, [dispatch, navigate, sessionExpired]);

    // Depends on the token only: `navigate` changes on every pathname change, and
    // re-validating then would flash guarded pages back to a loader.
    const [validateCount, setValidateCount] = useState(0);
    const tokenRef = useRef(token);
    tokenRef.current = token;
    useEffect(() => {
        if (!token) {
            setIsHydrating(false);
            return;
        }
        setIsHydrating(true);
        setValidateCount((count) => count + 1);
    }, [token]);
    useHttpRequest<ValidateTokenFormResponseType>(VALIDATE_TOKEN_REQUEST, {}, validateCount, true, {
        success: (data) => {
            // A token that changed or was cleared since is not the one this answer validated.
            if (!token || tokenRef.current !== token) return;
            dispatch(updateUserData(data));
            dispatch(updateToken(token));
            setIsHydrating(false);
        },
        error: () => {
            if (tokenRef.current !== token) return;
            dispatch(signOut());
            setIsHydrating(false);
        },
    });

    const value = useMemo(
        () => ({
            isAuthenticated: Boolean(token) && isAuthenticatedUser(user),
            isHydrating,
            user,
            signOutPublic,
        }),
        [isHydrating, signOutPublic, token, user],
    );

    return <PublicAuthContext.Provider value={value}>{children}</PublicAuthContext.Provider>;
}

export function usePublicAuth(): PublicAuthContextValue {
    const value = useContext(PublicAuthContext);
    if (!value) {
        throw new Error("usePublicAuth must be used within PublicAuthProvider");
    }
    return value;
}
