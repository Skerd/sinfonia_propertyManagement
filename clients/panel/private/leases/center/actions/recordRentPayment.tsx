import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {compose} from "redux";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {DropdownMenuItem} from "@coreModule/components/ui/dropdown-menu.tsx";
import {Banknote} from "lucide-react";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import type {Lease} from "armonia/src/modules/propertyManagement/api/realEstate/private/lease/lease.dto.ts";

export const RECORD_RENT_PAYMENT_ACTION = "recordRentPayment";

type RecordRentPaymentProps = WithLanguageType & {
    onAction: (action: string) => void;
    lease?: Lease;
};

function RecordRentPayment({onAction, lease, resolveLanguageKey}: RecordRentPaymentProps) {
    const {write} = useAccess("leases");
    const canRecord = !!write && !lease?.deletedAt && lease?.status === "active";

    if (!canRecord) return null;

    return (
        <DropdownMenuItem onClick={() => {onAction(RECORD_RENT_PAYMENT_ACTION);}}>
            <Banknote className="text-primary" size={16} />
            <p>{resolveLanguageKey("title")}</p>
        </DropdownMenuItem>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/leases/center/actions/recordRentPayment.tsx"),
    withDebug(true, true, "leases"),
)(RecordRentPayment);
