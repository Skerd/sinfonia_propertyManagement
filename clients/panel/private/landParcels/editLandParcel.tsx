import {Save} from "lucide-react";
import {createGenericEditPage} from "@coreModule/components/entityPage/createGenericEditPage.tsx";
import {editLandParcelFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/landParcel/editLandParcel.form.validator.ts";
import type {LandParcel} from "armonia/src/modules/propertyManagement/api/realEstate/private/landParcel/landParcel.dto.ts";
import type {EditLandParcelFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/landParcel/landParcel.schema-def.ts";

export default createGenericEditPage<LandParcel, EditLandParcelFormType>({
    languagePath: "src/modules/propertyManagement/clients/panel/private/landParcels/editLandParcel.tsx",
    model: "landparcels",
    apiUrl: "/api/realEstate/landParcel",
    schema: editLandParcelFormSchema,
    mapEntityData: (data) => ({
        ...data,
        project: (data as any).project?._id ?? (data as any).project,
        currency: (data as any).currency?._id ?? (data as any).currency,
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
