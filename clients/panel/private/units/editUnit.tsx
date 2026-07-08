import {createGenericEditPage} from "@coreModule/components/entityPage/createGenericEditPage.tsx";
import {FORM_EXTRAS_OBJECT_ID_CHIP_LABEL_REFS} from "@coreModule/components/custom/formObjectIdChips.tsx";
import {editUnitFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/unit/editUnit.form.validator.ts";
import type {Unit} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/unit/unit.dto.ts";
import type {EditUnitFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/unit/unit.schema-def.ts";

const connectedUnitsLabelsState = {
    loadedId: null as string | null,
    labels: {current: {} as Record<string, string>},
};

function buildConnectedUnitLabel(u: {
    _id?: string;
    name?: string;
    unitNumber?: string;
    unitType?: {_id?: string; name?: string};
}): string {
    const id = u._id || "";
    let label = u.unitNumber ? String(u.unitNumber) : "";
    if (u.name) label = label ? `${label} - ${u.name}` : u.name;
    if (u.unitType?.name) label = label ? `${label} - ${u.unitType.name}` : u.unitType.name;
    return label || id;
}

function syncConnectedUnitsLabels(entity: Unit) {
    if (connectedUnitsLabelsState.loadedId !== entity._id) {
        connectedUnitsLabelsState.loadedId = entity._id;
        connectedUnitsLabelsState.labels.current = {};
    }
    for (const u of entity.connectedUnits || []) {
        const id = u._id;
        if (id) {
            connectedUnitsLabelsState.labels.current[id] = buildConnectedUnitLabel(u);
        }
    }
}

export default createGenericEditPage<Unit, EditUnitFormType>({
    languagePath: "src/modules/propertyManagement/clients/panel/private/units/editUnit.tsx",
    model: "units",
    apiUrl: "/api/realEstate/unit",
    schema: editUnitFormSchema,
    mapEntityData: (data) => ({
        ...data,
        project: data.project?._id,
        edifice: data.edifice?._id,
        floor: data.floor?._id,
        unitType: data.unitType?._id,
        priceCurrency: data.priceCurrency?._id,
        mainImage: data.mainImage?._id,
        imageGallery: data.imageGallery?.map((img) => img._id) ?? undefined,
        videoGallery: data.videoGallery?.map((vid) => vid._id) ?? undefined,
        mediaFiles: data.mediaFiles?.map((f) => f._id) ?? undefined,
        marketingBooklet: data.marketingBooklet?._id,
        connectedUnits: (data.connectedUnits ?? []).map((u) => u._id),
    }),
    buildFormExtras: (entityId, _params, entity) => {
        if (entity) {syncConnectedUnitsLabels(entity);}
        return {
            unitId: entityId ?? "",
            [FORM_EXTRAS_OBJECT_ID_CHIP_LABEL_REFS]: {
                connectedUnits: connectedUnitsLabelsState.labels,
            },
        };
    },
    buildExtraTitles: (params, entityName) => [params.get("projectName"), params.get("edificeName"), params.get("floorName"), entityName].filter((x): x is string => !!x),
    beforeSubmit: (data, {writeFields, params}) => {
        const finalEdificeId = (data as any).edifice || params.get("edificeId") || undefined;
        const finalFloorId = (data as any).floor || params.get("floorId") || undefined;
        if (writeFields.edifice && !finalEdificeId) return "form.edificeRequired";
        if (writeFields.floor && !finalFloorId) return "form.floorRequired";
        return null;
    }
});
