import {Save} from "lucide-react";
import {createGenericEditPage} from "@coreModule/components/entityPage/createGenericEditPage.tsx";
import {editIncomingInvoiceFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/incomingInvoice/editIncomingInvoice.form.validator.ts";
import type {IncomingInvoice} from "armonia/src/modules/propertyManagement/api/realEstate/private/incomingInvoice/incomingInvoice.dto.ts";
import type {EditIncomingInvoiceFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/incomingInvoice/incomingInvoice.schema-def.ts";

export default createGenericEditPage<IncomingInvoice, EditIncomingInvoiceFormType>({
    languagePath: "src/modules/propertyManagement/clients/panel/private/incomingInvoices/editIncomingInvoice.tsx",
    model: "incominginvoices",
    apiUrl: "/api/realEstate/incomingInvoice",
    schema: editIncomingInvoiceFormSchema,
    mapEntityData: (data) => ({
        ...data,
        project: (data as any).project?._id ?? (data as any).project,
        matchedConstructor: (data as any).matchedConstructor?._id ?? (data as any).matchedConstructor,
        matchedContract: (data as any).matchedContract?._id ?? (data as any).matchedContract,
        currency: (data as any).currency?._id ?? (data as any).currency,
    } as any),
    submitIcon: <Save />,
});
