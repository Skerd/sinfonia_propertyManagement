import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {compose} from "redux";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {DropdownMenuItem} from "@coreModule/components/ui/dropdown-menu.tsx";
import {Ban} from "lucide-react";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import type {Lease} from "armonia/src/modules/propertyManagement/api/realEstate/private/lease/lease.dto.ts";

export const TERMINATE_LEASE_ACTION = "terminateLease";

type TerminateLeaseProps = WithLanguageType & {
    onAction: (action: string) => void;
    lease?: Lease;
};

function TerminateLease({onAction, lease, resolveLanguageKey}: TerminateLeaseProps) {
    const {write} = useAccess("leases");
    const canTerminate = !!write && !lease?.deletedAt && lease?.status === "active";

    if (!canTerminate) return null;

    return (
        <DropdownMenuItem onClick={() => {onAction(TERMINATE_LEASE_ACTION);}}>
            <Ban className="text-primary" size={16} />
            <p>{resolveLanguageKey("title")}</p>
        </DropdownMenuItem>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/leases/center/actions/terminate.tsx"),
    withDebug(true, true, "leases"),
)(TerminateLease);
