import {IconPlus} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/createGenericCreatePage.tsx";
import {createRfiFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/rfi/createRfi.form.validator.ts";
import type {CreateRfiFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/rfi/rfi.schema-def.ts";

export default createGenericCreatePage<CreateRfiFormType>({
    languagePath: "src/modules/propertyManagement/clients/panel/private/rfis/createRfi.tsx",
    model: "rfis",
    apiUrl: "/api/realEstate/rfi",
    schema: createRfiFormSchema,
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
    successPath: "/realEstate/rfis",
    submitIcon: <IconPlus />,
});
