import {IconPlus} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/createGenericCreatePage.tsx";
import {createSpecificationFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/specification/createSpecification.form.validator.ts";
import type {CreateSpecificationFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/specification/specification.schema-def.ts";

export default createGenericCreatePage<CreateSpecificationFormType>({
    languagePath: "src/modules/propertyManagement/clients/panel/private/specifications/createSpecification.tsx",
    model: "specifications",
    apiUrl: "/api/realEstate/specification",
    schema: createSpecificationFormSchema,
    defaultValues: (params) => ({
        project: params.get("projectId") ?? "",
        standard: "npk",
        title: "",
    } as any),
    successPath: "/realEstate/specifications",
    submitIcon: <IconPlus />,
});
