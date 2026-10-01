import {IconFrustumPlus} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/pages/createGenericCreatePage.tsx";
import {createUnitFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/unit/createUnit.form.validator.ts";
import type {CreateUnitFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/unit/unit.schema-def.ts";
import {quickOrScopeLabel, quickOrScopeParam} from "@coreModule/helpers/filter/filterUrl.ts";

export default createGenericCreatePage<CreateUnitFormType>({
    languagePath: "src/modules/propertyManagement/clients/panel/private/units/createUnit.tsx",
    model: "units",
    apiUrl: "/api/realEstate/unit",
    schema: createUnitFormSchema,
    defaultValues: (params) => ({
        project: quickOrScopeParam(params, "project", "projectId") || undefined,
        edifice: quickOrScopeParam(params, "edifice", "edificeId") || undefined,
        floor: quickOrScopeParam(params, "floor", "floorId"),
    }),
    buildFormExtras: (params) => {
        const projectId = quickOrScopeParam(params, "project", "projectId");
        const edificeId = quickOrScopeParam(params, "edifice", "edificeId");
        const floorId = quickOrScopeParam(params, "floor", "floorId");
        return {
            hideUnitReferencesSection: !!(projectId && edificeId && floorId),
            hasRouteProjectId: !!projectId,
            hasRouteEdificeId: !!edificeId,
            hasRouteFloorId: !!floorId,
        };
    },
    buildExtraTitles: (params) => [
        quickOrScopeLabel(params, "project", "projectName"),
        quickOrScopeLabel(params, "edifice", "edificeName"),
        quickOrScopeLabel(params, "floor", "floorName"),
    ].filter((x): x is string => !!x),
    submitIcon: <IconFrustumPlus />,
});
