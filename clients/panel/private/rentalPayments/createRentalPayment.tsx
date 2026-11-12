import {useEffect, useState} from "react";
import type {UseFormReturn} from "react-hook-form";
import {IconReceiptDollar} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/pages/createGenericCreatePage.tsx";
import useHttpRequest, {type HttpRequest} from "@coreModule/helpers/hooks/useHttpRequest.ts";
import type {Lease} from "armonia/src/modules/propertyManagement/api/realEstate/private/lease/lease.dto.ts";
import {createRentalPaymentFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/rentalPayment/createRentalPayment.form.validator.ts";
import type {CreateRentalPaymentFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/rentalPayment/rentalPayment.schema-def.ts";

const LEASE_REQUEST: HttpRequest = {method: "post", url: "/api/realEstate/lease/single"};

/** The charge starts at the picked lease's monthly rent in its currency (UX-06, D151); values already typed stay. Renders nothing. */
function RentFromLease({form}: {form: UseFormReturn<CreateRentalPaymentFormType>}) {
    const leaseId = form.watch("lease");
    const [leaseCount, setLeaseCount] = useState(0);
    useEffect(() => {
        if (leaseId) setLeaseCount((count) => count + 1);
    }, [leaseId]);
    useHttpRequest<Lease>(LEASE_REQUEST, {_id: leaseId}, leaseCount, true, {
        success: (lease) => {
            if (form.getValues("amount") == null && lease.monthlyRent != null) form.setValue("amount", lease.monthlyRent);
            if (lease.rentCurrency?._id && !form.getValues("currency")) form.setValue("currency", lease.rentCurrency._id);
        },
    });
    return null;
}

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
    // Amount and currency come from the lease once it is picked; no 0 that could be saved by accident (UX-06).
    defaultValues: (params) => ({
        lease:   params.get("leaseId") ?? "",
        dueDate: "",
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
        localFilesFromField(data.receiptMedia).forEach((file) => formData.append("files", file));
        return formData;
    },
    successPath: "/realEstate/rentalPayments",
    submitIcon:  <IconReceiptDollar />,
    renderChildren: (form) => <RentFromLease form={form} />,
});
