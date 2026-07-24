import {IconPlus} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/createGenericCreatePage.tsx";
import {createCostCommitmentFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/costCommitment/createCostCommitment.form.validator.ts";
import type {CreateCostCommitmentFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/costCommitment/costCommitment.schema-def.ts";

export default createGenericCreatePage<CreateCostCommitmentFormType>({
    languagePath: "src/modules/propertyManagement/clients/panel/private/costCommitments/createCostCommitment.tsx",
    model: "costcommitments",
    apiUrl: "/api/realEstate/costCommitment",
    schema: createCostCommitmentFormSchema,
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
    successPath: "/realEstate/costCommitments",
    submitIcon: <IconPlus />,
});
