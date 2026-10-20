import {compose} from "redux";
import {Link} from "react-router-dom";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {ChangeForgottenPasswordFormType} from "armonia/src/modules/core/api/user/public/forgotPassword/changeForgottenPassword.form.type.ts";
import {usePublicResetPasswordForm} from "@coreModule/helpers/publicAuth/usePublicResetPasswordForm.ts";
import {ChangeForgottenPasswordFormResponseType} from "armonia/src/modules/core/api/user/public/forgotPassword/changeForgottenPassword.form.response.type.ts";
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

const LANGUAGE_PATH = "src/modules/propertyManagement/clients/client/public/auth/resetPassword/index.tsx";

type ResetPasswordPageProps = WithLanguageType &
    WithAxiosType<ChangeForgottenPasswordFormResponseType, ChangeForgottenPasswordFormType>;

function ResetPasswordPageInner({
    resolveLanguageKey,
    languageCode,
    onFilterChange,
    loading,
    innerRef,
    error,
}: ResetPasswordPageProps) {
    const {
        verifying, verifyError, success,
        password, setPassword,
        confirmPassword, setConfirmPassword,
        fieldErrors, clearFieldError,
        handleSubmit,
    } = usePublicResetPasswordForm({resolveLanguageKey, languageCode, onFilterChange, innerRef, busy: loading});

    return (
        <PublicGuestOnly>
            <PublicAuthPageShell
                nodeId="auth:reset"
                nodeName="Reset password"
                title={resolveLanguageKey("title")}
                subtitle={
                    verifying
                        ? resolveLanguageKey("verifyingSubtitle")
                        : verifyError
                          ? resolveLanguageKey("verifyErrorSubtitle")
                          : success
                            ? resolveLanguageKey("successSubtitle")
                            : resolveLanguageKey("subtitle")
                }
            >
                {verifying ? <AuthStatusMessage>{resolveLanguageKey("verifyingMessage")}</AuthStatusMessage> : null}

                {verifyError && !verifying ? (
                    <div className="flex flex-col gap-6">
                        <AuthStatusMessage tone="error">{resolveLanguageKey("verifyErrorMessage")}</AuthStatusMessage>
                        <Link to="/forgot-password" className={AUTH_LINK_CLASS}>
                            {resolveLanguageKey("requestAgain")}
                        </Link>
                    </div>
                ) : null}

                {success ? (
                    <div className="flex flex-col gap-6">
                        <AuthStatusMessage tone="success">{resolveLanguageKey("successMessage")}</AuthStatusMessage>
                        <Link to="/login" className={AUTH_LINK_CLASS}>
                            {resolveLanguageKey("goToLogin")}
                        </Link>
                    </div>
                ) : null}

                {!verifying && !verifyError && !success ? (
                    <form className="flex flex-col gap-6 md:gap-8" onSubmit={handleSubmit} noValidate>
                        <div className="w-full min-w-0">
                            <div className={cn(AUTH_FIELD_SHELL_CLASS, fieldErrors.password && AUTH_FIELD_SHELL_ERROR_CLASS)}>
                                <input
                                    type="password"
                                    name="password"
                                    autoComplete="new-password"
                                    placeholder={resolveLanguageKey("form.passwordPlaceholder")}
                                    value={password}
                                    disabled={loading}
                                    onChange={(e) => {
                                        clearFieldError("password");
                                        setPassword(e.target.value);
                                    }}
                                    className={AUTH_FIELD_INPUT_CLASS}
                                />
                            </div>
                            <AuthFieldError message={fieldErrors.password} />
                        </div>
                        <div className="w-full min-w-0">
                            <div className={cn(AUTH_FIELD_SHELL_CLASS, fieldErrors.confirmPassword && AUTH_FIELD_SHELL_ERROR_CLASS)}>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    autoComplete="new-password"
                                    placeholder={resolveLanguageKey("form.confirmPasswordPlaceholder")}
                                    value={confirmPassword}
                                    disabled={loading}
                                    onChange={(e) => {
                                        clearFieldError("confirmPassword");
                                        setConfirmPassword(e.target.value);
                                    }}
                                    className={AUTH_FIELD_INPUT_CLASS}
                                />
                            </div>
                            <AuthFieldError message={fieldErrors.confirmPassword} />
                        </div>
                        <button type="submit" disabled={loading} className={AUTH_SUBMIT_CLASS}>
                            {loading ? resolveLanguageKey("submitting") : resolveLanguageKey("submit")}
                        </button>
                        {error && Object.keys(fieldErrors).length === 0 ? (
                            <AuthStatusMessage tone="error">{resolveLanguageKey("formError")}</AuthStatusMessage>
                        ) : null}
                    </form>
                ) : null}
            </PublicAuthPageShell>
        </PublicGuestOnly>
    );
}

export default compose(
    withLanguage(LANGUAGE_PATH),
    withAxios<ChangeForgottenPasswordFormResponseType, ChangeForgottenPasswordFormType>(
        {method: "post", url: "/api/user/forgotPassword/changePassword", data: {}},
        true,
    ),
    withDebug(true, true),
)(ResetPasswordPageInner);
