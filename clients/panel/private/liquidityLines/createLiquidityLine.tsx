import {IconPlus} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/createGenericCreatePage.tsx";
import {createLiquidityLineFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/liquidityLine/createLiquidityLine.form.validator.ts";
import type {CreateLiquidityLineFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/liquidityLine/liquidityLine.schema-def.ts";

export default createGenericCreatePage<CreateLiquidityLineFormType>({
    languagePath: "src/modules/propertyManagement/clients/panel/private/liquidityLines/createLiquidityLine.tsx",
    model: "liquiditylines",
    apiUrl: "/api/realEstate/liquidityLine",
    schema: createLiquidityLineFormSchema,
    defaultValues: (params) => ({
        plan: params.get("planId") ?? "",
        direction: "outflow",
    } as any),
    successPath: "/realEstate/liquidityLines",
    submitIcon: <IconPlus />,
});
