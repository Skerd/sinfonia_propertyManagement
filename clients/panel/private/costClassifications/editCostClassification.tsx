import {Save} from "lucide-react";
import {createGenericEditPage} from "@coreModule/components/entityPage/createGenericEditPage.tsx";
import {editCostClassificationFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/costClassification/editCostClassification.form.validator.ts";
import type {CostClassification} from "armonia/src/modules/propertyManagement/api/realEstate/private/costClassification/costClassification.dto.ts";
import type {EditCostClassificationFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/costClassification/costClassification.schema-def.ts";

export default createGenericEditPage<CostClassification, EditCostClassificationFormType>({
    languagePath: "src/modules/propertyManagement/clients/panel/private/costClassifications/editCostClassification.tsx",
    model: "costclassifications",
    apiUrl: "/api/realEstate/costClassification",
    schema: editCostClassificationFormSchema,
    mapEntityData: (data) => ({...data} as any),
    submitIcon: <Save />,
});
