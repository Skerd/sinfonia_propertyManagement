import type { UnitCost } from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/unitCost/unitCost.dto.ts";

export function buildUnitCostEditPath(unitCost: UnitCost, unitId: string, unitName?: string): string {
    const params = new URLSearchParams();
    params.set("unitCostId", unitCost._id);
    params.set("unitCostName", unitCost.name);
    params.set("unitId", unitId || unitCost.unit?._id || "");
    const un = unitName ?? unitCost.unit?.name;
    if (un) params.set("unitName", un);
    return `/realEstate/unitCosts/edit?${params.toString()}`;
}
