import type {Inspection} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/inspection/inspection.dto.ts";

export function canUpdateInspectionChecklist(inspection: Inspection): boolean {
    if (inspection.deletedAt != null || inspection.deletedBy != null) return false;
    const status = inspection.status;
    if (status === "completed" || status === "cancelled") return false;
    const items = inspection.checklistItems ?? [];
    return !!inspection.checklistTemplate || items.length > 0;
}
