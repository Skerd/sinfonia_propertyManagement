import {IconPlus} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/createGenericCreatePage.tsx";
import {createConsultantAppointmentFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/consultantAppointment/createConsultantAppointment.form.validator.ts";
import type {CreateConsultantAppointmentFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/consultantAppointment/consultantAppointment.schema-def.ts";

export default createGenericCreatePage<CreateConsultantAppointmentFormType>({
    languagePath: "src/modules/propertyManagement/clients/panel/private/consultantAppointments/createConsultantAppointment.tsx",
    model: "consultantappointments",
    apiUrl: "/api/realEstate/consultantAppointment",
    schema: createConsultantAppointmentFormSchema,
    defaultValues: (params) => ({
        project: params.get("projectId") ?? "",
        title: "",
        role: "architect" as const,
        media: [],
    } as any),
    buildFormExtras: () => ({enableLocalFileMultipart: true}),
    mapSubmitPayload: (data) => {
        const formData = new FormData();
        const fields: Record<string, any> = {...data};
        const media = fields.media as File[] | undefined;
        delete fields.media;
        formData.append("data", JSON.stringify(fields));
        if (Array.isArray(media)) {
            media.filter((f): f is File => f instanceof File).forEach(f => formData.append("files", f));
        }
        return formData;
    },
    successPath: "/realEstate/consultantAppointments",
    submitIcon: <IconPlus />,
});
