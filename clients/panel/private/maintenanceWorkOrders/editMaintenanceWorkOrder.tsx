import {Save} from "lucide-react";
import {createGenericEditPage} from "@coreModule/components/entityPage/createGenericEditPage.tsx";
import {editMaintenanceWorkOrderFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/maintenanceWorkOrder/editMaintenanceWorkOrder.form.validator.ts";
import type {MaintenanceWorkOrder} from "armonia/src/modules/propertyManagement/api/realEstate/private/maintenanceWorkOrder/maintenanceWorkOrder.dto.ts";
import type {EditMaintenanceWorkOrderFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/maintenanceWorkOrder/maintenanceWorkOrder.schema-def.ts";

export default createGenericEditPage<MaintenanceWorkOrder, EditMaintenanceWorkOrderFormType>({
    languagePath: "src/modules/propertyManagement/clients/panel/private/maintenanceWorkOrders/editMaintenanceWorkOrder.tsx",
    model: "maintenanceworkorders",
    apiUrl: "/api/realEstate/maintenanceWorkOrder",
    schema: editMaintenanceWorkOrderFormSchema,
    mapEntityData: (data) => ({
        ...data,
        plan: (data as any).plan?._id ?? (data as any).plan,
        asset: (data as any).asset?._id ?? (data as any).asset,
        edifice: (data as any).edifice?._id ?? (data as any).edifice,
        assignee: (data as any).assignee?._id ?? (data as any).assignee,
        currency: (data as any).currency?._id ?? (data as any).currency,
    } as any),
    submitIcon: <Save />,
});
