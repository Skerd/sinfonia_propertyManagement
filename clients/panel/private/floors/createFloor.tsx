import {IconStackPush} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/createGenericCreatePage.tsx";
import {createFloorFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/floor/createFloor.form.validator.ts";
import type {CreateFloorFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/floor/floor.schema-def.ts";

export default createGenericCreatePage<CreateFloorFormType>({
    languagePath: "src/modules/propertyManagement/clients/panel/private/floors/createFloor.tsx",
    model: "floors",
    apiUrl: "/api/realEstate/floor",
    schema: createFloorFormSchema,
    defaultValues: (params) => ({
        project: params.get("projectId") || undefined,
        edifice: params.get("edificeId") || "",
    }) as unknown as CreateFloorFormType,
    buildFormExtras: (params) => ({
        hasRouteProjectId: !!params.get("projectId"),
        hasRouteEdificeId: !!params.get("edificeId"),
        enableLocalFileMultipart: true,
    }),
    buildExtraTitles: (params) => [params.get("projectName"), params.get("edificeName")].filter((x): x is string => !!x),
    submitIcon: <IconStackPush />,
});
