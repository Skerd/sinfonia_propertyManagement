import {IconFileCheck} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/createGenericCreatePage.tsx";
import {createProjectDocumentFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/projectDocument/createProjectDocument.form.validator.ts";
import type {CreateProjectDocumentFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/projectDocument/projectDocument.schema-def.ts";

export default createGenericCreatePage<CreateProjectDocumentFormType>({
    languagePath:   "src/modules/propertyManagement/clients/panel/private/projectDocuments/createProjectDocument.tsx",
    model:          "projectdocuments",
    apiUrl:         "/api/realEstate/projectDocument",
    schema:         createProjectDocumentFormSchema,
    defaultValues: (params) => ({
        project:      params.get("projectId") ?? "",
        edifice:      params.get("edificeId") ?? "",
        floor:        params.get("floorId") ?? "",
        unit:         params.get("unitId") ?? "",
        title:        "",
        discipline:   "architectural" as const,
        documentType: "drawing" as const,
        revision:     "A",
        media:        [],
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
    successPath: "/realEstate/projectDocuments",
    submitIcon:  <IconFileCheck />,
});
