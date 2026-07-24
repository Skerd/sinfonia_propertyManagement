import {Save} from "lucide-react";
import {createGenericEditPage} from "@coreModule/components/entityPage/createGenericEditPage.tsx";
import {editScheduleTaskFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/scheduleTask/editScheduleTask.form.validator.ts";
import type {ScheduleTask} from "armonia/src/modules/propertyManagement/api/realEstate/private/scheduleTask/scheduleTask.dto.ts";
import type {EditScheduleTaskFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/scheduleTask/scheduleTask.schema-def.ts";

export default createGenericEditPage<ScheduleTask, EditScheduleTaskFormType>({
    languagePath:   "src/modules/propertyManagement/clients/panel/private/scheduleTasks/editScheduleTask.tsx",
    model:          "scheduletasks",
    apiUrl:         "/api/realEstate/scheduleTask",
    schema:         editScheduleTaskFormSchema,
    mapEntityData: (data) => ({
        ...data,
        project:      (data.project as any)?._id ?? data.project,
        edifice:      (data.edifice as any)?._id ?? data.edifice,
        milestone:    (data.milestone as any)?._id ?? data.milestone,
        assignee:     (data.assignee as any)?._id ?? data.assignee,
        plannedStart: data.plannedStart ? new Date(data.plannedStart).toISOString().split("T")[0] : undefined,
        plannedEnd:   data.plannedEnd ? new Date(data.plannedEnd).toISOString().split("T")[0] : undefined,
        media:        data.media?.map((m: any) => m._id ?? m) ?? [],
    }),
    buildFormExtras: (_entityId, _params, entity) => ({
        enableLocalFileMultipart: true,
        editMediaExistingList: entity?.media ?? [],
    }),
    mapSubmitPayload: (data, {writeFields}) => {
        const formData = new FormData();
        const fields: Record<string, any> = {_id: data._id};
        for (const [key, val] of Object.entries(data)) {
            if (key === "media") continue;
            if ((writeFields as any)[key] !== undefined) fields[key] = val;
        }
        if ((writeFields as any).media !== undefined) {
            fields.media = (data.media as any[])
                ?.filter((p): p is string => typeof p === "string" && p.trim() !== "") ?? [];
        }
        formData.append("data", JSON.stringify(fields));
        if ((writeFields as any).media && Array.isArray(data.media)) {
            (data.media as any[]).filter((f): f is File => f instanceof File).forEach(f => formData.append("files", f));
        }
        return formData;
    },
    submitIcon: <Save />,
});
