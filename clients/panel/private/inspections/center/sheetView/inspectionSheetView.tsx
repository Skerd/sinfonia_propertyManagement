import { compose } from "redux";
import { useEffect, useState } from "react";
import withLanguage, { WithLanguageType } from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import CancelInspection from "@propertyManagementModule/clients/panel/private/inspections/center/actions/cancel.tsx";
import CancelInspectionDialog from "@propertyManagementModule/components/custom/inspections/cancelInspectionDialog.tsx";
import { useAccess } from "@coreModule/helpers/hocs/withAccess.tsx";
import { useViewConfig } from "@coreModule/helpers/hooks/useViewConfig.ts";
import SheetViewRenderer from "@coreModule/components/viewEngine/SheetViewRenderer.tsx";
import { Inspection } from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/inspection/inspection.dto.ts";
import type { DeleteResponse } from "armonia/src/modules/core/types/shared.types.ts";
import {buildInspectionEditPath} from "@propertyManagementModule/clients/panel/private/inspections";

export type InspectionSheetViewOwnProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    /** Full row from list/card, or bootstrap from DisplayCard while `/single` loads. */
    inspection?: Inspection;
    unitId?: string;
    unitName?: string;
    hideActions?: boolean;
    onDelete?: (response?: DeleteResponse) => void;
    onRestore?: () => void;
    onCancelSuccess?: (updatedInspection?: Inspection) => void;
    isRestored?: boolean;
    fetchId?: string;
};

function InspectionSheetView({
    open,
    onOpenChange,
    inspection: inspectionProp,
    resolveLanguageKey,
    unitId: unitIdProp,
    unitName: unitNameProp,
    hideActions = false,
    onDelete,
    onRestore,
    onCancelSuccess,
    fetchId,
}: InspectionSheetViewOwnProps & WithLanguageType) {

    const access = useAccess("inspections");
    const viewConfig = useViewConfig("inspections", "sheet");
    const read = access.read && typeof access.read === "object" ? access.read : {};
    const [sheetData, setSheetData] = useState<Record<string, any>>(inspectionProp || {_id: fetchId});
    const [action, setAction] = useState("");

    useEffect(() => {
        if (!inspectionProp) return;
        setSheetData(inspectionProp);
    }, [inspectionProp]);

    const entityId = inspectionProp?._id ?? fetchId;
    const asInspection = sheetData as Inspection;
    const resolvedUnitId = unitIdProp ?? asInspection.unit?._id ?? "";
    const resolvedUnitName =
        unitNameProp ??
        asInspection.unit?.name ??
        (asInspection.unit?.unitNumber != null ? String(asInspection.unit.unitNumber) : "");

    const deleteRestoreConfirmLabel = read.name && asInspection.name ? asInspection.name : undefined;

    const editPath = resolvedUnitId && entityId ? buildInspectionEditPath(asInspection) : "";

    if (!viewConfig) return null;
    if (!entityId) return null;

    const status = (asInspection as { status?: string }).status;

    return (
        <>
        <SheetViewRenderer
            config={viewConfig}
            url="/api/realEstate/unit/inspection/single"
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
            editPath={editPath}
            deleteRestoreConfirmLabel={deleteRestoreConfirmLabel}
            actionMenuAllowCustomChildren={status === "scheduled"}
            referenceCardUnitContext={{ unitId: resolvedUnitId, unitName: resolvedUnitName }}
            actionMenuChildren={
                status === "scheduled" ? (
                    <CancelInspection onAction={(a: string) => setAction(a)} />
                ) : null
            }
        />
        {action === "cancelInspection" && (
            <CancelInspectionDialog
                open={action === "cancelInspection"}
                onClose={() => setAction("")}
                inspection={asInspection}
                onSuccess={(data?: Inspection) => {
                    if (data) setSheetData(data);
                    onCancelSuccess?.(data);
                    setAction("");
                }}
            />
        )}
        </>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/inspections/center/sheetView/inspectionSheetView.tsx"),
    withDebug(true, true, "inspections"),
)(InspectionSheetView);
