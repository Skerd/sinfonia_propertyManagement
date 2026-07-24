import {IconPlus} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/createGenericCreatePage.tsx";
import {createCommissioningRecordFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/commissioningRecord/createCommissioningRecord.form.validator.ts";
import type {CreateCommissioningRecordFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/commissioningRecord/commissioningRecord.schema-def.ts";

export default createGenericCreatePage<CreateCommissioningRecordFormType>({
    languagePath: "src/modules/propertyManagement/clients/panel/private/commissioningRecords/createCommissioningRecord.tsx",
    model: "commissioningrecords",
    apiUrl: "/api/realEstate/commissioningRecord",
    schema: createCommissioningRecordFormSchema,
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
    successPath: "/realEstate/commissioningRecords",
    submitIcon: <IconPlus />,
});
