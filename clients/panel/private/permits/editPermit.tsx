import {Save} from "lucide-react";
import {createGenericEditPage} from "@coreModule/components/entityPage/createGenericEditPage.tsx";
import {editPermitFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/permit/editPermit.form.validator.ts";
import type {Permit} from "armonia/src/modules/propertyManagement/api/realEstate/private/permit/permit.dto.ts";
import type {EditPermitFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/permit/permit.schema-def.ts";

export default createGenericEditPage<Permit, EditPermitFormType>({
    languagePath: "src/modules/propertyManagement/clients/panel/private/permits/editPermit.tsx",
    model: "permits",
    apiUrl: "/api/realEstate/permit",
    schema: editPermitFormSchema,
    mapEntityData: (data) => ({
        ...data,
        project: (data.project as any)?._id ?? data.project,
        edifice: (data.edifice as any)?._id ?? data.edifice,
        expiresAt: data.expiresAt ? new Date(data.expiresAt).toISOString().split("T")[0] : undefined,
        media: data.media?.map((m: any) => m._id ?? m) ?? [],
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
