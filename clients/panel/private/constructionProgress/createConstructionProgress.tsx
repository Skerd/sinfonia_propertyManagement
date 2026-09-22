import {IconBackhoe} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/pages/createGenericCreatePage.tsx";
import {createConstructionProgressFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/constructionProgress/createConstructionProgress.form.validator.ts";
import type {CreateConstructionProgressFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/constructionProgress/constructionProgress.schema-def.ts";

export default createGenericCreatePage<CreateConstructionProgressFormType>({
    languagePath: "src/modules/propertyManagement/clients/panel/private/constructionProgress/createConstructionProgress.tsx",
    model: "constructionprogresses",
    apiUrl: "/api/realEstate/constructionProgress",
    schema: createConstructionProgressFormSchema,
    defaultValues: (params) => ({
        project: params.get("projectId") ?? "",
        edifice: params.get("edificeId") ?? "",
        phase: undefined,
        title: "",
        progressPercent: 0,
        updateDate: new Date().toISOString().split("T")[0],
        photos: [],
        notifyClients: true,
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
        const photos = fields.photos as File[] | undefined;
        delete fields.photos;
        formData.append("data", JSON.stringify(fields));
        if (Array.isArray(photos)) {
            photos.filter((f): f is File => f instanceof File).forEach((f) => formData.append("files", f));
        }
        return formData;
    },
    successPath: "/realEstate/constructionProgress",
    submitIcon: <IconBackhoe />,
});
