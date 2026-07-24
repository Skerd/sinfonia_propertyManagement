import {IconPlus} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/createGenericCreatePage.tsx";
import {createFeasibilityStudyFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/feasibilityStudy/createFeasibilityStudy.form.validator.ts";
import type {CreateFeasibilityStudyFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/feasibilityStudy/feasibilityStudy.schema-def.ts";

export default createGenericCreatePage<CreateFeasibilityStudyFormType>({
    languagePath: "src/modules/propertyManagement/clients/panel/private/feasibilityStudies/createFeasibilityStudy.tsx",
    model: "feasibilitystudies",
    apiUrl: "/api/realEstate/feasibilityStudy",
    schema: createFeasibilityStudyFormSchema,
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
    successPath: "/realEstate/feasibilityStudies",
    submitIcon: <IconPlus />,
});
