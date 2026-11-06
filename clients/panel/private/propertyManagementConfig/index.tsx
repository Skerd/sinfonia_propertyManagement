import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import useHttpRequest, {type HttpRequest} from "@coreModule/helpers/hooks/useHttpRequest.ts";
import Loader from "@coreModule/components/custom/loader/loader.tsx";
import SimpleError from "@coreModule/components/custom/errors/errorViewWrapper.tsx";
import type {PropertyManagementConfig} from "armonia/src/modules/propertyManagement/api/realEstate/private/propertyManagementConfig/propertyManagementConfig.dto.ts";
import EditPropertyManagementConfig from "@propertyManagementModule/clients/panel/private/propertyManagementConfig/editPropertyManagementConfig.tsx";

const ENSURE_REQUEST: HttpRequest = {method: "post", url: "/api/realEstate/propertyManagementConfig/ensure"};

/**
 * Singleton settings entry: ensure the company config exists, then open the edit form inline.
 */
function PropertyManagementConfigGate({resolveLanguageKey}: WithLanguageType) {
    const request = useHttpRequest<PropertyManagementConfig>(ENSURE_REQUEST, {}, 1);
    const configId = request.data?._id ?? null;
    const error = request.error
        ? request.error.message || request.error.error || String(resolveLanguageKey("errors.missingConfigId"))
        : request.data && !configId ? String(resolveLanguageKey("errors.missingConfigId") || "Missing config id") : null;

    if (error) return <SimpleError title={error} />;
    if (!configId) return <Loader />;
    return <EditPropertyManagementConfig entityId={configId} />;
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/propertyManagementConfig/index.tsx"),
    withDebug(true, true, "projects"),
)(PropertyManagementConfigGate);
