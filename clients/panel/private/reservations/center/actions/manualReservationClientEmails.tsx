import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {compose} from "redux";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useMemo} from "react";
import {DropdownMenuItem, DropdownMenuSeparator, DropdownMenuShortcut} from "@coreModule/components/ui/dropdown-menu.tsx";
import {Mail} from "lucide-react";
import {Reservation} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/reservation/reservation.dto.ts";
import type {ManualReservationClientEmailForm} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/reservation/manualReservationClientEmail.form.type.ts";
import {MANUAL_CLIENT_EMAIL_ACTION_PREFIX} from "@propertyManagementModule/components/custom/reservations/manualReservationClientEmailDialog.tsx";

type ManualReservationClientEmailsProps = WithLanguageType & {
    reservation: Reservation;
    onAction: (action: string) => void;
};

function utcCalendarDaysUntilExpirationDay(iso: string): number {
    const exp = new Date(iso);
    const expStart = Date.UTC(exp.getUTCFullYear(), exp.getUTCMonth(), exp.getUTCDate());
    const n = new Date();
    const todayStart = Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate());
    return Math.round((expStart - todayStart) / 86400000);
}

function isPastExpirationUtcEndOfDay(iso: string): boolean {
    const exp = new Date(iso);
    const end = Date.UTC(exp.getUTCFullYear(), exp.getUTCMonth(), exp.getUTCDate(), 23, 59, 59, 999);
    return Date.now() > end;
}

function manualEmailVisibility(r: Reservation): Record<ManualReservationClientEmailForm["action"], boolean> {
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
    base.send_confirmation = true;
    if (!r.expirationDate) {
        return base;
    }
    const diff = utcCalendarDaysUntilExpirationDay(r.expirationDate);
    const pastEnd = isPastExpirationUtcEndOfDay(r.expirationDate);
    return {
        ...base,
        remind_3d: diff >= 3,
        remind_1d: diff >= 1,
        remind_today: diff === 0 && !pastEnd,
        send_expired: pastEnd,
        remind_remaining_days: !pastEnd && diff >= 0,
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
    const vis = useMemo(() => manualEmailVisibility(reservation), [reservation]);
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
                        <Mail className="h-4 w-4" />
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
    withDebug(true, true),
)(ManualReservationClientEmails);
