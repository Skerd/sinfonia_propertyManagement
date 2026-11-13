import type {Inspection} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/inspection/inspection.dto.ts";
import StartInspectionDialog from "@propertyManagementModule/components/custom/inspections/startInspectionDialog.tsx";
import CompleteInspectionDialog from "@propertyManagementModule/components/custom/inspections/completeInspectionDialog.tsx";
import RescheduleInspectionDialog from "@propertyManagementModule/components/custom/inspections/rescheduleInspectionDialog.tsx";
import {START_INSPECTION_ACTION} from "@propertyManagementModule/clients/panel/private/inspections/center/actions/start.tsx";
import {COMPLETE_INSPECTION_ACTION} from "@propertyManagementModule/clients/panel/private/inspections/center/actions/complete.tsx";
import {RESCHEDULE_INSPECTION_ACTION} from "@propertyManagementModule/clients/panel/private/inspections/center/actions/reschedule.tsx";

type InspectionLifecycleDialogsProps = {
    action: string;
    inspection?: Inspection | null;
    onClose: () => void;
    onSuccess: (updated?: Inspection) => void;
};

/** The start, complete and reschedule dialogs, shared by the list, the card and the sheet. */
export default function InspectionLifecycleDialogs({action, inspection, onClose, onSuccess}: InspectionLifecycleDialogsProps) {
    if (!inspection) return null;
    if (action === START_INSPECTION_ACTION) {
        return <StartInspectionDialog open onClose={onClose} inspection={inspection} onSuccess={onSuccess} />;
    }
    if (action === COMPLETE_INSPECTION_ACTION) {
        return <CompleteInspectionDialog open onClose={onClose} inspection={inspection} onSuccess={onSuccess} />;
    }
    if (action === RESCHEDULE_INSPECTION_ACTION) {
        return <RescheduleInspectionDialog open onClose={onClose} inspection={inspection} onSuccess={onSuccess} />;
    }
    return null;
}
