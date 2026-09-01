import {IconFileText} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/createGenericCreatePage.tsx";
import {createLeaseFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/lease/createLease.form.validator.ts";
import type {CreateLeaseFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/lease/lease.schema-def.ts";

export default createGenericCreatePage<CreateLeaseFormType>({
    languagePath:   "src/modules/propertyManagement/clients/panel/private/leases/createLease.tsx",
    collectionName: "leases",
    accessModel:    "leases",
    apiUrl:         "/api/realEstate/lease",
    schema:         createLeaseFormSchema,
    defaultValues: (params) => ({
        unit: params.get("unitId") ?? "",
    }),
    buildFormExtras: (params) => ({
        prefilledUnitId: !!params.get("unitId"),
    }),
    buildExtraTitles: (params) => {
        const unitName = params.get("unitName");
        return unitName ? [unitName] : [];
    },
    successPath: "/realEstate/leases",
    submitIcon:  <IconFileText />,
});
