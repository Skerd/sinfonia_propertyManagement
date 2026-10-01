import {IconStackPush} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/pages/createGenericCreatePage.tsx";
import {createFloorFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/floor/createFloor.form.validator.ts";
import type {CreateFloorFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/floor/floor.schema-def.ts";
import {quickOrScopeLabel, quickOrScopeParam} from "@coreModule/helpers/filter/filterUrl.ts";

export default createGenericCreatePage<CreateFloorFormType>({
    languagePath: "src/modules/propertyManagement/clients/panel/private/floors/createFloor.tsx",
    model: "floors",
    apiUrl: "/api/realEstate/floor",
    schema: createFloorFormSchema,
    defaultValues: (params) => ({
        project: quickOrScopeParam(params, "project", "projectId") || undefined,
        edifice: quickOrScopeParam(params, "edifice", "edificeId"),
    }) as unknown as CreateFloorFormType,
    buildFormExtras: (params) => ({
        hasRouteProjectId: !!quickOrScopeParam(params, "project", "projectId"),
        hasRouteEdificeId: !!quickOrScopeParam(params, "edifice", "edificeId"),
        enableLocalFileMultipart: true,
    }),
    buildExtraTitles: (params) => [
        quickOrScopeLabel(params, "project", "projectName"),
        quickOrScopeLabel(params, "edifice", "edificeName"),
    ].filter((x): x is string => !!x),
    submitIcon: <IconStackPush />,
});
