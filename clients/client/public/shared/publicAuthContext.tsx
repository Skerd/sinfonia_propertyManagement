import {createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode} from "react";
import {useDispatch, useSelector} from "react-redux";
import {useNavigate} from "react-router-dom";
import apiClient from "@coreModule/helpers/apiClient/apiClient.ts";
import {getToken} from "@coreModule/helpers/context/localStorage/authenticationStorage.ts";
import {RootState} from "@coreModule/helpers/redux/store/generalStore.ts";
import {
    type AuthUser,
    signOut,
    updateToken,
    updateUserData,
} from "@coreModule/helpers/redux/slices/authSlice.ts";
import {ValidateTokenFormResponseType} from "armonia/src/modules/core/api/user/public/validateToken/validateToken.form.response.type.ts";

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
 * apiClient session expiry. Does not use the panel AuthenticationProvider
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

    useEffect(() => {
        if (sessionExpired) {
            setIsHydrating(false);
            navigate("/login");
            return;
        }

        if (!token) {
            setIsHydrating(false);
            return;
        }

        const abortController = new AbortController();
        setIsHydrating(true);

        apiClient
            .get<ValidateTokenFormResponseType>("/api/user/validateToken", {signal: abortController.signal})
            .then(({data}) => {
                if (abortController.signal.aborted) return;
                dispatch(updateUserData(data));
                dispatch(updateToken(token));
                setIsHydrating(false);
            })
            .catch(() => {
                if (abortController.signal.aborted) return;
                dispatch(signOut());
                setIsHydrating(false);
            });

        return () => {
            abortController.abort();
        };
    }, [dispatch, navigate, sessionExpired, token]);

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
