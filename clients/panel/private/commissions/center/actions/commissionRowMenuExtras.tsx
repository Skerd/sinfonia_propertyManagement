import {useAccess} from "@coreModule/helpers/context/accessContext.tsx";
import {Commission} from "armonia/src/modules/propertyManagement/api/realEstate/private/commission/commission.dto.ts";
import RequestApprovalCommission from "@propertyManagementModule/clients/panel/private/commissions/center/actions/requestApproval.tsx";
import MarkPaidCommission from "@propertyManagementModule/clients/panel/private/commissions/center/actions/markPaid.tsx";
import ApprovePaymentCommission from "@propertyManagementModule/clients/panel/private/commissions/center/actions/approvePayment.tsx";
import SetSplitsCommission from "@propertyManagementModule/clients/panel/private/commissions/center/actions/setSplits.tsx";
import MarkPendingCommission from "@propertyManagementModule/clients/panel/private/commissions/center/actions/markPending.tsx";

type CommissionRowMenuExtrasProps = {
    commission: Commission;
    onAction: (action: string) => void;
};

export default function CommissionRowMenuExtras({commission, onAction}: CommissionRowMenuExtrasProps) {
    const {write} = useAccess("commissions");
    const writeFields = (write || {}) as Record<string, unknown>;
    const canStatus = writeFields["status"] !== undefined;
    const isDeleted = commission.deletedAt != null || commission.deletedBy != null;
    const isPending = commission.status === "pending";
    const isPendingApproval = commission.status === "pending_approval";
    const isApproved = commission.status === "approved";
    const isPaid = commission.status === "paid";
    const isVoided = commission.status === "voided";

    if (!canStatus || isDeleted || isVoided) return null;

    return (
        <>
            {isPending && <RequestApprovalCommission onAction={onAction} />}
            {(isPending || isApproved) && <MarkPaidCommission onAction={onAction} />}
            {isPendingApproval && <ApprovePaymentCommission onAction={onAction} />}
            {(isPending || isPendingApproval || isApproved || isPaid) && <SetSplitsCommission onAction={onAction} />}
            {isPaid && <MarkPendingCommission onAction={onAction} />}
        </>
    );
}
