import {IconHomePlus} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/createGenericCreatePage.tsx";
import {createUnitTypeFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/unitType/createUnitType.form.validator.ts";
import type {CreateUnitTypeFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/unitType/unitType.schema-def.ts";

export default createGenericCreatePage<CreateUnitTypeFormType>({
    languagePath: "src/modules/propertyManagement/clients/panel/private/unitTypes/createUnitType.tsx",
    collectionName: "unittypes",
    accessModel: "unitTypes",
    apiUrl: "/api/realEstate/unitType",
    schema: createUnitTypeFormSchema,
    defaultValues: {
        name: "",
        category: "",
        group: "",
        description: "",
        icon: "",
        isPrivate: false,
    },
    mapSubmitPayload: (data) => ({
        ...data,
        description: data.description || "",
        icon: data.icon || "",
        isPrivate: data.isPrivate ?? false,
    }),
    submitIcon: <IconHomePlus />,
});
