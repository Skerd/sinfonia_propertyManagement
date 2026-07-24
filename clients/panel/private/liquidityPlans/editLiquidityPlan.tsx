import {Save} from "lucide-react";
import {createGenericEditPage} from "@coreModule/components/entityPage/createGenericEditPage.tsx";
import {editLiquidityPlanFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/liquidityPlan/editLiquidityPlan.form.validator.ts";
import type {LiquidityPlan} from "armonia/src/modules/propertyManagement/api/realEstate/private/liquidityPlan/liquidityPlan.dto.ts";
import type {EditLiquidityPlanFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/liquidityPlan/liquidityPlan.schema-def.ts";

export default createGenericEditPage<LiquidityPlan, EditLiquidityPlanFormType>({
    languagePath: "src/modules/propertyManagement/clients/panel/private/liquidityPlans/editLiquidityPlan.tsx",
    model: "liquidityplans",
    apiUrl: "/api/realEstate/liquidityPlan",
    schema: editLiquidityPlanFormSchema,
    mapEntityData: (data) => ({
        ...data,
        project: (data as any).project?._id ?? (data as any).project,
        currency: (data as any).currency?._id ?? (data as any).currency,
    } as any),
    submitIcon: <Save />,
});
