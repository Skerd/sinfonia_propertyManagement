import {IconPlus} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/createGenericCreatePage.tsx";
import {createTenderFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/tender/createTender.form.validator.ts";
import type {CreateTenderFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/tender/tender.schema-def.ts";

export default createGenericCreatePage<CreateTenderFormType>({
    languagePath: "src/modules/propertyManagement/clients/panel/private/tenders/createTender.tsx",
    model: "tenders",
    apiUrl: "/api/realEstate/tender",
    schema: createTenderFormSchema,
    defaultValues: (params) => ({
        project: params.get("projectId") ?? "",
        specification: params.get("specificationId") ?? "",
        title: "",
    } as any),
    successPath: "/realEstate/tenders",
    submitIcon: <IconPlus />,
});
