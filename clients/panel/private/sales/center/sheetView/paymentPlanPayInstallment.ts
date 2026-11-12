import {createContext} from "react";
import type {PaymentPlanInstallment} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/paymentPlan/paymentPlan.dto.ts";

/**
 * Opens the pay dialog for an installment. The schedule is a sheet token (`#PaymentPlanInstallments`, rendered by the
 * view engine), so it reaches the sheet that owns the dialog and its data through context.
 */
export const PaymentPlanPayInstallment = createContext<(installment: PaymentPlanInstallment) => void>(() => {});
