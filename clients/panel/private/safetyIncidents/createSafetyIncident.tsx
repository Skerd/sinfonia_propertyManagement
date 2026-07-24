import {IconPlus} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/createGenericCreatePage.tsx";
import {createSafetyIncidentFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/safetyIncident/createSafetyIncident.form.validator.ts";
import type {CreateSafetyIncidentFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/safetyIncident/safetyIncident.schema-def.ts";

export default createGenericCreatePage<CreateSafetyIncidentFormType>({
    languagePath: "src/modules/propertyManagement/clients/panel/private/safetyIncidents/createSafetyIncident.tsx",
    model: "safetyincidents",
    apiUrl: "/api/realEstate/safetyIncident",
    schema: createSafetyIncidentFormSchema,
    defaultValues: (params) => ({
        project: params.get("projectId") ?? "",
        title: "",
        severity: "low" as const,
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
    successPath: "/realEstate/safetyIncidents",
    submitIcon: <IconPlus />,
});
