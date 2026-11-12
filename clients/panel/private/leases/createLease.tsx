import {useEffect, useState} from "react";
import type {UseFormReturn} from "react-hook-form";
import {IconFileText} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/pages/createGenericCreatePage.tsx";
import useHttpRequest, {type HttpRequest} from "@coreModule/helpers/hooks/useHttpRequest.ts";
import {companyToday} from "@coreModule/helpers/general/dateTime.ts";
import {createLeaseFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/lease/createLease.form.validator.ts";
import type {CreateLeaseFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/lease/lease.schema-def.ts";
import type {Unit} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/unit/unit.dto.ts";

const UNIT_REQUEST: HttpRequest = {method: "post", url: "/api/realEstate/unit/single"};

/** The rent starts in the picked unit's currency (UX-06, D151); a currency already picked stays. Renders nothing. */
function RentCurrencyFromUnit({form}: {form: UseFormReturn<CreateLeaseFormType>}) {
    const unitId = form.watch("unit");
    const [unitCount, setUnitCount] = useState(0);
    useEffect(() => {
        if (unitId) setUnitCount((count) => count + 1);
    }, [unitId]);
    useHttpRequest<Unit>(UNIT_REQUEST, {_id: unitId}, unitCount, true, {
        success: (unit) => {
            if (unit.priceCurrency?._id && !form.getValues("rentCurrency")) form.setValue("rentCurrency", unit.priceCurrency._id);
        },
    });
    return null;
}

export default createGenericCreatePage<CreateLeaseFormType>({
    languagePath:   "src/modules/propertyManagement/clients/panel/private/leases/createLease.tsx",
    collectionName: "leases",
    accessModel:    "leases",
    apiUrl:         "/api/realEstate/lease",
    schema:         createLeaseFormSchema,
    // A lease usually starts on the company's today (UX-06, GLB-09).
    defaultValues: (params, {timeZone}) => ({
        unit: params.get("unitId") ?? "",
        startDate: companyToday(timeZone),
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
    renderChildren: (form) => <RentCurrencyFromUnit form={form} />,
});
