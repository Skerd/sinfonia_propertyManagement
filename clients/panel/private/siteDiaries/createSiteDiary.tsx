import {IconPlus} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/createGenericCreatePage.tsx";
import {createSiteDiaryFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/siteDiary/createSiteDiary.form.validator.ts";
import type {CreateSiteDiaryFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/siteDiary/siteDiary.schema-def.ts";

export default createGenericCreatePage<CreateSiteDiaryFormType>({
    languagePath: "src/modules/propertyManagement/clients/panel/private/siteDiaries/createSiteDiary.tsx",
    model: "sitediaries",
    apiUrl: "/api/realEstate/siteDiary",
    schema: createSiteDiaryFormSchema,
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
    successPath: "/realEstate/siteDiaries",
    submitIcon: <IconPlus />,
});
