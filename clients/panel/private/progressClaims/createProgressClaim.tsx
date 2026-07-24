import {IconPlus} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/createGenericCreatePage.tsx";
import {createProgressClaimFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/progressClaim/createProgressClaim.form.validator.ts";
import type {CreateProgressClaimFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/progressClaim/progressClaim.schema-def.ts";

export default createGenericCreatePage<CreateProgressClaimFormType>({
    languagePath: "src/modules/propertyManagement/clients/panel/private/progressClaims/createProgressClaim.tsx",
    model: "progressclaims",
    apiUrl: "/api/realEstate/progressClaim",
    schema: createProgressClaimFormSchema,
    defaultValues: (params) => ({
        project: params.get("projectId") ?? "",
        title: "",
        media: [],
    } as any),
    buildFormExtras: () => ({enableLocalFileMultipart: true}),
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
    successPath: "/realEstate/progressClaims",
    submitIcon: <IconPlus />,
});
