import {compose} from "redux";
import {Link, useLocation, useNavigate} from "react-router-dom";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {LoginFormType} from "armonia/src/modules/core/api/user/public/login/login.form.type.ts";
import {safeNextPath} from "@coreModule/helpers/publicAuth/safeNextPath.ts";
import {usePublicLoginForm} from "@coreModule/helpers/publicAuth/usePublicLoginForm.ts";
import {
    LoginFormResponseType,
    MFAEnabledLoginFormResponseType,
} from "armonia/src/modules/core/api/user/public/login/login.form.response.type.ts";
import {
    AUTH_FIELD_INPUT_CLASS,
    AUTH_FIELD_SHELL_CLASS,
    AUTH_FIELD_SHELL_ERROR_CLASS,
    AUTH_LINK_CLASS,
    AUTH_SUBMIT_CLASS,
    AuthFieldError,
    AuthStatusMessage,
    PublicAuthPageShell,
} from "@propertyManagementModule/clients/client/public/auth/shared/publicAuthChrome.tsx";
import PublicGuestOnly from "@propertyManagementModule/clients/client/public/auth/shared/publicGuestOnly.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";

const LANGUAGE_PATH = "src/modules/propertyManagement/clients/client/public/auth/login/index.tsx";

type LoginPageProps = WithLanguageType &
    WithAxiosType<LoginFormResponseType & MFAEnabledLoginFormResponseType, LoginFormType>;

function LoginPageInner({
    resolveLanguageKey,
    languageCode,
    onFilterChange,
    loading,
    innerRef,
    error,
}: LoginPageProps) {
    const navigate = useNavigate();
    const location = useLocation();
    const {
        username, setUsername,
        password, setPassword,
        mfaCode, setMfaCode,
        needsMfa, cancelMfa,
        fieldErrors, clearFieldError,
        handleSubmit,
    } = usePublicLoginForm({
        resolveLanguageKey,
        languageCode,
        onFilterChange,
        innerRef,
        busy: loading,
        onLoggedIn: () => navigate(safeNextPath(location.search, "/profile")),
    });

    return (
        <PublicGuestOnly>
            <PublicAuthPageShell
                nodeId="auth:login"
                nodeName="Log in"
                title={needsMfa ? resolveLanguageKey("mfaTitle") : resolveLanguageKey("title")}
                subtitle={needsMfa ? resolveLanguageKey("mfaSubtitle") : resolveLanguageKey("subtitle")}
            >
                <form className="flex flex-col gap-6 md:gap-8" onSubmit={handleSubmit} noValidate>
                    {!needsMfa ? (
                        <>
                            <div className="w-full min-w-0">
                                <div className={cn(AUTH_FIELD_SHELL_CLASS, fieldErrors.username && AUTH_FIELD_SHELL_ERROR_CLASS)}>
                                    <input
                                        type="email"
                                        name="username"
                                        autoComplete="email"
                                        placeholder={resolveLanguageKey("form.emailPlaceholder")}
                                        value={username}
                                        disabled={loading}
                                        aria-invalid={!!fieldErrors.username || undefined}
                                        onChange={(e) => {
                                            clearFieldError("username");
                                            setUsername(e.target.value);
                                        }}
                                        className={AUTH_FIELD_INPUT_CLASS}
                                    />
                                </div>
                                <AuthFieldError message={fieldErrors.username} />
                            </div>
                            <div className="w-full min-w-0">
                                <div className={cn(AUTH_FIELD_SHELL_CLASS, fieldErrors.password && AUTH_FIELD_SHELL_ERROR_CLASS)}>
                                    <input
                                        type="password"
                                        name="password"
                                        autoComplete="current-password"
                                        placeholder={resolveLanguageKey("form.passwordPlaceholder")}
                                        value={password}
                                        disabled={loading}
                                        aria-invalid={!!fieldErrors.password || undefined}
                                        onChange={(e) => {
                                            clearFieldError("password");
                                            setPassword(e.target.value);
                                        }}
                                        className={AUTH_FIELD_INPUT_CLASS}
                                    />
                                </div>
                                <AuthFieldError message={fieldErrors.password} />
                            </div>
                        </>
                    ) : (
                        <div className="w-full min-w-0">
                            <div className={cn(AUTH_FIELD_SHELL_CLASS, fieldErrors.mfaCode && AUTH_FIELD_SHELL_ERROR_CLASS)}>
                                <input
                                    type="text"
                                    name="mfaCode"
                                    inputMode="numeric"
                                    autoComplete="one-time-code"
                                    placeholder={resolveLanguageKey("form.mfaCodePlaceholder")}
                                    value={mfaCode}
                                    disabled={loading}
                                    aria-invalid={!!fieldErrors.mfaCode || undefined}
                                    onChange={(e) => {
                                        clearFieldError("mfaCode");
                                        setMfaCode(e.target.value);
                                    }}
                                    className={AUTH_FIELD_INPUT_CLASS}
                                />
                            </div>
                            <AuthFieldError message={fieldErrors.mfaCode} />
                        </div>
                    )}

                    <button type="submit" disabled={loading} className={AUTH_SUBMIT_CLASS}>
                        {loading
                            ? resolveLanguageKey("submitting")
                            : needsMfa
                              ? resolveLanguageKey("verify")
                              : resolveLanguageKey("submit")}
                    </button>

                    {error && Object.keys(fieldErrors).length === 0 ? (
                        <AuthStatusMessage tone="error">{resolveLanguageKey("formError")}</AuthStatusMessage>
                    ) : null}

                    {!needsMfa ? (
                        <div className="flex flex-col gap-3 font-aeonik-light text-base text-pronix-ink-muted md:text-lg">
                            <Link to="/forgot-password" className={AUTH_LINK_CLASS}>
                                {resolveLanguageKey("forgotPassword")}
                            </Link>
                            <p>
                                {resolveLanguageKey("noAccount")}{" "}
                                <Link to="/signup" className={AUTH_LINK_CLASS}>
                                    {resolveLanguageKey("signUpLink")}
                                </Link>
                            </p>
                        </div>
                    ) : (
                        <button
                            type="button"
                            className={`${AUTH_LINK_CLASS} text-left`}
                            onClick={cancelMfa}
                        >
                            {resolveLanguageKey("backToLogin")}
                        </button>
                    )}
                </form>
            </PublicAuthPageShell>
        </PublicGuestOnly>
    );
}

export default compose(
    withLanguage(LANGUAGE_PATH),
    withAxios<LoginFormResponseType & MFAEnabledLoginFormResponseType, LoginFormType>(
        {method: "post", url: "/api/user/login", data: {}},
        true,
    ),
    withDebug(true, true),
)(LoginPageInner);
