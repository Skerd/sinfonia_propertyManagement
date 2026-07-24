import {IconPlus} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/createGenericCreatePage.tsx";
import {createContractorInvoiceFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/contractorInvoice/createContractorInvoice.form.validator.ts";
import type {CreateContractorInvoiceFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/contractorInvoice/contractorInvoice.schema-def.ts";

export default createGenericCreatePage<CreateContractorInvoiceFormType>({
    languagePath: "src/modules/propertyManagement/clients/panel/private/contractorInvoices/createContractorInvoice.tsx",
    model: "contractorinvoices",
    apiUrl: "/api/realEstate/contractorInvoice",
    schema: createContractorInvoiceFormSchema,
    defaultValues: (params) => ({
        project: params.get("projectId") ?? "",
        source: "manual",
    } as any),
    successPath: "/realEstate/contractorInvoices",
    submitIcon: <IconPlus />,
});
