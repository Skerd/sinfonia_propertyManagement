import {Save} from "lucide-react";
import {createGenericEditPage} from "@coreModule/components/entityPage/createGenericEditPage.tsx";
import {editConsultantAppointmentFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/consultantAppointment/editConsultantAppointment.form.validator.ts";
import type {ConsultantAppointment} from "armonia/src/modules/propertyManagement/api/realEstate/private/consultantAppointment/consultantAppointment.dto.ts";
import type {EditConsultantAppointmentFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/consultantAppointment/consultantAppointment.schema-def.ts";

export default createGenericEditPage<ConsultantAppointment, EditConsultantAppointmentFormType>({
    languagePath: "src/modules/propertyManagement/clients/panel/private/consultantAppointments/editConsultantAppointment.tsx",
    model: "consultantappointments",
    apiUrl: "/api/realEstate/consultantAppointment",
    schema: editConsultantAppointmentFormSchema,
    mapEntityData: (data) => ({
        ...data,
        project: (data as any).project?._id ?? (data as any).project,
        constructorRef: (data as any).constructorRef?._id ?? (data as any).constructorRef,
        currency: (data as any).currency?._id ?? (data as any).currency,
        startDate: (data as any).startDate ? new Date((data as any).startDate).toISOString().split("T")[0] : undefined,
        endDate: (data as any).endDate ? new Date((data as any).endDate).toISOString().split("T")[0] : undefined,
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
