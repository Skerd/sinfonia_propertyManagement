import {IconPlus} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/createGenericCreatePage.tsx";
import {createCostClassificationFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/costClassification/createCostClassification.form.validator.ts";
import type {CreateCostClassificationFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/costClassification/costClassification.schema-def.ts";

export default createGenericCreatePage<CreateCostClassificationFormType>({
    languagePath: "src/modules/propertyManagement/clients/panel/private/costClassifications/createCostClassification.tsx",
    model: "costclassifications",
    apiUrl: "/api/realEstate/costClassification",
    schema: createCostClassificationFormSchema,
    defaultValues: () => ({
        standard: "ebkp_h",
        code: "",
        title: "",
        active: true,
    } as any),
    successPath: "/realEstate/costClassifications",
    submitIcon: <IconPlus />,
});
