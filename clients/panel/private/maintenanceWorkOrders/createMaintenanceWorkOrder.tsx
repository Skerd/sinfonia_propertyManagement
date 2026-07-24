import {IconPlus} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/createGenericCreatePage.tsx";
import {createMaintenanceWorkOrderFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/maintenanceWorkOrder/createMaintenanceWorkOrder.form.validator.ts";
import type {CreateMaintenanceWorkOrderFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/maintenanceWorkOrder/maintenanceWorkOrder.schema-def.ts";

export default createGenericCreatePage<CreateMaintenanceWorkOrderFormType>({
    languagePath: "src/modules/propertyManagement/clients/panel/private/maintenanceWorkOrders/createMaintenanceWorkOrder.tsx",
    model: "maintenanceworkorders",
    apiUrl: "/api/realEstate/maintenanceWorkOrder",
    schema: createMaintenanceWorkOrderFormSchema,
    defaultValues: (params) => ({
        plan: params.get("planId") ?? "",
        title: "",
        type: "preventive",
    } as any),
    successPath: "/realEstate/maintenanceWorkOrders",
    submitIcon: <IconPlus />,
});
