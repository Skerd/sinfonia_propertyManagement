import {createGenericEditPage} from "@coreModule/components/entityPage/createGenericEditPage.tsx";
import {editUnitTypeFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/unitType/editUnitType.form.validator.ts";
import type {UnitType} from "armonia/src/modules/propertyManagement/api/realEstate/private/unitType/unitType.dto.ts";
import type {EditUnitTypeFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/unitType/unitType.schema-def.ts";

export default createGenericEditPage<UnitType, EditUnitTypeFormType>({
    languagePath: "src/modules/propertyManagement/clients/panel/private/unitTypes/editUnitType.tsx",
    collectionName: "unittypes",
    accessModel: "unitTypes",
    apiUrl: "/api/realEstate/unitType",
    schema: editUnitTypeFormSchema,
    mapEntityData: (data) => ({
        ...data,
        category: data.category?._id,
    }),
});
