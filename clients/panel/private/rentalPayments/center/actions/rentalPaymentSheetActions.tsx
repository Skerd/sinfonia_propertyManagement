import {useState} from "react";
import type {RentalPayment} from "armonia/src/modules/propertyManagement/api/realEstate/private/rentalPayment/rentalPayment.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import RentalPaymentSheetView from "@propertyManagementModule/clients/panel/private/rentalPayments/center/sheetView/rentalPaymentSheetView.tsx";
import MarkRentalPaymentPaid, {MARK_RENTAL_PAYMENT_PAID_ACTION} from "@propertyManagementModule/clients/panel/private/rentalPayments/center/actions/markPaid.tsx";
import WaiveRentalPayment, {WAIVE_RENTAL_PAYMENT_ACTION} from "@propertyManagementModule/clients/panel/private/rentalPayments/center/actions/waive.tsx";
import ManualRentClientEmails from "@propertyManagementModule/clients/panel/private/leases/center/actions/manualRentClientEmails.tsx";
import MarkRentalPaymentPaidDialog from "@propertyManagementModule/components/custom/rentalPayments/markRentalPaymentPaidDialog.tsx";
import WaiveRentalPaymentDialog from "@propertyManagementModule/components/custom/rentalPayments/waiveRentalPaymentDialog.tsx";

/** A rental payment's menu items, the same on a card, a table row and its sheet. */
export function RentalPaymentMenuItems({payment, onAction}: {payment: RentalPayment; onAction: (action: string) => void}) {
    return (
        <>
            <MarkRentalPaymentPaid payment={payment} onAction={onAction} />
            <WaiveRentalPayment payment={payment} onAction={onAction} />
            <ManualRentClientEmails payment={payment} />
        </>
    );
}

type RentalPaymentActionDialogsProps = {
    action: string;
    payment: RentalPayment;
    onClose: () => void;
    onSuccess: (updated?: RentalPayment) => void;
};

/** The dialog a rental payment menu action opens. */
export function RentalPaymentActionDialogs({action, payment, onClose, onSuccess}: RentalPaymentActionDialogsProps) {
    if (action === MARK_RENTAL_PAYMENT_PAID_ACTION) return <MarkRentalPaymentPaidDialog open onClose={onClose} payment={payment} onSuccess={onSuccess} />;
    if (action === WAIVE_RENTAL_PAYMENT_ACTION) return <WaiveRentalPaymentDialog open onClose={onClose} payment={payment} onSuccess={onSuccess} />;
    return null;
}

type RentalPaymentTableSheetProps = {
    payment: RentalPayment;
    open: boolean;
    onClose: () => void;
    onDelete: (response?: DeletedData) => void;
    onRestore: () => void;
    onUpdated: (updated: RentalPayment) => void;
};

/** A table row opens the same sheet as a card: titled by the tenant, with the payment's menu and dialogs (UX-01). */
export function RentalPaymentTableSheet({payment, open, onClose, onDelete, onRestore, onUpdated}: RentalPaymentTableSheetProps) {
    const [action, setAction] = useState("");
    const [current, setCurrent] = useState(payment);
    return (
        <>
            <RentalPaymentSheetView
                open={open}
                onOpenChange={(next: boolean) => { if (!next) onClose(); }}
                rentalPayment={current}
                onDelete={onDelete}
                onRestore={onRestore}
                actionMenuAllowCustomChildren
                onActionMenuAction={setAction}
                actionMenuChildren={<RentalPaymentMenuItems payment={current} onAction={setAction} />}
            />
            <RentalPaymentActionDialogs
                action={action}
                payment={current}
                onClose={() => setAction("")}
                onSuccess={(updated?: RentalPayment) => {
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
