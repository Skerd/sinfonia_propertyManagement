import {IconBackhoe} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/createGenericCreatePage.tsx";
import {createConstructionUpdateFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/constructionUpdate/createConstructionUpdate.form.validator.ts";
import type {CreateConstructionUpdateFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/constructionUpdate/constructionUpdate.schema-def.ts";

export default createGenericCreatePage<CreateConstructionUpdateFormType>({
    languagePath: "src/modules/propertyManagement/clients/panel/private/constructionUpdates/createConstructionUpdate.tsx",
    model: "constructionupdates",
    apiUrl: "/api/realEstate/constructionUpdate",
    schema: createConstructionUpdateFormSchema,
    defaultValues: (params) => ({
        project: params.get("projectId") ?? "",
        edifice: params.get("edificeId") ?? "",
        milestone: params.get("milestoneId") ?? "",
        scheduleTask: params.get("scheduleTaskId") ?? "",
        title: "",
        progressPercent: 0,
        updateDate: new Date().toISOString().split("T")[0],
        photos: [],
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
    successPath: "/realEstate/constructionUpdates",
    submitIcon: <IconBackhoe />,
});
