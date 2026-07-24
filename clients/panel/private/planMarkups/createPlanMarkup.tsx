import {IconPlus} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/createGenericCreatePage.tsx";
import {createPlanMarkupFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/planMarkup/createPlanMarkup.form.validator.ts";
import type {CreatePlanMarkupFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/planMarkup/planMarkup.schema-def.ts";

export default createGenericCreatePage<CreatePlanMarkupFormType>({
    languagePath: "src/modules/propertyManagement/clients/panel/private/planMarkups/createPlanMarkup.tsx",
    model: "planmarkups",
    apiUrl: "/api/realEstate/planMarkup",
    schema: createPlanMarkupFormSchema,
    defaultValues: (params) => ({
        planDocument: params.get("planDocumentId") ?? "",
        markerType: "defect",
        title: "",
    } as any),
    successPath: "/realEstate/planMarkups",
    submitIcon: <IconPlus />,
});
