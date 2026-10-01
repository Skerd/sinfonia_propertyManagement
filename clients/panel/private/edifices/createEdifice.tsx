import {IconBuildingPlus} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/pages/createGenericCreatePage.tsx";
import {createEdificeFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/edifice/createEdifice.form.validator.ts";
import type {CreateEdificeFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/edifice/edifice.schema-def.ts";
import {quickOrScopeLabel, quickOrScopeParam} from "@coreModule/helpers/filter/filterUrl.ts";

export default createGenericCreatePage<CreateEdificeFormType>({
    languagePath: "src/modules/propertyManagement/clients/panel/private/edifices/createEdifice.tsx",
    model: "edifices",
    apiUrl: "/api/realEstate/edifice",
    schema: createEdificeFormSchema,
    defaultValues: (params) => ({
        project: quickOrScopeParam(params, "project", "projectId"),
    }),
    buildExtraTitles: (params) => [quickOrScopeLabel(params, "project", "projectName")].filter(Boolean),
    submitIcon: <IconBuildingPlus />,
});
