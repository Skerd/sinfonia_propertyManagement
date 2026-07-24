import {IconPlus} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/createGenericCreatePage.tsx";
import {createConstructionContractFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/constructionContract/createConstructionContract.form.validator.ts";
import type {CreateConstructionContractFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/constructionContract/constructionContract.schema-def.ts";

export default createGenericCreatePage<CreateConstructionContractFormType>({
    languagePath: "src/modules/propertyManagement/clients/panel/private/constructionContracts/createConstructionContract.tsx",
    model: "constructioncontracts",
    apiUrl: "/api/realEstate/constructionContract",
    schema: createConstructionContractFormSchema,
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
    successPath: "/realEstate/constructionContracts",
    submitIcon: <IconPlus />,
});
