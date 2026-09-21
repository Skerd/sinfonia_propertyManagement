import {useAccess} from "@coreModule/helpers/hooks/useAccess.ts";
import type {Inspection} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/inspection/inspection.dto.ts";
import CancelInspection from "@propertyManagementModule/clients/panel/private/inspections/center/actions/cancel.tsx";
import UpdateChecklist from "@propertyManagementModule/clients/panel/private/inspections/center/actions/updateChecklist.tsx";
import {canUpdateInspectionChecklist} from "@propertyManagementModule/components/custom/inspections/inspectionChecklistVisibility.ts";

type InspectionRowMenuExtrasProps = {
    inspection: Inspection;
    onAction: (action: string) => void;
};

export default function InspectionRowMenuExtras({inspection, onAction}: InspectionRowMenuExtrasProps) {
    const {write} = useAccess("inspections");
    const isDeleted = inspection.deletedAt != null || inspection.deletedBy != null;
    const showUpdate = !!write && !isDeleted && canUpdateInspectionChecklist(inspection);
    const showCancel = !!write && !isDeleted && inspection.status === "scheduled";

    return (
        <>
            {showUpdate ? <UpdateChecklist onAction={onAction} /> : null}
            {showCancel ? <CancelInspection onAction={onAction} /> : null}
        </>
    );
}
