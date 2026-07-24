import {IconPlus} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/createGenericCreatePage.tsx";
import {createFeeCalculationFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/feeCalculation/createFeeCalculation.form.validator.ts";
import type {CreateFeeCalculationFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/feeCalculation/feeCalculation.schema-def.ts";

export default createGenericCreatePage<CreateFeeCalculationFormType>({
    languagePath: "src/modules/propertyManagement/clients/panel/private/feeCalculations/createFeeCalculation.tsx",
    model: "feecalculations",
    apiUrl: "/api/realEstate/feeCalculation",
    schema: createFeeCalculationFormSchema,
    defaultValues: (params) => ({
        consultantAppointment: params.get("consultantAppointmentId") ?? "",
    } as any),
    successPath: "/realEstate/feeCalculations",
    submitIcon: <IconPlus />,
});
