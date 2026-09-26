import {useImperativeHandle, useState} from "react";
import {compose} from "redux";
import {Link} from "react-router-dom";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {SignUpFormType} from "armonia/src/modules/core/api/user/public/signUp/signup.form.type.ts";
import {signupFormSchema} from "armonia/src/modules/core/api/user/public/signUp/signup.form.validator.ts";
import {SignupFormResponseType} from "armonia/src/modules/core/api/user/public/signUp/signup.form.response.type.ts";
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

const LANGUAGE_PATH = "src/modules/propertyManagement/clients/client/public/auth/signup/index.tsx";

type FieldKey = "name" | "surname" | "email" | "password" | "confirmPassword";
type FieldErrors = Partial<Record<FieldKey, string>>;

type SignUpPageProps = WithLanguageType & WithAxiosType<SignupFormResponseType, SignUpFormType>;

function SignUpPageInner({
    resolveLanguageKey,
    languageCode,
    onFilterChange,
    loading,
    innerRef,
    error,
}: SignUpPageProps) {
    const [name, setName] = useState("");
    const [surname, setSurname] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
    const [submitted, setSubmitted] = useState(false);

    useImperativeHandle(innerRef, () => ({
        success: () => {
            setSubmitted(true);
        },
        error: () => {
            setSubmitted(false);
        },
    }));

    const clearFieldError = (key: FieldKey) => {
        setFieldErrors((prev) => {
            if (!prev[key]) return prev;
            const next = {...prev};
            delete next[key];
            return next;
        });
    };

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        if (loading) return;
        setSubmitted(false);

        const body: SignUpFormType = {
            name: name.trim(),
            surname: surname.trim(),
            email: email.trim(),
            password,
            confirmPassword,
        };

        const parsed = signupFormSchema(languageCode, {
            nameLabel: resolveLanguageKey("form.nameLabel"),
            surnameLabel: resolveLanguageKey("form.surnameLabel"),
            emailLabel: resolveLanguageKey("form.emailLabel"),
            passwordLabel: resolveLanguageKey("form.passwordLabel"),
            confirmPasswordLabel: resolveLanguageKey("form.confirmPasswordLabel"),
        }).safeParse(body);

        if (!parsed.success) {
            const nextErrors: FieldErrors = {};
            for (const issue of parsed.error.issues) {
                const key = issue.path[0];
                if (
                    key === "name" ||
                    key === "surname" ||
                    key === "email" ||
                    key === "password" ||
                    key === "confirmPassword"
                ) {
                    nextErrors[key] = issue.message;
                }
            }
            setFieldErrors(nextErrors);
            return;
        }

        setFieldErrors({});
        onFilterChange(parsed.data);
    };

    return (
        <PublicGuestOnly>
            <PublicAuthPageShell
                nodeId="auth:signup"
                nodeName="Sign up"
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
                        <div className="grid w-full min-w-0 grid-cols-2 gap-4 sm:gap-8">
                            <div className="min-w-0">
                                <div className={cn(AUTH_FIELD_SHELL_CLASS, fieldErrors.name && AUTH_FIELD_SHELL_ERROR_CLASS)}>
                                    <input
                                        type="text"
                                        name="name"
                                        autoComplete="given-name"
                                        placeholder={resolveLanguageKey("form.namePlaceholder")}
                                        value={name}
                                        disabled={loading}
                                        onChange={(e) => {
                                            clearFieldError("name");
                                            setName(e.target.value);
                                        }}
                                        className={AUTH_FIELD_INPUT_CLASS}
                                    />
                                </div>
                                <AuthFieldError message={fieldErrors.name} />
                            </div>
                            <div className="min-w-0">
                                <div className={cn(AUTH_FIELD_SHELL_CLASS, fieldErrors.surname && AUTH_FIELD_SHELL_ERROR_CLASS)}>
                                    <input
                                        type="text"
                                        name="surname"
                                        autoComplete="family-name"
                                        placeholder={resolveLanguageKey("form.surnamePlaceholder")}
                                        value={surname}
                                        disabled={loading}
                                        onChange={(e) => {
                                            clearFieldError("surname");
                                            setSurname(e.target.value);
                                        }}
                                        className={AUTH_FIELD_INPUT_CLASS}
                                    />
                                </div>
                                <AuthFieldError message={fieldErrors.surname} />
                            </div>
                        </div>
                        <div className="w-full min-w-0">
                            <div className={cn(AUTH_FIELD_SHELL_CLASS, fieldErrors.email && AUTH_FIELD_SHELL_ERROR_CLASS)}>
                                <input
                                    type="email"
                                    name="email"
                                    autoComplete="email"
                                    placeholder={resolveLanguageKey("form.emailPlaceholder")}
                                    value={email}
                                    disabled={loading}
                                    onChange={(e) => {
                                        clearFieldError("email");
                                        setEmail(e.target.value);
                                    }}
                                    className={AUTH_FIELD_INPUT_CLASS}
                                />
                            </div>
                            <AuthFieldError message={fieldErrors.email} />
                        </div>
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

                        <p className="font-aeonik-light text-base text-pronix-ink-muted md:text-lg">
                            {resolveLanguageKey("haveAccount")}{" "}
                            <Link to="/login" className={AUTH_LINK_CLASS}>
                                {resolveLanguageKey("loginLink")}
                            </Link>
                        </p>
                    </form>
                )}
            </PublicAuthPageShell>
        </PublicGuestOnly>
    );
}

export default compose(
    withLanguage(LANGUAGE_PATH),
    withAxios<SignupFormResponseType, SignUpFormType>(
        {method: "post", url: "/api/user/signUp", data: {}},
        true,
    ),
    withDebug(true, true),
)(SignUpPageInner);
