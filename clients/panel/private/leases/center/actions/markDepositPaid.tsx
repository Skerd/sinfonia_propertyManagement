import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {compose} from "redux";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {DropdownMenuItem} from "@coreModule/components/ui/dropdown-menu.tsx";
import {CircleCheck} from "lucide-react";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import type {Lease} from "armonia/src/modules/propertyManagement/api/realEstate/private/lease/lease.dto.ts";

export const MARK_DEPOSIT_PAID_ACTION = "markDepositPaid";

type MarkDepositPaidProps = WithLanguageType & {
    onAction: (action: string) => void;
    lease?: Lease;
};

function MarkDepositPaid({onAction, lease, resolveLanguageKey}: MarkDepositPaidProps) {
    const {write} = useAccess("leases");
    const canMark = !!write
        && !lease?.deletedAt
        && !lease?.depositPaid;

    if (!canMark) return null;

    return (
        <DropdownMenuItem onClick={() => {onAction(MARK_DEPOSIT_PAID_ACTION);}}>
            <CircleCheck className="text-primary" size={16} />
            <p>{resolveLanguageKey("title")}</p>
        </DropdownMenuItem>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/leases/center/actions/markDepositPaid.tsx"),
    withDebug(true, true, "leases"),
)(MarkDepositPaid);
