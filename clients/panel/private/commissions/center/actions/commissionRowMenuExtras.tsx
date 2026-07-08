import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import {Commission} from "armonia/src/modules/propertyManagement/api/realEstate/private/commission/commission.dto.ts";
import MarkPaidCommission from "@propertyManagementModule/clients/panel/private/commissions/center/actions/markPaid.tsx";
import MarkPendingCommission from "@propertyManagementModule/clients/panel/private/commissions/center/actions/markPending.tsx";

type CommissionRowMenuExtrasProps = {
    commission: Commission;
    onModify?: (updated?: Commission) => void;
};

/** Custom `ActionMenu` children (mark paid / pending). View, Delete, Restore come from `ActionMenu`. */
export default function CommissionRowMenuExtras({commission, onModify}: CommissionRowMenuExtrasProps) {
    const {write} = useAccess("commissions");
    const writeFields = (write || {}) as Record<string, unknown>;
    const canStatus = writeFields["status"] !== undefined;
    const isPaid = commission.status === "paid";
    const isPending = commission.status === "pending";

    return (
        <>
            {canStatus && isPending && (
                <MarkPaidCommission commission={commission} onSuccess={(u?: Commission) => onModify?.(u)} />
            )}
            {canStatus && isPaid && (
                <MarkPendingCommission commission={commission} onSuccess={(u?: Commission) => onModify?.(u)} />
            )}
        </>
    );
}
