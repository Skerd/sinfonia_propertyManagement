import {Save} from "lucide-react";
import {createGenericEditPage} from "@coreModule/components/entityPage/createGenericEditPage.tsx";
import {editSiteDiaryFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/siteDiary/editSiteDiary.form.validator.ts";
import type {SiteDiary} from "armonia/src/modules/propertyManagement/api/realEstate/private/siteDiary/siteDiary.dto.ts";
import type {EditSiteDiaryFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/siteDiary/siteDiary.schema-def.ts";

export default createGenericEditPage<SiteDiary, EditSiteDiaryFormType>({
    languagePath: "src/modules/propertyManagement/clients/panel/private/siteDiaries/editSiteDiary.tsx",
    model: "sitediaries",
    apiUrl: "/api/realEstate/siteDiary",
    schema: editSiteDiaryFormSchema,
    mapEntityData: (data) => ({
        ...data,
        project: (data as any).project?._id ?? (data as any).project,
        edifice: (data as any).edifice?._id ?? (data as any).edifice,
        diaryDate: (data as any).diaryDate ? new Date((data as any).diaryDate).toISOString().split("T")[0] : undefined,
        media: (data as any).media?.map((m: any) => m._id ?? m) ?? [],
    } as any),
    buildFormExtras: (_entityId, _params, entity) => ({
        enableLocalFileMultipart: true,
        editMediaExistingList: (entity as any)?.media ?? [],
    }),
    mapSubmitPayload: (data, {writeFields}) => {
        const formData = new FormData();
        const fields: Record<string, any> = {_id: (data as any)._id};
        for (const [key, val] of Object.entries(data)) {
            if (key === "media") continue;
            if ((writeFields as any)[key] !== undefined) fields[key] = val;
        }
        if ((writeFields as any).media !== undefined) {
            fields.media = ((data as any).media as any[])
                ?.filter((p): p is string => typeof p === "string" && p.trim() !== "") ?? [];
        }
        formData.append("data", JSON.stringify(fields));
        if ((writeFields as any).media && Array.isArray((data as any).media)) {
            ((data as any).media as any[]).filter((f): f is File => f instanceof File).forEach(f => formData.append("files", f));
        }
        return formData;
    },
    submitIcon: <Save />,
});
