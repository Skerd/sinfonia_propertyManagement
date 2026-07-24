import {IconPlus} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/createGenericCreatePage.tsx";
import {createIncomingInvoiceFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/incomingInvoice/createIncomingInvoice.form.validator.ts";
import type {CreateIncomingInvoiceFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/incomingInvoice/incomingInvoice.schema-def.ts";

export default createGenericCreatePage<CreateIncomingInvoiceFormType>({
    languagePath: "src/modules/propertyManagement/clients/panel/private/incomingInvoices/createIncomingInvoice.tsx",
    model: "incominginvoices",
    apiUrl: "/api/realEstate/incomingInvoice",
    schema: createIncomingInvoiceFormSchema,
    defaultValues: () => ({
        title: "",
    } as any),
    successPath: "/realEstate/incomingInvoices",
    submitIcon: <IconPlus />,
});
