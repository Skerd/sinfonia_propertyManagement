import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {compose} from "redux";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {Reservation} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/reservation/reservation.dto.ts";
import ResendStaffNotificationsMenuItem from "@propertyManagementModule/components/custom/sale/resendStaffNotificationsMenuItem.tsx";

type ResendReservationStaffNotificationsProps = WithLanguageType &
    WithAxiosType<{ok: true; recipients: number}, {_id: string}> & {
        reservation: Reservation;
    };

/** Re-sends the "new reservation" alert to the Sales & handover → Notify on reservations list. */
function ResendReservationStaffNotifications({reservation, resolveLanguageKey, innerRef, onFilterChange, loading}: ResendReservationStaffNotificationsProps) {
    if (reservation.deletedAt != null || reservation.deletedBy != null) {
        return null;
    }
    return (
        <ResendStaffNotificationsMenuItem
            resolveLanguageKey={resolveLanguageKey}
            loading={loading}
            innerRef={innerRef}
            onConfirm={() => onFilterChange({_id: reservation._id})}
        />
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/reservations/center/actions/resendReservationStaffNotifications.tsx"),
    withAxios(
        {
            method: "POST",
            url: "/api/realEstate/unit/reservation/resendStaffNotifications",
            data: {},
        },
        true,
    ),
    withDebug(true, true, "reservations"),
)(ResendReservationStaffNotifications);
