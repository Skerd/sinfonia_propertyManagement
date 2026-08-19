import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {compose} from "redux";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {DropdownMenuItem} from "@coreModule/components/ui/dropdown-menu.tsx";
import {CircleCheck} from "lucide-react";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import type {RentalPayment} from "armonia/src/modules/propertyManagement/api/realEstate/private/rentalPayment/rentalPayment.dto.ts";

export const MARK_RENTAL_PAYMENT_PAID_ACTION = "markRentalPaymentPaid";

type MarkRentalPaymentPaidProps = WithLanguageType & {
    onAction: (action: string) => void;
    payment?: RentalPayment;
};

function MarkRentalPaymentPaid({onAction, payment, resolveLanguageKey}: MarkRentalPaymentPaidProps) {
    const {write} = useAccess("rentalpayments");
    const status = payment?.status ?? "pending";
    const canMark = !!write
        && !payment?.deletedAt
        && (status === "pending" || status === "overdue");

    if (!canMark) return null;

    return (
        <DropdownMenuItem onClick={() => {onAction(MARK_RENTAL_PAYMENT_PAID_ACTION);}}>
            <CircleCheck className="text-primary" size={16} />
            <p>{resolveLanguageKey("title")}</p>
        </DropdownMenuItem>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/rentalPayments/center/actions/markPaid.tsx"),
    withDebug(true, true, "rentalpayments"),
)(MarkRentalPaymentPaid);
