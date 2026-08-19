import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {compose} from "redux";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import {DropdownMenuItem} from "@coreModule/components/ui/dropdown-menu.tsx";
import {Wallet} from "lucide-react";

type SalePayDownPaymentActionProps = WithLanguageType & {
    isPaid?: boolean;
    onAction: (action: string) => void;
};

function SalePayDownPaymentAction({
    isPaid = false,
    onAction,
    resolveLanguageKey,
}: SalePayDownPaymentActionProps) {
    const {write} = useAccess("paymentPlans");

    if (!write || isPaid) return null;

    return (
        <DropdownMenuItem
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onAction("payDownPayment");
            }}
        >
            <Wallet className="h-4 w-4 mr-2" />
            {resolveLanguageKey("payDownPayment")}
        </DropdownMenuItem>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/sales/center/actions/salePayDownPaymentAction.tsx"),
    withDebug(true, true, "paymentPlans"),
)(SalePayDownPaymentAction);
