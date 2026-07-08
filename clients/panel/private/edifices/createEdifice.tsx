import {IconBuildingPlus} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/createGenericCreatePage.tsx";
import {createEdificeFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/edifice/createEdifice.form.validator.ts";
import type {CreateEdificeFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/edifice/edifice.schema-def.ts";

export default createGenericCreatePage<CreateEdificeFormType>({
    languagePath: "src/modules/propertyManagement/clients/panel/private/edifices/createEdifice.tsx",
    model: "edifices",
    apiUrl: "/api/realEstate/edifice",
    schema: createEdificeFormSchema,
    defaultValues: (params) => ({
        project: params.get("projectId") || ""
    }),
    buildExtraTitles: (params) => [params.get("projectName") || ""].filter(Boolean),
    submitIcon: <IconBuildingPlus />,
});
