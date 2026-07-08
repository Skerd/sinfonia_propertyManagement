import {IconFileText} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/createGenericCreatePage.tsx";
import {createLeaseFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/lease/createLease.form.validator.ts";
import type {CreateLeaseFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/lease/lease.schema-def.ts";

function localFilesFromField(value: unknown): File[] {
    if (value instanceof File) return [value];
    if (!Array.isArray(value)) return [];
    return value.filter((x): x is File => x instanceof File);
}

export default createGenericCreatePage<CreateLeaseFormType>({
    languagePath:   "src/modules/propertyManagement/clients/panel/private/leases/createLease.tsx",
    collectionName: "leases",
    accessModel:    "leases",
    apiUrl:         "/api/realEstate/lease",
    schema:         createLeaseFormSchema,
    defaultValues: (params) => ({
        unit:         params.get("unitId") ?? "",
        tenant:       "",
        startDate:    new Date().toISOString().split("T")[0],
        endDate:      "",
        monthlyRent:  0,
        rentCurrency: "",
        depositPaid:  false,
    }),
    buildFormExtras: (params) => ({
        prefilledUnitId: !!params.get("unitId"),
        enableLocalFileMultipart: true,
    }),
    buildExtraTitles: (params) => {
        const unitName = params.get("unitName");
        return unitName ? [unitName] : [];
    },
    mapSubmitPayload: (data) => {
        const formData = new FormData();
        const fields: Record<string, unknown> = {...data};
        delete fields.contractMedia;
        formData.append("data", JSON.stringify(fields));
        localFilesFromField((data as any).contractMedia).forEach((file) => formData.append("files", file));
        return formData;
    },
    successPath: "/realEstate/leases",
    submitIcon:  <IconFileText />,
});
