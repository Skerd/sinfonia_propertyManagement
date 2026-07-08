import {buildUrlWithExistingParams} from "@coreModule/helpers/general";
import type {Unit} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/unit/unit.dto.ts";

export function buildUnitEditPath(unit: Unit): string {
    return buildUrlWithExistingParams(
        window.location.href,
        "/realEstate/units/edit",
        {
            unitId: unit._id ?? "",
            unitName: unit.name || unit.unitNumber || "",
        }
    );
}

export function unitDeleteConfirmLabel(read: Record<string, unknown> | undefined, unit: Unit): string | undefined {
    if (read?.name && unit.name) return unit.name;
    if (read?.unitNumber && unit.unitNumber != null && String(unit.unitNumber) !== "") return String(unit.unitNumber);
    return undefined;
}
