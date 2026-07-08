import {IconClipboardCheck} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/createGenericCreatePage.tsx";
import {createSnagFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/snag/createSnag.form.validator.ts";
import type {CreateSnagFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/snag/snag.schema-def.ts";

export default createGenericCreatePage<CreateSnagFormType>({
    languagePath:   "src/modules/propertyManagement/clients/panel/private/snags/createSnag.tsx",
    model:          "snags",
    apiUrl:         "/api/realEstate/snag",
    schema:         createSnagFormSchema,
    defaultValues: (params) => ({
        unit:     params.get("unitId") ?? "",
        title:    "",
        severity: "medium" as const,
        photos:   [],
    }),
    buildFormExtras: (params) => ({
        prefilledUnitId: !!params.get("unitId"),
        enableLocalFileMultipart: true,
    }),
    buildExtraTitles: (params) => {
        const unitName = params.get("unitName");
        return unitName ? [unitName] : [];
    },
    mapSubmitPayload: (data) => {
        const formData = new FormData();
        const fields: Record<string, any> = {...data};
        const photos = fields.photos as File[] | undefined;
        delete fields.photos;
        formData.append("data", JSON.stringify(fields));
        if (Array.isArray(photos)) {
            photos.filter((f): f is File => f instanceof File).forEach(f => formData.append("files", f));
        }
        return formData;
    },
    successPath: "/realEstate/snags",
    submitIcon:  <IconClipboardCheck />,
});
