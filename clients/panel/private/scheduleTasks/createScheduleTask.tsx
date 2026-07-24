import {IconListCheck} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/createGenericCreatePage.tsx";
import {createScheduleTaskFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/scheduleTask/createScheduleTask.form.validator.ts";
import type {CreateScheduleTaskFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/scheduleTask/scheduleTask.schema-def.ts";

export default createGenericCreatePage<CreateScheduleTaskFormType>({
    languagePath:   "src/modules/propertyManagement/clients/panel/private/scheduleTasks/createScheduleTask.tsx",
    model:          "scheduletasks",
    apiUrl:         "/api/realEstate/scheduleTask",
    schema:         createScheduleTaskFormSchema,
    defaultValues: (params) => ({
        project:         params.get("projectId") ?? "",
        edifice:         params.get("edificeId") ?? "",
        milestone:       params.get("milestoneId") ?? "",
        title:           "",
        percentComplete: 0,
        media:           [],
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
    successPath: "/realEstate/scheduleTasks",
    submitIcon:  <IconListCheck />,
});
