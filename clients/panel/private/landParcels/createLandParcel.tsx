import {IconPlus} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/createGenericCreatePage.tsx";
import {createLandParcelFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/landParcel/createLandParcel.form.validator.ts";
import type {CreateLandParcelFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/landParcel/landParcel.schema-def.ts";

export default createGenericCreatePage<CreateLandParcelFormType>({
    languagePath: "src/modules/propertyManagement/clients/panel/private/landParcels/createLandParcel.tsx",
    model: "landparcels",
    apiUrl: "/api/realEstate/landParcel",
    schema: createLandParcelFormSchema,
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
    successPath: "/realEstate/landParcels",
    submitIcon: <IconPlus />,
});
