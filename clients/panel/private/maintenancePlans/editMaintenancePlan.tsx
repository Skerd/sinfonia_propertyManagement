import {Save} from "lucide-react";
import {createGenericEditPage} from "@coreModule/components/entityPage/createGenericEditPage.tsx";
import {editMaintenancePlanFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/maintenancePlan/editMaintenancePlan.form.validator.ts";
import type {MaintenancePlan} from "armonia/src/modules/propertyManagement/api/realEstate/private/maintenancePlan/maintenancePlan.dto.ts";
import type {EditMaintenancePlanFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/maintenancePlan/maintenancePlan.schema-def.ts";

export default createGenericEditPage<MaintenancePlan, EditMaintenancePlanFormType>({
    languagePath: "src/modules/propertyManagement/clients/panel/private/maintenancePlans/editMaintenancePlan.tsx",
    model: "maintenanceplans",
    apiUrl: "/api/realEstate/maintenancePlan",
    schema: editMaintenancePlanFormSchema,
    mapEntityData: (data) => ({
        ...data,
        asset: (data as any).asset?._id ?? (data as any).asset,
        edifice: (data as any).edifice?._id ?? (data as any).edifice,
    } as any),
    submitIcon: <Save />,
});
