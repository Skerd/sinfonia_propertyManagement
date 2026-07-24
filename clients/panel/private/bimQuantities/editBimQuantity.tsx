import {Save} from "lucide-react";
import {createGenericEditPage} from "@coreModule/components/entityPage/createGenericEditPage.tsx";
import {editBimQuantityFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/bimQuantity/editBimQuantity.form.validator.ts";
import type {BimQuantity} from "armonia/src/modules/propertyManagement/api/realEstate/private/bimQuantity/bimQuantity.dto.ts";
import type {EditBimQuantityFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/bimQuantity/bimQuantity.schema-def.ts";

export default createGenericEditPage<BimQuantity, EditBimQuantityFormType>({
    languagePath: "src/modules/propertyManagement/clients/panel/private/bimQuantities/editBimQuantity.tsx",
    model: "bimquantities",
    apiUrl: "/api/realEstate/bimQuantity",
    schema: editBimQuantityFormSchema,
    mapEntityData: (data) => ({
        ...data,
        bimModel: (data as any).bimModel?._id ?? (data as any).bimModel,
    } as any),
    submitIcon: <Save />,
});
