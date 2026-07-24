import {Save} from "lucide-react";
import {createGenericEditPage} from "@coreModule/components/entityPage/createGenericEditPage.tsx";
import {editProgressClaimFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/progressClaim/editProgressClaim.form.validator.ts";
import type {ProgressClaim} from "armonia/src/modules/propertyManagement/api/realEstate/private/progressClaim/progressClaim.dto.ts";
import type {EditProgressClaimFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/progressClaim/progressClaim.schema-def.ts";

export default createGenericEditPage<ProgressClaim, EditProgressClaimFormType>({
    languagePath: "src/modules/propertyManagement/clients/panel/private/progressClaims/editProgressClaim.tsx",
    model: "progressclaims",
    apiUrl: "/api/realEstate/progressClaim",
    schema: editProgressClaimFormSchema,
    mapEntityData: (data) => ({
        ...data,
        project: (data as any).project?._id ?? (data as any).project,
        constructionContract: (data as any).constructionContract?._id ?? (data as any).constructionContract,
        currency: (data as any).currency?._id ?? (data as any).currency,
        claimPeriodStart: (data as any).claimPeriodStart ? new Date((data as any).claimPeriodStart).toISOString().split("T")[0] : undefined,
        claimPeriodEnd: (data as any).claimPeriodEnd ? new Date((data as any).claimPeriodEnd).toISOString().split("T")[0] : undefined,
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
