import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {compose} from "redux";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useMemo} from "react";
import {DropdownMenuItem, DropdownMenuSeparator, DropdownMenuShortcut} from "@coreModule/components/ui/dropdown-menu.tsx";
import {IconMail} from "@tabler/icons-react";
import {Reservation} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/reservation/reservation.dto.ts";
import type {ManualReservationClientEmailForm} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/reservation/manualReservationClientEmail.form.type.ts";
import {calendarDaysUntil} from "@coreModule/helpers/general/dateTime.ts";
import {useCompanyTimeZone} from "@coreModule/helpers/hooks/useCompanyTimeZone.ts";
import {MANUAL_CLIENT_EMAIL_ACTION_PREFIX} from "@propertyManagementModule/components/custom/reservations/manualReservationClientEmailDialog.tsx";

type ManualReservationClientEmailsProps = WithLanguageType & {
    reservation: Reservation;
    onAction: (action: string) => void;
};

/** Which emails fit the reservation; days count from the company's today (D116), as the server's expiry does. */
function manualEmailVisibility(r: Reservation, timeZone: string): Record<ManualReservationClientEmailForm["action"], boolean> {
    const deleted = r.deletedAt != null || r.deletedBy != null;
    const cancelled = r.isActive === false;
    const paid = r.paid === true;
    const base: Record<ManualReservationClientEmailForm["action"], boolean> = {
        remind_3d: false,
        remind_1d: false,
        remind_today: false,
        remind_remaining_days: false,
        send_expired: false,
        send_confirmation: false,
    };
    if (deleted || cancelled || paid) {
        return base;
    }
    const diff = calendarDaysUntil(r.expirationDate, timeZone);
    // Confirm only a reservation that still holds the unit, as the server requires (TD-B149).
    base.send_confirmation = r.status === "active" && (diff === null || diff >= 0);
    if (diff === null) {
        return base;
    }
    return {
        ...base,
        remind_3d: diff >= 3,
        remind_1d: diff >= 1,
        remind_today: diff === 0,
        send_expired: diff < 0,
        remind_remaining_days: diff >= 0,
    };
}

const ACTION_ORDER: ManualReservationClientEmailForm["action"][] = (process.env.NODE_ENV === "development" ?
    [
        "send_confirmation",
        "remind_3d",
        "remind_1d",
        "remind_today",
        "remind_remaining_days",
        "send_expired",
    ] :
    [
        "send_confirmation",
        "remind_remaining_days",
        "send_expired",
    ]);

function ManualReservationClientEmails({
    reservation,
    onAction,
    resolveLanguageKey,
}: ManualReservationClientEmailsProps) {
    const timeZone = useCompanyTimeZone();
    const vis = useMemo(() => manualEmailVisibility(reservation, timeZone), [reservation, timeZone]);
    const anyVisible = ACTION_ORDER.some((a) => vis[a]);
    if (!anyVisible) {
        return null;
    }

    return (
        <>
            <DropdownMenuSeparator />
            {ACTION_ORDER.map((action) =>
                vis[action] ? (
                    <DropdownMenuItem
                        key={action}
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onAction(`${MANUAL_CLIENT_EMAIL_ACTION_PREFIX}${action}`);
                        }}
                    >
                        <IconMail className="h-4 w-4" />
                        <span>{resolveLanguageKey(`actionLabels.${action}`)}</span>
                        <DropdownMenuShortcut className="opacity-0 w-0 p-0 m-0 border-0" aria-hidden />
                    </DropdownMenuItem>
                ) : null,
            )}
        </>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/reservations/center/actions/manualReservationClientEmails.tsx"),
    withDebug(true, true, "reservations"),
)(ManualReservationClientEmails);
