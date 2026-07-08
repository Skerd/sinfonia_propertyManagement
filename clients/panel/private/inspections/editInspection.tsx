import {createGenericEditPage} from "@coreModule/components/entityPage/createGenericEditPage.tsx";
import {editInspectionFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/inspection/editInspection.form.validator.ts";
import type {EditInspectionFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/inspection/inspection.schema-def.ts";
import type {Inspection} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/inspection/inspection.dto.ts";
import {normalizeFindingsFromApi} from "@propertyManagementModule/helpers/general/inspectionFindingsForm.ts";

type EditInspectionFormData = Omit<EditInspectionFormType, "clientSignatureMediaId"> & {
    clientSignatureMediaId?: File;
};

export default createGenericEditPage<Inspection, EditInspectionFormData>({
    languagePath: "src/modules/propertyManagement/clients/panel/private/inspections/editInspection.tsx",
    model: "inspections",
    apiUrl: "/api/realEstate/unit/inspection",
    schema: editInspectionFormSchema,

    mapEntityData: (data) => ({
        ...data,
        unit: (data.unit as any)?._id,
        inspectedBy: (data.inspectedBy as any)?._id,
        inspectionDate: data.inspectionDate ? new Date(data.inspectionDate).toISOString().split("T")[0] : undefined,
        scheduledDate: data.scheduledDate ? new Date(data.scheduledDate).toISOString().split("T")[0] : undefined,
        nextInspectionDate: data.nextInspectionDate ? new Date(data.nextInspectionDate).toISOString().split("T")[0] : undefined,
        clientSignedAt: data.clientSignedAt ? new Date(data.clientSignedAt).toISOString().split("T")[0] : undefined,
        followUpInspection: (data.followUpInspection as any)?._id,
        findings: normalizeFindingsFromApi(data.findings as Record<string, unknown>),
        media: Array.isArray(data.media) ? data.media.map((m: any) => m._id || m).filter(Boolean) : [],
        clientSignatureMediaId: undefined,
    }),

    buildFormExtras: (entityId, params, entity) => ({
        hideProjectToUnitCascade: true,
        hideInspectionEditOnlyBlocks: false,
        inspectionId: entityId || "",
        defaultUnitId: params.get("unitId") || (entity as any)?.unit?._id || "",
        editMediaExistingList: (entity as any)?.media ?? [],
        enableLocalFileMultipart: false,
    }),

    buildExtraTitles: (params) => [params.get("projectName"), params.get("edificeName"), params.get("floorName"), params.get("unitName")].filter((x): x is string => !!x,),
});
