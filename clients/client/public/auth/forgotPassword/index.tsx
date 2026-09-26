import {useImperativeHandle, useState} from "react";
import {compose} from "redux";
import {Link} from "react-router-dom";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {ForgotPasswordFormType} from "armonia/src/modules/core/api/user/public/forgotPassword/forgotPassword.form.type.ts";
import {forgotPasswordFormSchema} from "armonia/src/modules/core/api/user/public/forgotPassword/forgotPassword.form.validator.ts";
import {ForgotPasswordFormResponseType} from "armonia/src/modules/core/api/user/public/forgotPassword/forgotPassword.form.response.type.ts";
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

const LANGUAGE_PATH = "src/modules/propertyManagement/clients/client/public/auth/forgotPassword/index.tsx";

type ForgotPasswordPageProps = WithLanguageType &
    WithAxiosType<ForgotPasswordFormResponseType, ForgotPasswordFormType>;

function ForgotPasswordPageInner({
    resolveLanguageKey,
    languageCode,
    onFilterChange,
    loading,
    innerRef,
    error,
}: ForgotPasswordPageProps) {
    const [email, setEmail] = useState("");
    const [fieldError, setFieldError] = useState<string | undefined>();
    const [submitted, setSubmitted] = useState(false);

    useImperativeHandle(innerRef, () => ({
        success: () => setSubmitted(true),
        error: () => setSubmitted(false),
    }));

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        if (loading) return;
        setSubmitted(false);

        const body: ForgotPasswordFormType = {email: email.trim()};
        const parsed = forgotPasswordFormSchema(languageCode, {
            emailLabel: resolveLanguageKey("form.emailLabel"),
        }).safeParse(body);

        if (!parsed.success) {
            setFieldError(parsed.error.issues[0]?.message);
            return;
        }

        setFieldError(undefined);
        onFilterChange(parsed.data);
    };

    return (
        <PublicGuestOnly>
            <PublicAuthPageShell
                nodeId="auth:forgot"
                nodeName="Forgot password"
                title={resolveLanguageKey("title")}
                subtitle={resolveLanguageKey("subtitle")}
            >
                {submitted ? (
                    <div className="flex flex-col gap-6">
                        <AuthStatusMessage tone="success">{resolveLanguageKey("successMessage")}</AuthStatusMessage>
                        <Link to="/login" className={AUTH_LINK_CLASS}>
                            {resolveLanguageKey("goToLogin")}
                        </Link>
                    </div>
                ) : (
                    <form className="flex flex-col gap-6 md:gap-8" onSubmit={handleSubmit} noValidate>
                        <div className="w-full min-w-0">
                            <div className={cn(AUTH_FIELD_SHELL_CLASS, fieldError && AUTH_FIELD_SHELL_ERROR_CLASS)}>
                                <input
                                    type="email"
                                    name="email"
                                    autoComplete="email"
                                    placeholder={resolveLanguageKey("form.emailPlaceholder")}
                                    value={email}
                                    disabled={loading}
                                    onChange={(e) => {
                                        setFieldError(undefined);
                                        setEmail(e.target.value);
                                    }}
                                    className={AUTH_FIELD_INPUT_CLASS}
                                />
                            </div>
                            <AuthFieldError message={fieldError} />
                        </div>
                        <button type="submit" disabled={loading} className={AUTH_SUBMIT_CLASS}>
                            {loading ? resolveLanguageKey("submitting") : resolveLanguageKey("submit")}
                        </button>
                        {error && !fieldError ? (
                            <AuthStatusMessage tone="error">{resolveLanguageKey("formError")}</AuthStatusMessage>
                        ) : null}
                        <Link to="/login" className={AUTH_LINK_CLASS}>
                            {resolveLanguageKey("goToLogin")}
                        </Link>
                    </form>
                )}
            </PublicAuthPageShell>
        </PublicGuestOnly>
    );
}

export default compose(
    withLanguage(LANGUAGE_PATH),
    withAxios<ForgotPasswordFormResponseType, ForgotPasswordFormType>(
        {method: "post", url: "/api/user/forgotPassword", data: {}},
        true,
    ),
    withDebug(true, true),
)(ForgotPasswordPageInner);
