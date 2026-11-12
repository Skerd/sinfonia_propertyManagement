import {useEffect, useState} from "react";
import type {UseFormReturn} from "react-hook-form";
import {IconFrustumPlus} from "@tabler/icons-react";
import useHttpRequest, {type HttpRequest} from "@coreModule/helpers/hooks/useHttpRequest.ts";
import type {Floor} from "armonia/src/modules/propertyManagement/api/realEstate/private/floor/floor.dto.ts";
import {createGenericCreatePage} from "@coreModule/components/entityPage/pages/createGenericCreatePage.tsx";
import {createUnitFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/unit/createUnit.form.validator.ts";
import type {CreateUnitFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/unit/unit.schema-def.ts";
import {quickOrScopeLabel, quickOrScopeParam} from "@coreModule/helpers/filter/filterUrl.ts";

const FLOOR_REQUEST: HttpRequest = {method: "post", url: "/api/realEstate/floor/single"};

/** The price starts in the building's sale currency once the floor is known (UX-06, D151); a currency already picked stays. Renders nothing. */
function PriceCurrencyFromBuilding({form}: {form: UseFormReturn<CreateUnitFormType>}) {
    const floorId = form.watch("floor");
    const [floorCount, setFloorCount] = useState(0);
    useEffect(() => {
        if (floorId) setFloorCount((count) => count + 1);
    }, [floorId]);
    useHttpRequest<Floor>(FLOOR_REQUEST, {_id: floorId}, floorCount, true, {
        success: (floor) => {
            const currencyId = floor.effectivePricing?.saleCurrency?._id;
            if (currencyId && !form.getValues("priceCurrency")) form.setValue("priceCurrency", currencyId);
        },
    });
    return null;
}

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
    renderChildren: (form) => <PriceCurrencyFromBuilding form={form} />,
});
