import {createGenericEditPage} from "@coreModule/components/entityPage/pages/createGenericEditPage.tsx";
import {editInspectionFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/inspection/editInspection.form.validator.ts";
import type {EditInspectionFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/inspection/inspection.schema-def.ts";
import type {Inspection} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/inspection/inspection.dto.ts";
import {normalizeFindingsFromApi} from "@propertyManagementModule/helpers/general/inspectionFindingsForm.ts";
import {refId, calendarDay} from "@propertyManagementModule/helpers/forms/editPageMapping.ts";

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
        unit: refId(data.unit),
        inspectedBy: refId(data.inspectedBy),
        inspectionDate: calendarDay(data.inspectionDate),
        scheduledDate: calendarDay(data.scheduledDate),
        nextInspectionDate: calendarDay(data.nextInspectionDate),
        clientSignedAt: calendarDay(data.clientSignedAt),
        followUpInspection: refId(data.followUpInspection),
        checklistTemplate: refId(data.checklistTemplate),
        findings: normalizeFindingsFromApi(data.findings as Record<string, unknown>),
        media: Array.isArray(data.media) ? data.media.map((m: any) => m._id || m).filter(Boolean) : [],
        clientSignatureMediaId: undefined,
    }),

    buildFormExtras: (entityId, params, entity) => ({
        hideProjectToUnitCascade: true,
        hideInspectionEditOnlyBlocks: false,
        inspectionId: entityId || "",
        defaultUnitId: params.get("unitId") || entity?.unit?._id || "",
        editMediaExistingList: entity?.media ?? [],
        enableLocalFileMultipart: false,
    }),

    buildExtraTitles: (params) => [params.get("projectName"), params.get("edificeName"), params.get("floorName"), params.get("unitName")].filter((x): x is string => !!x,),
});
