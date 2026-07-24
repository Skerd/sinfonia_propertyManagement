import {Save} from "lucide-react";
import {createGenericEditPage} from "@coreModule/components/entityPage/createGenericEditPage.tsx";
import {editFeeCalculationFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/feeCalculation/editFeeCalculation.form.validator.ts";
import type {FeeCalculation} from "armonia/src/modules/propertyManagement/api/realEstate/private/feeCalculation/feeCalculation.dto.ts";
import type {EditFeeCalculationFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/feeCalculation/feeCalculation.schema-def.ts";

export default createGenericEditPage<FeeCalculation, EditFeeCalculationFormType>({
    languagePath: "src/modules/propertyManagement/clients/panel/private/feeCalculations/editFeeCalculation.tsx",
    model: "feecalculations",
    apiUrl: "/api/realEstate/feeCalculation",
    schema: editFeeCalculationFormSchema,
    mapEntityData: (data) => ({
        ...data,
        consultantAppointment: (data as any).consultantAppointment?._id ?? (data as any).consultantAppointment,
        currency: (data as any).currency?._id ?? (data as any).currency,
    } as any),
    submitIcon: <Save />,
});
