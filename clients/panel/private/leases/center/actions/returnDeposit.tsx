import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {compose} from "redux";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {DropdownMenuItem} from "@coreModule/components/ui/dropdown-menu.tsx";
import {Wallet} from "lucide-react";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import type {Lease} from "armonia/src/modules/propertyManagement/api/realEstate/private/lease/lease.dto.ts";

export const RETURN_DEPOSIT_ACTION = "returnDeposit";

type ReturnDepositProps = WithLanguageType & {
    onAction: (action: string) => void;
    lease?: Lease;
};

function ReturnDeposit({onAction, lease, resolveLanguageKey}: ReturnDepositProps) {
    const {write} = useAccess("leases");
    const canReturn = !!write
        && !lease?.deletedAt
        && !!lease?.depositPaid
        && !lease?.depositReturnedAt;

    if (!canReturn) return null;

    return (
        <DropdownMenuItem onClick={() => {onAction(RETURN_DEPOSIT_ACTION);}}>
            <Wallet className="text-primary" size={16} />
            <p>{resolveLanguageKey("title")}</p>
        </DropdownMenuItem>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/leases/center/actions/returnDeposit.tsx"),
    withDebug(true, true, "leases"),
)(ReturnDeposit);
