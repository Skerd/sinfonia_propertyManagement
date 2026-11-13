import {useAccess} from "@coreModule/helpers/hooks/useAccess.ts";
import {useActionAccess} from "@coreModule/helpers/hooks/useActionAccess.ts";
import type {Inspection} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/inspection/inspection.dto.ts";
import CancelInspection from "@propertyManagementModule/clients/panel/private/inspections/center/actions/cancel.tsx";
import UpdateChecklist from "@propertyManagementModule/clients/panel/private/inspections/center/actions/updateChecklist.tsx";
import StartInspection from "@propertyManagementModule/clients/panel/private/inspections/center/actions/start.tsx";
import CompleteInspection from "@propertyManagementModule/clients/panel/private/inspections/center/actions/complete.tsx";
import RescheduleInspection from "@propertyManagementModule/clients/panel/private/inspections/center/actions/reschedule.tsx";
import {canUpdateInspectionChecklist} from "@propertyManagementModule/components/custom/inspections/inspectionChecklistVisibility.ts";

type InspectionRowMenuExtrasProps = {
    inspection: Inspection;
    onAction: (action: string) => void;
};

export default function InspectionRowMenuExtras({inspection, onAction}: InspectionRowMenuExtrasProps) {
    const {write} = useAccess("inspections");
    const canStart = useActionAccess("inspections", "start");
    const canComplete = useActionAccess("inspections", "complete");
    const canReschedule = useActionAccess("inspections", "reschedule");
    const isDeleted = inspection.deletedAt != null || inspection.deletedBy != null;
    const notStarted = inspection.status === "scheduled" || inspection.status === "rescheduled";
    const showUpdate = !!write && !isDeleted && canUpdateInspectionChecklist(inspection);
    const showCancel = !!write && !isDeleted && notStarted;
    const showStart = canStart && !isDeleted && notStarted;
    const showComplete = canComplete && !isDeleted && inspection.status === "in_progress";
    const showReschedule = canReschedule && !isDeleted && notStarted;

    return (
        <>
            {showStart ? <StartInspection onAction={onAction} /> : null}
            {showComplete ? <CompleteInspection onAction={onAction} /> : null}
            {showReschedule ? <RescheduleInspection onAction={onAction} /> : null}
            {showUpdate ? <UpdateChecklist onAction={onAction} /> : null}
            {showCancel ? <CancelInspection onAction={onAction} /> : null}
        </>
    );
}
