import {IconTag} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/createGenericCreatePage.tsx";
import {createUnitTypeCategoryFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/unitTypeCategory/createUnitTypeCategory.form.validator.ts";
import type {CreateUnitTypeCategoryFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/unitTypeCategory/unitTypeCategory.schema-def.ts";

export default createGenericCreatePage<CreateUnitTypeCategoryFormType>({
    languagePath: "src/modules/propertyManagement/clients/panel/private/unitTypeCategories/createUnitTypeCategory.tsx",
    collectionName: "unittypecategories",
    accessModel: "unitTypeCategories",
    apiUrl: "/api/realEstate/unitTypeCategory",
    schema: createUnitTypeCategoryFormSchema,
    defaultValues: {
        name: "",
    },
    submitIcon: <IconTag />,
});
