import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {compose} from "redux";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import {DropdownMenuItem} from "@coreModule/components/ui/dropdown-menu.tsx";
import {DollarSign} from "lucide-react";
import type {PaymentPlan} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/paymentPlan/paymentPlan.dto.ts";

type SalePayInstallmentActionProps = WithLanguageType & {
    installment: PaymentPlan["installments"][number];
    onAction: (action: string) => void;
};

function SalePayInstallmentAction({
    installment,
    onAction,
    resolveLanguageKey,
}: SalePayInstallmentActionProps) {
    const {write} = useAccess("paymentPlans");
    const status = installment.status?.toLowerCase();
    const isPaid = status === "paid" || ((installment.paidAmount ?? 0) >= (installment.amount ?? 0) && (installment.amount ?? 0) > 0);

    if (!write || isPaid) return null;

    return (
        <DropdownMenuItem
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onAction("payInstallment");
            }}
        >
            <DollarSign className="h-4 w-4 mr-2" />
            {resolveLanguageKey("payInstallment")}
        </DropdownMenuItem>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/sales/center/actions/salePayInstallmentAction.tsx"),
    withDebug(true, true),
)(SalePayInstallmentAction);
