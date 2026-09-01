import {Save} from "lucide-react";
import {createGenericEditPage} from "@coreModule/components/entityPage/createGenericEditPage.tsx";
import {editLeaseFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/lease/editLease.form.validator.ts";
import type {Lease} from "armonia/src/modules/propertyManagement/api/realEstate/private/lease/lease.dto.ts";
import type {EditLeaseFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/lease/lease.schema-def.ts";

export default createGenericEditPage<Lease, EditLeaseFormType>({
    languagePath:   "src/modules/propertyManagement/clients/panel/private/leases/editLease.tsx",
    collectionName: "leases",
    accessModel:    "leases",
    apiUrl:         "/api/realEstate/lease",
    schema:         editLeaseFormSchema,
    mapEntityData: (data) => ({
        ...data,
        unit:          data.unit?._id,
        tenant:        data.tenant?._id,
        rentCurrency:  data.rentCurrency?._id,
        contractMedia: data.contractMedia?._id,
    }),
    submitIcon: <Save />,
});
