import { compose } from "redux";
import {useEffect, useState} from "react";
import withLanguage, { WithLanguageType } from "@coreModule/helpers/hocs/withLanguage.tsx";
import { useAccess } from "@coreModule/helpers/hocs/withAccess.tsx";
import { useViewConfig } from "@coreModule/helpers/hooks/useViewConfig.ts";
import SheetViewRenderer from "@coreModule/components/viewEngine/SheetViewRenderer.tsx";
import ModificationRequestRowMenuExtras, {
    modificationRequestShouldHideEdit,
} from "@propertyManagementModule/clients/panel/private/modificationRequests/center/actions/modificationRequestRowMenuExtras.tsx";
import {
    ModificationRequest,
} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/modificationRequest/modificationRequest.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import ApproveModificationRequestDialog from "@propertyManagementModule/components/custom/modificationRequests/approveModificationRequestDialog.tsx";
import SubmitRevisionModificationRequestDialog from "@propertyManagementModule/components/custom/modificationRequests/submitRevisionModificationRequestDialog.tsx";
import FinanceModificationRequestDialog from "@propertyManagementModule/components/custom/modificationRequests/financeModificationRequestDialog.tsx";
import DeliverModificationRequestDialog from "@propertyManagementModule/components/custom/modificationRequests/deliverModificationRequestDialog.tsx";
import CancelModificationRequestDialog from "@propertyManagementModule/components/custom/modificationRequests/cancelModificationRequestDialog.tsx";
import ClientCostApproveModificationRequestDialog from "@propertyManagementModule/components/custom/modificationRequests/clientCostApproveModificationRequestDialog.tsx";

export type ModificationRequestSheetViewOwnProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    /** Full row from list/card, or bootstrap from DisplayCard while `/single` loads. */
    request?: ModificationRequest;
    unitId: string;
    unitName?: string;
    hideActions?: boolean;
    onDelete?: (response?: DeletedData) => void;
    onRestore?: () => void;
    onModified?: (updated?: ModificationRequest) => void;
    isRestored?: boolean;
    fetchId?: string;
};

function modificationRequestEditPath(req: ModificationRequest, unitId: string, unitName?: string) {
    const params = new URLSearchParams();
    params.set("modificationRequestId", req._id);
    params.set("unitId", unitId);
    if (unitName) params.set("unitName", unitName);
    return `/realEstate/modificationRequests/edit?${params.toString()}`;
}

function ModificationRequestSheetView({
    open,
    onOpenChange,
    request: requestProp,
    resolveLanguageKey,
    unitId,
    unitName,
    hideActions = false,
    onDelete = () => {},
    onRestore = () => {},
    onModified,
    isRestored: _isRestored = false,
    fetchId,
}: ModificationRequestSheetViewOwnProps & WithLanguageType) {

    const access = useAccess("modificationRequests");
    const { read, write } = access;
    const [action, setAction] = useState("");
    const viewConfig = useViewConfig("modificationrequests", "sheet");
    const [sheetData, setSheetData] = useState<Record<string, any>>(requestProp || {_id: fetchId});

    useEffect(() => {
        if (!open) setAction("");
    }, [open]);

    useEffect(() => {
        if (!requestProp) return;
        setSheetData(requestProp);
    }, [requestProp]);

    const entityId = requestProp?._id ?? fetchId;

    if (!viewConfig) {
        return null;
    }
    if (!entityId) return null;

    const deleteRestoreConfirmLabel = read?.name && sheetData?.name ? sheetData.name : undefined;

    return (
        <>
            <SheetViewRenderer
                config={viewConfig}
                url="/api/realEstate/unit/modificationRequest/single"
                fetchId={fetchId}
                onDataFetched={(data) => {
                    setSheetData(data);
                }}
                data={sheetData}
                open={open}
                onOpenChange={onOpenChange}
                resolveLanguageKey={resolveLanguageKey}
                access={access}
                hideActions={hideActions}
                onDelete={onDelete}
                onRestore={onRestore}
                editPath={modificationRequestEditPath(sheetData as ModificationRequest, unitId, unitName)}
                hideEdit={modificationRequestShouldHideEdit(sheetData as ModificationRequest, write)}
                actionMenuChildren={
                    <ModificationRequestRowMenuExtras request={sheetData as ModificationRequest} onModified={onModified} onAction={setAction} />
                }
                actionMenuAllowCustomChildren={true}
                referenceCardUnitContext={{ unitId, unitName: unitName ?? "" }}
                deleteRestoreConfirmLabel={deleteRestoreConfirmLabel}
            />
            {action === "approve" && (
                <ApproveModificationRequestDialog
                    open
                    onClose={() => setAction("")}
                    request={sheetData as ModificationRequest}
                    onSuccess={(updated?: ModificationRequest) => {
                        onModified?.(updated);
                        setAction("");
                    }}
                />
            )}
            {action === "submitRevision" && (
                <SubmitRevisionModificationRequestDialog
                    open
                    onClose={() => setAction("")}
                    request={sheetData as ModificationRequest}
                    onSuccess={(updated?: ModificationRequest) => {
                        onModified?.(updated);
                        setAction("");
                    }}
                />
            )}
            {action === "finance" && (
                <FinanceModificationRequestDialog
                    open
                    onClose={() => setAction("")}
                    request={sheetData as ModificationRequest}
                    onSuccess={(updated?: ModificationRequest) => {
                        onModified?.(updated);
                        setAction("");
                    }}
                />
            )}
            {action === "deliver" && (
                <DeliverModificationRequestDialog
                    open
                    onClose={() => setAction("")}
                    request={sheetData as ModificationRequest}
                    onSuccess={(updated?: ModificationRequest) => {
                        onModified?.(updated);
                        setAction("");
                    }}
                />
            )}
            {action === "cancel" && (
                <CancelModificationRequestDialog
                    open
                    onClose={() => setAction("")}
                    request={sheetData as ModificationRequest}
                    onSuccess={(updated?: ModificationRequest) => {
                        onModified?.(updated);
                        setAction("");
                    }}
                />
            )}
            {action === "clientCostApprove" && (
                <ClientCostApproveModificationRequestDialog
                    open
                    onClose={() => setAction("")}
                    request={sheetData as ModificationRequest}
                    onSuccess={(updated?: ModificationRequest) => {
                        onModified?.(updated);
                        setAction("");
                    }}
                />
            )}
        </>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/modificationRequests/center/sheetView/modificationRequestSheetView.tsx"),
)(ModificationRequestSheetView);
