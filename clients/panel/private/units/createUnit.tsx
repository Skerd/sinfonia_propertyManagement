import {IconFrustumPlus} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/createGenericCreatePage.tsx";
import {createUnitFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/unit/createUnit.form.validator.ts";
import type {CreateUnitFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/unit/unit.schema-def.ts";

export default createGenericCreatePage<CreateUnitFormType>({
    languagePath: "src/modules/propertyManagement/clients/panel/private/units/createUnit.tsx",
    model: "units",
    apiUrl: "/api/realEstate/unit",
    schema: createUnitFormSchema,
    defaultValues: (params) => ({
        project: params.get("projectId") || undefined,
        edifice: params.get("edificeId") || undefined,
        floor: params.get("floorId") || "",
    }),
    buildFormExtras: (params) => ({
        hideUnitReferencesSection: !!(params.get("projectId") && params.get("edificeId") && params.get("floorId")),
        hasRouteProjectId: !!params.get("projectId"),
        hasRouteEdificeId: !!params.get("edificeId"),
        hasRouteFloorId: !!params.get("floorId"),
    }),
    buildExtraTitles: (params) => [params.get("projectName"), params.get("edificeName"), params.get("floorName")].filter((x): x is string => !!x,),
    submitIcon: <IconFrustumPlus />,
});
