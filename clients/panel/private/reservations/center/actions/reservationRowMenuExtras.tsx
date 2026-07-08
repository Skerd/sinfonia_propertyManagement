import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import {Reservation} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/reservation/reservation.dto.ts";
import CancelReservation from "@propertyManagementModule/clients/panel/private/reservations/center/actions/cancel.tsx";
import ReinstateReservation from "@propertyManagementModule/clients/panel/private/reservations/center/actions/reinstate.tsx";
import PaidInFullReservation from "@propertyManagementModule/clients/panel/private/reservations/center/actions/paidInFull.tsx";
import ReverseReservationPayment from "@propertyManagementModule/clients/panel/private/reservations/center/actions/reversePayment.tsx";
import ManualReservationClientEmails from "@propertyManagementModule/clients/panel/private/reservations/center/actions/manualReservationClientEmails.tsx";

type ReservationRowMenuExtrasProps = {
    reservation: Reservation;
    onAction: (action: string) => void;
};

/** Custom `ActionMenu` children (Cancel, Reinstate, Pay in full, Reverse payment). View, Edit, Delete, Restore come from `ActionMenu`. */
export default function ReservationRowMenuExtras({reservation, onAction}: ReservationRowMenuExtrasProps) {
    const {write} = useAccess("reservations");
    const writeFields = (typeof write === "object" && write !== null ? write : {}) as Record<string, unknown>;
    const canToggleActive = writeFields.isActive !== undefined;
    const isModelDeleted = reservation.deletedAt != null || reservation.deletedBy != null;
    const isCancelled = reservation.isActive === false;
    const paid = reservation.paid === true;

    return (
        <>
            {canToggleActive && !isModelDeleted && !isCancelled && !paid && (
                <CancelReservation onAction={onAction} />
            )}
            {canToggleActive && !isModelDeleted && isCancelled && (
                <ReinstateReservation onAction={onAction} />
            )}
            {canToggleActive && !isModelDeleted && !isCancelled && !paid && (
                <PaidInFullReservation onAction={onAction} />
            )}
            {canToggleActive && !isModelDeleted && !isCancelled && paid && (
                <ReverseReservationPayment onAction={onAction} />
            )}
            {canToggleActive && !isModelDeleted && !isCancelled && !paid && (
                <ManualReservationClientEmails reservation={reservation} onAction={onAction} />
            )}
        </>
    );
}
