import {Save} from "lucide-react";
import {createGenericEditPage} from "@coreModule/components/entityPage/createGenericEditPage.tsx";
import {editBimModelFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/bimModel/editBimModel.form.validator.ts";
import type {BimModel} from "armonia/src/modules/propertyManagement/api/realEstate/private/bimModel/bimModel.dto.ts";
import type {EditBimModelFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/bimModel/bimModel.schema-def.ts";

export default createGenericEditPage<BimModel, EditBimModelFormType>({
    languagePath: "src/modules/propertyManagement/clients/panel/private/bimModels/editBimModel.tsx",
    model: "bimmodels",
    apiUrl: "/api/realEstate/bimModel",
    schema: editBimModelFormSchema,
    mapEntityData: (data) => ({
        ...data,
        project: (data as any).project?._id ?? (data as any).project,
        edifice: (data as any).edifice?._id ?? (data as any).edifice,
    } as any),
    submitIcon: <Save />,
});
