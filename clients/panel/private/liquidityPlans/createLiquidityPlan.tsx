import {IconPlus} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/createGenericCreatePage.tsx";
import {createLiquidityPlanFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/liquidityPlan/createLiquidityPlan.form.validator.ts";
import type {CreateLiquidityPlanFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/liquidityPlan/liquidityPlan.schema-def.ts";

export default createGenericCreatePage<CreateLiquidityPlanFormType>({
    languagePath: "src/modules/propertyManagement/clients/panel/private/liquidityPlans/createLiquidityPlan.tsx",
    model: "liquidityplans",
    apiUrl: "/api/realEstate/liquidityPlan",
    schema: createLiquidityPlanFormSchema,
    defaultValues: (params) => ({
        project: params.get("projectId") ?? "",
        title: "",
        granularity: "monthly",
    } as any),
    successPath: "/realEstate/liquidityPlans",
    submitIcon: <IconPlus />,
});
