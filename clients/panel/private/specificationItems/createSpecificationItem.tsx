import {IconPlus} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/createGenericCreatePage.tsx";
import {createSpecificationItemFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/specificationItem/createSpecificationItem.form.validator.ts";
import type {CreateSpecificationItemFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/specificationItem/specificationItem.schema-def.ts";

export default createGenericCreatePage<CreateSpecificationItemFormType>({
    languagePath: "src/modules/propertyManagement/clients/panel/private/specificationItems/createSpecificationItem.tsx",
    model: "specificationitems",
    apiUrl: "/api/realEstate/specificationItem",
    schema: createSpecificationItemFormSchema,
    defaultValues: (params) => ({
        specification: params.get("specificationId") ?? "",
        title: "",
        isRPosition: false,
    } as any),
    successPath: "/realEstate/specificationItems",
    submitIcon: <IconPlus />,
});
