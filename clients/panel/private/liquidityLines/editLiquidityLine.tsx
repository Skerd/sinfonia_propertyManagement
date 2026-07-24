import {Save} from "lucide-react";
import {createGenericEditPage} from "@coreModule/components/entityPage/createGenericEditPage.tsx";
import {editLiquidityLineFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/liquidityLine/editLiquidityLine.form.validator.ts";
import type {LiquidityLine} from "armonia/src/modules/propertyManagement/api/realEstate/private/liquidityLine/liquidityLine.dto.ts";
import type {EditLiquidityLineFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/liquidityLine/liquidityLine.schema-def.ts";

export default createGenericEditPage<LiquidityLine, EditLiquidityLineFormType>({
    languagePath: "src/modules/propertyManagement/clients/panel/private/liquidityLines/editLiquidityLine.tsx",
    model: "liquiditylines",
    apiUrl: "/api/realEstate/liquidityLine",
    schema: editLiquidityLineFormSchema,
    mapEntityData: (data) => ({
        ...data,
        plan: (data as any).plan?._id ?? (data as any).plan,
        currency: (data as any).currency?._id ?? (data as any).currency,
    } as any),
    submitIcon: <Save />,
});
