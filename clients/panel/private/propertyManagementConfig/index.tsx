import {compose} from "redux";
import {useEffect, useState} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import apiClient from "@coreModule/helpers/axiosClients/apiClient.ts";
import Loader from "@coreModule/components/custom/loader.tsx";
import SimpleError from "@coreModule/components/custom/errorViewWrapper.tsx";
import type {PropertyManagementConfig} from "armonia/src/modules/propertyManagement/api/realEstate/private/propertyManagementConfig/propertyManagementConfig.dto.ts";
import EditPropertyManagementConfig from "@propertyManagementModule/clients/panel/private/propertyManagementConfig/editPropertyManagementConfig.tsx";

/**
 * Singleton settings entry: ensure the company config exists, then open the edit form inline.
 */
function PropertyManagementConfigGate({resolveLanguageKey}: WithLanguageType) {
    const [configId, setConfigId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const res = await apiClient.post<PropertyManagementConfig>(
                    "/api/realEstate/propertyManagementConfig/ensure",
                    {},
                );
                if (cancelled) return;
                const id = res.data?._id;
                if (!id) {
                    setError(String(resolveLanguageKey("errors.missingConfigId") || "Missing config id"));
                    return;
                }
                setConfigId(id);
            } catch (e: unknown) {
                if (cancelled) return;
                setError(e instanceof Error ? e.message : String(e));
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [resolveLanguageKey]);

    if (error) return <SimpleError title={error} />;
    if (!configId) return <Loader />;
    return <EditPropertyManagementConfig entityId={configId} />;
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/propertyManagementConfig/index.tsx"),
    withDebug(true, true),
)(PropertyManagementConfigGate);
