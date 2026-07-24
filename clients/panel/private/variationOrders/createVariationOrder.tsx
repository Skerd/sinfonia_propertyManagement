import {IconPlus} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/createGenericCreatePage.tsx";
import {createVariationOrderFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/variationOrder/createVariationOrder.form.validator.ts";
import type {CreateVariationOrderFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/variationOrder/variationOrder.schema-def.ts";

export default createGenericCreatePage<CreateVariationOrderFormType>({
    languagePath: "src/modules/propertyManagement/clients/panel/private/variationOrders/createVariationOrder.tsx",
    model: "variationorders",
    apiUrl: "/api/realEstate/variationOrder",
    schema: createVariationOrderFormSchema,
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
    successPath: "/realEstate/variationOrders",
    submitIcon: <IconPlus />,
});
