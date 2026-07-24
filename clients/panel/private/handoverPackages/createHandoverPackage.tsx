import {IconPlus} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/createGenericCreatePage.tsx";
import {createHandoverPackageFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/handoverPackage/createHandoverPackage.form.validator.ts";
import type {CreateHandoverPackageFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/handoverPackage/handoverPackage.schema-def.ts";

export default createGenericCreatePage<CreateHandoverPackageFormType>({
    languagePath: "src/modules/propertyManagement/clients/panel/private/handoverPackages/createHandoverPackage.tsx",
    model: "handoverpackages",
    apiUrl: "/api/realEstate/handoverPackage",
    schema: createHandoverPackageFormSchema,
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
    successPath: "/realEstate/handoverPackages",
    submitIcon: <IconPlus />,
});
