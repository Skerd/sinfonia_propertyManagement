import {IconReceiptDollar} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/createGenericCreatePage.tsx";
import {createRentalPaymentFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/rentalPayment/createRentalPayment.form.validator.ts";
import type {CreateRentalPaymentFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/rentalPayment/rentalPayment.schema-def.ts";

function localFilesFromField(value: unknown): File[] {
    if (value instanceof File) return [value];
    if (!Array.isArray(value)) return [];
    return value.filter((x): x is File => x instanceof File);
}

export default createGenericCreatePage<CreateRentalPaymentFormType>({
    languagePath:   "src/modules/propertyManagement/clients/panel/private/rentalPayments/createRentalPayment.tsx",
    collectionName: "rentalpayments",
    accessModel:    "rentalpayments",
    apiUrl:         "/api/realEstate/rentalPayment",
    schema:         createRentalPaymentFormSchema,
    defaultValues: (params) => ({
        lease:    params.get("leaseId") ?? "",
        dueDate:  "",
        amount:   0,
        currency: "",
    }),
    buildFormExtras: (params) => ({
        prefilledLeaseId: !!params.get("leaseId"),
        enableLocalFileMultipart: true,
    }),
    buildExtraTitles: (params) => {
        const leaseName = params.get("leaseName");
        return leaseName ? [leaseName] : [];
    },
    mapSubmitPayload: (data) => {
        const formData = new FormData();
        const fields: Record<string, unknown> = {...data};
        delete fields.receiptMedia;
        formData.append("data", JSON.stringify(fields));
        localFilesFromField((data as any).receiptMedia).forEach((file) => formData.append("files", file));
        return formData;
    },
    successPath: "/realEstate/rentalPayments",
    submitIcon:  <IconReceiptDollar />,
});
