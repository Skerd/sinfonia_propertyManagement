import {Save} from "lucide-react";
import {createGenericEditPage} from "@coreModule/components/entityPage/createGenericEditPage.tsx";
import {editHandoverPackageFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/handoverPackage/editHandoverPackage.form.validator.ts";
import type {HandoverPackage} from "armonia/src/modules/propertyManagement/api/realEstate/private/handoverPackage/handoverPackage.dto.ts";
import type {EditHandoverPackageFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/handoverPackage/handoverPackage.schema-def.ts";

export default createGenericEditPage<HandoverPackage, EditHandoverPackageFormType>({
    languagePath: "src/modules/propertyManagement/clients/panel/private/handoverPackages/editHandoverPackage.tsx",
    model: "handoverpackages",
    apiUrl: "/api/realEstate/handoverPackage",
    schema: editHandoverPackageFormSchema,
    mapEntityData: (data) => ({
        ...data,
        project: data.project?._id ?? "",
        edifice: data.edifice?._id,
        floor: data.floor?._id,
        unit: data.unit?._id ?? "",
        media: data.media?.map((m) => m._id ?? m) ?? [],
        items: (data.items ?? []).map((item) => ({
            name: item.name,
            description: item.description,
            instructions: item.instructions,
            importance: item.importance,
        })),
    }),
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
