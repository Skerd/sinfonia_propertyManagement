import {IconFileCertificate} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/createGenericCreatePage.tsx";
import {createPermitFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/permit/createPermit.form.validator.ts";
import type {CreatePermitFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/permit/permit.schema-def.ts";

export default createGenericCreatePage<CreatePermitFormType>({
    languagePath:   "src/modules/propertyManagement/clients/panel/private/permits/createPermit.tsx",
    model:          "permits",
    apiUrl:         "/api/realEstate/permit",
    schema:         createPermitFormSchema,
    defaultValues: (params) => ({
        project:    params.get("projectId") ?? "",
        edifice:    params.get("edificeId") ?? "",
        title:      "",
        permitType: "building" as const,
        media:      [],
    }),
    buildFormExtras: (params) => ({
        prefilledProjectId: !!params.get("projectId"),
        enableLocalFileMultipart: true,
    }),
    buildExtraTitles: (params) => {
        const projectName = params.get("projectName");
        return projectName ? [projectName] : [];
    },
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
    successPath: "/realEstate/permits",
    submitIcon:  <IconFileCertificate />,
});
