import {useState} from "react";
import type {Lease} from "armonia/src/modules/propertyManagement/api/realEstate/private/lease/lease.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import LeaseSheetView from "@propertyManagementModule/clients/panel/private/leases/center/sheetView/leaseSheetView.tsx";
import TerminateLease, {TERMINATE_LEASE_ACTION} from "@propertyManagementModule/clients/panel/private/leases/center/actions/terminate.tsx";
import MarkDepositPaid, {MARK_DEPOSIT_PAID_ACTION} from "@propertyManagementModule/clients/panel/private/leases/center/actions/markDepositPaid.tsx";
import ReturnDeposit, {RETURN_DEPOSIT_ACTION} from "@propertyManagementModule/clients/panel/private/leases/center/actions/returnDeposit.tsx";
import {RECORD_RENT_PAYMENT_ACTION} from "@propertyManagementModule/clients/panel/private/leases/center/actions/recordRentPayment.tsx";
import ViewLeasePayments from "@propertyManagementModule/clients/panel/private/leases/center/actions/viewPayments.tsx";
import TerminateLeaseDialog from "@propertyManagementModule/components/custom/leases/terminateLeaseDialog.tsx";
import MarkDepositPaidDialog from "@propertyManagementModule/components/custom/leases/markDepositPaidDialog.tsx";
import ReturnDepositDialog from "@propertyManagementModule/components/custom/leases/returnDepositDialog.tsx";
import RecordRentPaymentDialog from "@propertyManagementModule/components/custom/leases/recordRentPaymentDialog.tsx";

/** The lease sheet's own menu items; the sheet adds "Record payment" itself. Shared by the card's and the table's sheet. */
export function LeaseSheetMenuItems({lease, onAction}: {lease: Lease; onAction: (action: string) => void}) {
    return (
        <>
            <ViewLeasePayments lease={lease} />
            <TerminateLease lease={lease} onAction={onAction} />
            <MarkDepositPaid lease={lease} onAction={onAction} />
            <ReturnDeposit lease={lease} onAction={onAction} />
        </>
    );
}

type LeaseActionDialogsProps = {
    action: string;
    lease: Lease;
    onClose: () => void;
    onSuccess: (updated?: Lease) => void;
};

/** The dialog a lease menu action opens, from a card, a table row or a sheet. */
export function LeaseActionDialogs({action, lease, onClose, onSuccess}: LeaseActionDialogsProps) {
    if (action === TERMINATE_LEASE_ACTION) return <TerminateLeaseDialog open onClose={onClose} lease={lease} onSuccess={onSuccess} />;
    if (action === MARK_DEPOSIT_PAID_ACTION) return <MarkDepositPaidDialog open onClose={onClose} lease={lease} onSuccess={onSuccess} />;
    if (action === RETURN_DEPOSIT_ACTION) return <ReturnDepositDialog open onClose={onClose} lease={lease} onSuccess={onSuccess} />;
    if (action === RECORD_RENT_PAYMENT_ACTION) return <RecordRentPaymentDialog open onClose={onClose} lease={lease} onSuccess={onSuccess} />;
    return null;
}

type LeaseTableSheetProps = {
    lease: Lease;
    open: boolean;
    onClose: () => void;
    onDelete: (response?: DeletedData) => void;
    onRestore: () => void;
    onUpdated: (updated: Lease) => void;
};

/** A table row opens the same lease sheet as a card: titled by the tenant, with the lease's menu and dialogs (UX-01). */
export function LeaseTableSheet({lease, open, onClose, onDelete, onRestore, onUpdated}: LeaseTableSheetProps) {
    const [action, setAction] = useState("");
    const [current, setCurrent] = useState(lease);
    return (
        <>
            <LeaseSheetView
                open={open}
                onOpenChange={(next: boolean) => { if (!next) onClose(); }}
                lease={current}
                onDelete={onDelete}
                onRestore={onRestore}
                actionMenuAllowCustomChildren
                onActionMenuAction={setAction}
                actionMenuChildren={<LeaseSheetMenuItems lease={current} onAction={setAction} />}
            />
            <LeaseActionDialogs
                action={action}
                lease={current}
                onClose={() => setAction("")}
                onSuccess={(updated?: Lease) => {
                    if (updated) {
                        setCurrent({...current, ...updated});
                        onUpdated(updated);
                    }
                    setAction("");
                }}
            />
        </>
    );
}
