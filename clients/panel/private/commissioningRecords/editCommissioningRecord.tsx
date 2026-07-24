import {Save} from "lucide-react";
import {createGenericEditPage} from "@coreModule/components/entityPage/createGenericEditPage.tsx";
import {editCommissioningRecordFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/commissioningRecord/editCommissioningRecord.form.validator.ts";
import type {CommissioningRecord} from "armonia/src/modules/propertyManagement/api/realEstate/private/commissioningRecord/commissioningRecord.dto.ts";
import type {EditCommissioningRecordFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/commissioningRecord/commissioningRecord.schema-def.ts";

export default createGenericEditPage<CommissioningRecord, EditCommissioningRecordFormType>({
    languagePath: "src/modules/propertyManagement/clients/panel/private/commissioningRecords/editCommissioningRecord.tsx",
    model: "commissioningrecords",
    apiUrl: "/api/realEstate/commissioningRecord",
    schema: editCommissioningRecordFormSchema,
    mapEntityData: (data) => ({
        ...data,
        project: (data as any).project?._id ?? (data as any).project,
        edifice: (data as any).edifice?._id ?? (data as any).edifice,
        unit: (data as any).unit?._id ?? (data as any).unit,
        handoverPackage: (data as any).handoverPackage?._id ?? (data as any).handoverPackage,
        testDate: (data as any).testDate ? new Date((data as any).testDate).toISOString().split("T")[0] : undefined,
        media: (data as any).media?.map((m: any) => m._id ?? m) ?? [],
    } as any),
    buildFormExtras: (_entityId, _params, entity) => ({
        enableLocalFileMultipart: true,
        editMediaExistingList: (entity as any)?.media ?? [],
    }),
    mapSubmitPayload: (data, {writeFields}) => {
        const formData = new FormData();
        const fields: Record<string, any> = {_id: (data as any)._id};
        for (const [key, val] of Object.entries(data)) {
            if (key === "media") continue;
            if ((writeFields as any)[key] !== undefined) fields[key] = val;
        }
        if ((writeFields as any).media !== undefined) {
            fields.media = ((data as any).media as any[])
                ?.filter((p): p is string => typeof p === "string" && p.trim() !== "") ?? [];
        }
        formData.append("data", JSON.stringify(fields));
        if ((writeFields as any).media && Array.isArray((data as any).media)) {
            ((data as any).media as any[]).filter((f): f is File => f instanceof File).forEach(f => formData.append("files", f));
        }
        return formData;
    },
    submitIcon: <Save />,
});
