import {Save} from "lucide-react";
import {createGenericEditPage} from "@coreModule/components/entityPage/createGenericEditPage.tsx";
import {editConstructionUpdateFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/constructionUpdate/editConstructionUpdate.form.validator.ts";
import type {ConstructionUpdate} from "armonia/src/modules/propertyManagement/api/realEstate/private/constructionUpdate/constructionUpdate.dto.ts";
import type {EditConstructionUpdateFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/constructionUpdate/constructionUpdate.schema-def.ts";

export default createGenericEditPage<ConstructionUpdate, EditConstructionUpdateFormType>({
    languagePath: "src/modules/propertyManagement/clients/panel/private/constructionUpdates/editConstructionUpdate.tsx",
    model: "constructionupdates",
    apiUrl: "/api/realEstate/constructionUpdate",
    schema: editConstructionUpdateFormSchema,
    mapEntityData: (data) => ({
        ...data,
        project: data.project?._id ?? data.project,
        edifice: data.edifice?._id ?? data.edifice,
        milestone: (data.milestone as any)?._id ?? data.milestone,
        scheduleTask: (data.scheduleTask as any)?._id ?? data.scheduleTask,
        updateDate: data.updateDate
            ? new Date(data.updateDate).toISOString().split("T")[0]
            : undefined,
        photos: data.photos?.map((m: any) => m._id ?? m) ?? [],
    }),
    buildFormExtras: (_entityId, _params, entity) => ({
        enableLocalFileMultipart: true,
        editMediaExistingList: entity?.photos ?? [],
    }),
    mapSubmitPayload: (data, {writeFields}) => {
        const formData = new FormData();
        const fields: Record<string, any> = {_id: data._id};
        for (const [key, val] of Object.entries(data)) {
            if (key === "photos") continue;
            if ((writeFields as any)[key] !== undefined) fields[key] = val;
        }
        if ((writeFields as any).photos !== undefined) {
            fields.photos = (data.photos as any[])
                ?.filter((p): p is string => typeof p === "string" && p.trim() !== "") ?? [];
        }
        formData.append("data", JSON.stringify(fields));
        if ((writeFields as any).photos && Array.isArray(data.photos)) {
            (data.photos as any[]).filter((f): f is File => f instanceof File).forEach((f) => formData.append("files", f));
        }
        return formData;
    },
    submitIcon: <Save />,
});
