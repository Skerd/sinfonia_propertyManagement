import {IconDeviceFloppy} from "@tabler/icons-react";
import {createGenericEditPage} from "@coreModule/components/entityPage/pages/createGenericEditPage.tsx";
import {editRentalPaymentFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/rentalPayment/editRentalPayment.form.validator.ts";
import type {RentalPayment} from "armonia/src/modules/propertyManagement/api/realEstate/private/rentalPayment/rentalPayment.dto.ts";
import type {EditRentalPaymentFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/rentalPayment/rentalPayment.schema-def.ts";
import {refId} from "@propertyManagementModule/helpers/forms/editPageMapping.ts";

function localFilesFromField(value: unknown): File[] {
    if (value instanceof File) return [value];
    if (!Array.isArray(value)) return [];
    return value.filter((x): x is File => x instanceof File);
}

export default createGenericEditPage<RentalPayment, EditRentalPaymentFormType>({
    languagePath:   "src/modules/propertyManagement/clients/panel/private/rentalPayments/editRentalPayment.tsx",
    collectionName: "rentalpayments",
    accessModel:    "rentalpayments",
    apiUrl:         "/api/realEstate/rentalPayment",
    schema:         editRentalPaymentFormSchema,
    mapEntityData: (data) => ({
        ...data,
        lease:        refId(data.lease),
        currency:     refId(data.currency),
        receiptMedia: refId(data.receiptMedia),
    }),
    buildFormExtras: (_entityId, _params, entity) => ({
        enableLocalFileMultipart: true,
        editMediaExistingList: entity?.receiptMedia ? [entity.receiptMedia] : [],
    }),
    mapSubmitPayload: (data, {writeFields}) => {
        const formData = new FormData();
        const fields: Record<string, unknown> = {_id: data._id};
        for (const [key, val] of Object.entries(data)) {
            if (key === "receiptMedia" || key === "_id") continue;
            if (writeFields[key] !== undefined) fields[key] = val;
        }
        formData.append("data", JSON.stringify(fields));
        if (writeFields.receiptMedia) {
            localFilesFromField(data.receiptMedia).forEach((file) => formData.append("files", file));
        }
        return formData;
    },
    submitIcon: <IconDeviceFloppy />,
});
