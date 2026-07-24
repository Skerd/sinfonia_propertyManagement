import {IconPlus} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/createGenericCreatePage.tsx";
import {createBimModelFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/bimModel/createBimModel.form.validator.ts";
import type {CreateBimModelFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/bimModel/bimModel.schema-def.ts";

export default createGenericCreatePage<CreateBimModelFormType>({
    languagePath: "src/modules/propertyManagement/clients/panel/private/bimModels/createBimModel.tsx",
    model: "bimmodels",
    apiUrl: "/api/realEstate/bimModel",
    schema: createBimModelFormSchema,
    defaultValues: (params) => ({
        project: params.get("projectId") ?? "",
        title: "",
    } as any),
    successPath: "/realEstate/bimModels",
    submitIcon: <IconPlus />,
});
