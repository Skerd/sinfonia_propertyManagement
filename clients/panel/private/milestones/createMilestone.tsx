import {IconFlag} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/createGenericCreatePage.tsx";
import {createMilestoneFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/milestone/createMilestone.form.validator.ts";
import type {CreateMilestoneFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/milestone/milestone.schema-def.ts";

export default createGenericCreatePage<CreateMilestoneFormType>({
    languagePath:   "src/modules/propertyManagement/clients/panel/private/milestones/createMilestone.tsx",
    model:          "milestones",
    apiUrl:         "/api/realEstate/milestone",
    schema:         createMilestoneFormSchema,
    defaultValues: (params) => ({
        project:      params.get("projectId") ?? "",
        edifice:      params.get("edificeId") ?? "",
        title:        "",
        predecessors: [],
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
    successPath: "/realEstate/milestones",
    submitIcon:  <IconFlag />,
});
