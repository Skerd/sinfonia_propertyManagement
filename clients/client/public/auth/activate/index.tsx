import {useEffect, useImperativeHandle, useState} from "react";
import {compose} from "redux";
import {Link, useParams} from "react-router-dom";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {ActivateAccountFormType} from "armonia/src/modules/core/api/user/public/activateAccount/activateAccount.form.type.ts";
import {ActivateAccountFormResponseType} from "armonia/src/modules/core/api/user/public/activateAccount/activateAccount.form.response.type.ts";
import {
    AUTH_LINK_CLASS,
    AuthStatusMessage,
    PublicAuthPageShell,
} from "@propertyManagementModule/clients/client/public/auth/shared/publicAuthChrome.tsx";

const LANGUAGE_PATH = "src/modules/propertyManagement/clients/client/public/auth/activate/index.tsx";

type ActivatePageProps = WithLanguageType &
    WithAxiosType<ActivateAccountFormResponseType, ActivateAccountFormType>;

function ActivatePageInner({
    resolveLanguageKey,
    onFilterChange,
    loading,
    innerRef,
}: ActivatePageProps) {
    const params = useParams();
    const [phase, setPhase] = useState<"loading" | "success" | "error">("loading");

    useEffect(() => {
        const code = params.code;
        if (!code) {
            setPhase("error");
            return;
        }
        setPhase("loading");
        onFilterChange({code});
    }, [params.code]);

    useImperativeHandle(innerRef, () => ({
        start: () => setPhase("loading"),
        success: () => setPhase("success"),
        error: () => setPhase("error"),
    }));

    return (
        <PublicAuthPageShell
            nodeId="auth:activate"
            nodeName="Activate account"
            title={resolveLanguageKey("title")}
            subtitle={
                phase === "loading"
                    ? resolveLanguageKey("loadingSubtitle")
                    : phase === "success"
                      ? resolveLanguageKey("successSubtitle")
                      : resolveLanguageKey("errorSubtitle")
            }
        >
            {phase === "loading" || loading ? (
                <AuthStatusMessage>{resolveLanguageKey("loadingMessage")}</AuthStatusMessage>
            ) : null}
            {phase === "success" ? (
                <div className="flex flex-col gap-6">
                    <AuthStatusMessage tone="success">{resolveLanguageKey("successMessage")}</AuthStatusMessage>
                    <Link to="/login" className={AUTH_LINK_CLASS}>
                        {resolveLanguageKey("goToLogin")}
                    </Link>
                </div>
            ) : null}
            {phase === "error" && !loading ? (
                <div className="flex flex-col gap-6">
                    <AuthStatusMessage tone="error">{resolveLanguageKey("errorMessage")}</AuthStatusMessage>
                    <Link to="/login" className={AUTH_LINK_CLASS}>
                        {resolveLanguageKey("goToLogin")}
                    </Link>
                </div>
            ) : null}
        </PublicAuthPageShell>
    );
}

export default compose(
    withLanguage(LANGUAGE_PATH),
    withAxios<ActivateAccountFormResponseType, ActivateAccountFormType>(
        {method: "put", url: "/api/user/activateAccount", data: {}},
        true,
    ),
    withDebug(true, true),
)(ActivatePageInner);
