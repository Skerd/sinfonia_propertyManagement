import {Save} from "lucide-react";
import {createGenericEditPage} from "@coreModule/components/entityPage/createGenericEditPage.tsx";
import {editLeaseFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/lease/editLease.form.validator.ts";
import type {Lease} from "armonia/src/modules/propertyManagement/api/realEstate/private/lease/lease.dto.ts";
import type {EditLeaseFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/lease/lease.schema-def.ts";

function localFilesFromField(value: unknown): File[] {
    if (value instanceof File) return [value];
    if (!Array.isArray(value)) return [];
    return value.filter((x): x is File => x instanceof File);
}

export default createGenericEditPage<Lease, EditLeaseFormType>({
    languagePath:   "src/modules/propertyManagement/clients/panel/private/leases/editLease.tsx",
    collectionName: "leases",
    accessModel:    "leases",
    apiUrl:         "/api/realEstate/lease",
    schema:         editLeaseFormSchema,
    mapEntityData: (data) => ({
        ...data,
        unit:          (data.unit as any)?._id         ?? data.unit,
        tenant:        (data.tenant as any)?._id       ?? data.tenant,
        rentCurrency:  (data.rentCurrency as any)?._id ?? data.rentCurrency,
        contractMedia: (data.contractMedia as any)?._id ?? data.contractMedia,
    }),
    buildFormExtras: (_entityId, _params, entity) => ({
        enableLocalFileMultipart: true,
        editMediaExistingList:    entity?.contractMedia ? [entity.contractMedia] : [],
    }),
    mapSubmitPayload: (data, {writeFields}) => {
        const formData = new FormData();
        const fields: Record<string, unknown> = {_id: data._id};
        for (const [key, val] of Object.entries(data)) {
            if (key === "contractMedia" || key === "_id") continue;
            if ((writeFields as any)[key] !== undefined) fields[key] = val;
        }
        formData.append("data", JSON.stringify(fields));
        if ((writeFields as any).contractMedia) {
            localFilesFromField((data as any).contractMedia).forEach((file) => formData.append("files", file));
        }
        return formData;
    },
    submitIcon: <Save />,
});
