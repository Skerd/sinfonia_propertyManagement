import {IconPlus} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/createGenericCreatePage.tsx";
import {createSubmittalFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/submittal/createSubmittal.form.validator.ts";
import type {CreateSubmittalFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/submittal/submittal.schema-def.ts";

export default createGenericCreatePage<CreateSubmittalFormType>({
    languagePath: "src/modules/propertyManagement/clients/panel/private/submittals/createSubmittal.tsx",
    model: "submittals",
    apiUrl: "/api/realEstate/submittal",
    schema: createSubmittalFormSchema,
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
    successPath: "/realEstate/submittals",
    submitIcon: <IconPlus />,
});
