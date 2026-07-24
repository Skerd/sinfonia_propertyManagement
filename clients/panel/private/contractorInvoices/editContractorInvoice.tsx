import {Save} from "lucide-react";
import {createGenericEditPage} from "@coreModule/components/entityPage/createGenericEditPage.tsx";
import {editContractorInvoiceFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/contractorInvoice/editContractorInvoice.form.validator.ts";
import type {ContractorInvoice} from "armonia/src/modules/propertyManagement/api/realEstate/private/contractorInvoice/contractorInvoice.dto.ts";
import type {EditContractorInvoiceFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/contractorInvoice/contractorInvoice.schema-def.ts";

export default createGenericEditPage<ContractorInvoice, EditContractorInvoiceFormType>({
    languagePath: "src/modules/propertyManagement/clients/panel/private/contractorInvoices/editContractorInvoice.tsx",
    model: "contractorinvoices",
    apiUrl: "/api/realEstate/contractorInvoice",
    schema: editContractorInvoiceFormSchema,
    mapEntityData: (data) => ({
        ...data,
        project: (data as any).project?._id ?? (data as any).project,
        edifice: (data as any).edifice?._id ?? (data as any).edifice,
        constructorRef: (data as any).constructorRef?._id ?? (data as any).constructorRef,
        constructionContract: (data as any).constructionContract?._id ?? (data as any).constructionContract,
        currency: (data as any).currency?._id ?? (data as any).currency,
    } as any),
    submitIcon: <Save />,
});
