import type {Commission} from "armonia/src/modules/propertyManagement/api/realEstate/private/commission/commission.dto.ts";
import MarkPaidCommissionDialog from "@propertyManagementModule/components/custom/commissions/markPaidCommissionDialog.tsx";
import MarkPendingCommissionDialog from "@propertyManagementModule/components/custom/commissions/markPendingCommissionDialog.tsx";
import RequestApprovalCommissionDialog from "@propertyManagementModule/components/custom/commissions/requestApprovalCommissionDialog.tsx";
import ApproveCommissionPaymentDialog from "@propertyManagementModule/components/custom/commissions/approveCommissionPaymentDialog.tsx";
import SetCommissionSplitsDialog from "@propertyManagementModule/components/custom/commissions/setCommissionSplitsDialog.tsx";
import {MARK_PAID_COMMISSION_ACTION} from "@propertyManagementModule/clients/panel/private/commissions/center/actions/markPaid.tsx";
import {MARK_PENDING_COMMISSION_ACTION} from "@propertyManagementModule/clients/panel/private/commissions/center/actions/markPending.tsx";
import {REQUEST_APPROVAL_COMMISSION_ACTION} from "@propertyManagementModule/clients/panel/private/commissions/center/actions/requestApproval.tsx";
import {APPROVE_PAYMENT_COMMISSION_ACTION} from "@propertyManagementModule/clients/panel/private/commissions/center/actions/approvePayment.tsx";
import {SET_SPLITS_COMMISSION_ACTION} from "@propertyManagementModule/clients/panel/private/commissions/center/actions/setSplits.tsx";

type CommissionWorkflowDialogsProps = {
    action: string;
    commission?: Commission | null;
    onClose: () => void;
    onSuccess: (updated?: Commission) => void;
};

export default function CommissionWorkflowDialogs({
    action,
    commission,
    onClose,
    onSuccess,
}: CommissionWorkflowDialogsProps) {
    if (!commission || !action) return null;
    if (action === REQUEST_APPROVAL_COMMISSION_ACTION) {
        return <RequestApprovalCommissionDialog open onClose={onClose} commission={commission} onSuccess={onSuccess} />;
    }
    if (action === MARK_PAID_COMMISSION_ACTION) {
        return <MarkPaidCommissionDialog open onClose={onClose} commission={commission} onSuccess={onSuccess} />;
    }
    if (action === APPROVE_PAYMENT_COMMISSION_ACTION) {
        return <ApproveCommissionPaymentDialog open onClose={onClose} commission={commission} onSuccess={onSuccess} />;
    }
    if (action === SET_SPLITS_COMMISSION_ACTION) {
        return <SetCommissionSplitsDialog open onClose={onClose} commission={commission} onSuccess={onSuccess} />;
    }
    if (action === MARK_PENDING_COMMISSION_ACTION) {
        return <MarkPendingCommissionDialog open onClose={onClose} commission={commission} onSuccess={onSuccess} />;
    }
    return null;
}
