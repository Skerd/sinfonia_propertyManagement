import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {compose} from "redux";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {DropdownMenuItem} from "@coreModule/components/ui/dropdown-menu.tsx";
import {Ban} from "lucide-react";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import type {RentalPayment} from "armonia/src/modules/propertyManagement/api/realEstate/private/rentalPayment/rentalPayment.dto.ts";

export const WAIVE_RENTAL_PAYMENT_ACTION = "waiveRentalPayment";

const OPEN_STATUSES = new Set(["pending", "overdue", "partially_paid"]);

type WaiveRentalPaymentProps = WithLanguageType & {
    onAction: (action: string) => void;
    payment?: RentalPayment;
};

function WaiveRentalPayment({onAction, payment, resolveLanguageKey}: WaiveRentalPaymentProps) {
    const {write} = useAccess("rentalpayments");
    const status = payment?.status ?? "pending";
    const canWaive = !!write
        && !payment?.deletedAt
        && OPEN_STATUSES.has(status)
        && (payment?.remaining ?? 0) > 0;

    if (!canWaive) return null;

    return (
        <DropdownMenuItem onClick={() => {onAction(WAIVE_RENTAL_PAYMENT_ACTION);}}>
            <Ban className="text-primary" size={16} />
            <p>{resolveLanguageKey("title")}</p>
        </DropdownMenuItem>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/rentalPayments/center/actions/waive.tsx"),
    withDebug(true, true, "rentalpayments"),
)(WaiveRentalPayment);
