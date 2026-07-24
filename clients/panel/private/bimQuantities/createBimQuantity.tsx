import {IconPlus} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/createGenericCreatePage.tsx";
import {createBimQuantityFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/bimQuantity/createBimQuantity.form.validator.ts";
import type {CreateBimQuantityFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/bimQuantity/bimQuantity.schema-def.ts";

export default createGenericCreatePage<CreateBimQuantityFormType>({
    languagePath: "src/modules/propertyManagement/clients/panel/private/bimQuantities/createBimQuantity.tsx",
    model: "bimquantities",
    apiUrl: "/api/realEstate/bimQuantity",
    schema: createBimQuantityFormSchema,
    defaultValues: (params) => ({
        bimModel: params.get("bimModelId") ?? "",
    } as any),
    successPath: "/realEstate/bimQuantities",
    submitIcon: <IconPlus />,
});
