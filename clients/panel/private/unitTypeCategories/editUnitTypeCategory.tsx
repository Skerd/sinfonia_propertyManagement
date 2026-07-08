import {createGenericEditPage} from "@coreModule/components/entityPage/createGenericEditPage.tsx";
import {editUnitTypeCategoryFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/unitTypeCategory/editUnitTypeCategory.form.validator.ts";
import type {UnitTypeCategory} from "armonia/src/modules/propertyManagement/api/realEstate/private/unitTypeCategory/unitTypeCategory.dto.ts";
import type {EditUnitTypeCategoryFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/unitTypeCategory/unitTypeCategory.schema-def.ts";

export default createGenericEditPage<UnitTypeCategory, EditUnitTypeCategoryFormType>({
    languagePath: "src/modules/propertyManagement/clients/panel/private/unitTypeCategories/editUnitTypeCategory.tsx",
    collectionName: "unittypecategories",
    accessModel: "unitTypeCategories",
    apiUrl: "/api/realEstate/unitTypeCategory",
    schema: editUnitTypeCategoryFormSchema,
    mapEntityData: (data) => ({...data}),
});
