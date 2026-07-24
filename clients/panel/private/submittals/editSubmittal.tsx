import {Save} from "lucide-react";
import {createGenericEditPage} from "@coreModule/components/entityPage/createGenericEditPage.tsx";
import {editSubmittalFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/submittal/editSubmittal.form.validator.ts";
import type {Submittal} from "armonia/src/modules/propertyManagement/api/realEstate/private/submittal/submittal.dto.ts";
import type {EditSubmittalFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/submittal/submittal.schema-def.ts";

export default createGenericEditPage<Submittal, EditSubmittalFormType>({
    languagePath: "src/modules/propertyManagement/clients/panel/private/submittals/editSubmittal.tsx",
    model: "submittals",
    apiUrl: "/api/realEstate/submittal",
    schema: editSubmittalFormSchema,
    mapEntityData: (data) => ({
        ...data,
        project: (data as any).project?._id ?? (data as any).project,
        edifice: (data as any).edifice?._id ?? (data as any).edifice,
        relatedDocument: (data as any).relatedDocument?._id ?? (data as any).relatedDocument,
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
