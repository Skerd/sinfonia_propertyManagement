import {Save} from "lucide-react";
import {createGenericEditPage} from "@coreModule/components/entityPage/createGenericEditPage.tsx";
import {editMilestoneFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/milestone/editMilestone.form.validator.ts";
import type {Milestone} from "armonia/src/modules/propertyManagement/api/realEstate/private/milestone/milestone.dto.ts";
import type {EditMilestoneFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/milestone/milestone.schema-def.ts";

export default createGenericEditPage<Milestone, EditMilestoneFormType>({
    languagePath:   "src/modules/propertyManagement/clients/panel/private/milestones/editMilestone.tsx",
    model:          "milestones",
    apiUrl:         "/api/realEstate/milestone",
    schema:         editMilestoneFormSchema,
    mapEntityData: (data) => ({
        ...data,
        project:      (data.project as any)?._id ?? data.project,
        edifice:      (data.edifice as any)?._id ?? data.edifice,
        predecessors: data.predecessors?.map((m: any) => m._id ?? m) ?? [],
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
