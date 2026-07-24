import {IconPlus} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/createGenericCreatePage.tsx";
import {createMaintenancePlanFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/maintenancePlan/createMaintenancePlan.form.validator.ts";
import type {CreateMaintenancePlanFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/maintenancePlan/maintenancePlan.schema-def.ts";

export default createGenericCreatePage<CreateMaintenancePlanFormType>({
    languagePath: "src/modules/propertyManagement/clients/panel/private/maintenancePlans/createMaintenancePlan.tsx",
    model: "maintenanceplans",
    apiUrl: "/api/realEstate/maintenancePlan",
    schema: createMaintenancePlanFormSchema,
    defaultValues: (params) => ({
        asset: params.get("assetId") ?? "",
        title: "",
        planType: "preventive",
    } as any),
    successPath: "/realEstate/maintenancePlans",
    submitIcon: <IconPlus />,
});
