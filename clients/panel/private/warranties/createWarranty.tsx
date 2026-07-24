import {IconPlus} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/createGenericCreatePage.tsx";
import {createWarrantyFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/warranty/createWarranty.form.validator.ts";
import type {CreateWarrantyFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/warranty/warranty.schema-def.ts";

export default createGenericCreatePage<CreateWarrantyFormType>({
    languagePath: "src/modules/propertyManagement/clients/panel/private/warranties/createWarranty.tsx",
    model: "warranties",
    apiUrl: "/api/realEstate/warranty",
    schema: createWarrantyFormSchema,
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
    successPath: "/realEstate/warranties",
    submitIcon: <IconPlus />,
});
