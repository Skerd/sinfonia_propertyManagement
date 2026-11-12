import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {compose} from "redux";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useEffect, useImperativeHandle, useState} from "react";
import {IconCircleCheck, IconLoader2} from "@tabler/icons-react";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@coreModule/components/ui/alert-dialog.tsx";
import {Label} from "@coreModule/components/ui/label.tsx";
import {Reservation} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/reservation/reservation.dto.ts";
import {payReservationFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/reservation/payReservation.form.validator.ts";
import type {PayReservationForm} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/reservation/payReservation.form.type.ts";
import {useCompanyTimeZone} from "@coreModule/helpers/hooks/useCompanyTimeZone.ts";
import {companyToday} from "@coreModule/helpers/general/dateTime.ts";
import {DateInput} from "@coreModule/components/custom/inputs/dateInput.tsx";

type PaidInFullReservationDialogProps = WithLanguageType & WithAxiosType<Reservation, PayReservationForm> & {
    open: boolean;
    onClose: () => void;
    reservation: Reservation;
    onSuccess?: (updated?: Reservation) => void;
};

function PaidInFullReservationDialog({
    reservation,
    open,
    onClose,
    resolveLanguageKey,
    innerRef,
    onFilterChange,
    onSuccess = () => {},
    loading,
    languageCode,
}: PaidInFullReservationDialogProps) {
    // The paid day is a company day (D115), defaulting to the company's today; "not in the future" is judged in the
    // company's zone (D116), as on the server.
    const timeZone = useCompanyTimeZone();
    const [paidDate, setPaidDate] = useState(() => companyToday(timeZone));
    const [dateError, setDateError] = useState<string | null>(null);

    useEffect(() => {
        if (open) {
            setPaidDate(companyToday(timeZone));
            setDateError(null);
        }
    }, [open, timeZone]);

    useImperativeHandle(innerRef, () => ({
        success: (data: Reservation) => {
            onSuccess?.(data);
            onClose();
        },
    }));

    const handleOpenChange = (next: boolean) => {
        if (!next && !loading) onClose();
    };

    return (
        <AlertDialog open={open} onOpenChange={handleOpenChange}>
            <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                <AlertDialogHeader>
                    <AlertDialogTitle>{resolveLanguageKey("paidConfirmTitle")}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {resolveLanguageKey("paidConfirmDescription")}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="flex flex-col gap-y-2 py-2">
                    <Label htmlFor="reservationPaidDate">{resolveLanguageKey("paidDate")}</Label>
                    {/* The core picker, never the browser's (UX-08), between the reservation day and today. */}
                    <DateInput
                        id="reservationPaidDate"
                        valueFormat="YYYY-MM-DD"
                        value={paidDate}
                        minDate={reservation.reservationDate}
                        maxDate={companyToday(timeZone)}
                        onChange={(value) => {
                            setPaidDate(value);
                            setDateError(null);
                        }}
                        disabled={loading}
                        aria-invalid={dateError != null}
                        aria-describedby={dateError ? "reservationPaidDateError" : "reservationPaidDateHelp"}
                    />
                    {dateError
                        ? <p id="reservationPaidDateError" className="text-sm text-destructive">{dateError}</p>
                        : <p id="reservationPaidDateHelp" className="text-sm text-muted-foreground">{resolveLanguageKey("paidDateHelp")}</p>}
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={loading}>
                        {resolveLanguageKey("cancel")}
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            // A cleared day is not sent: the server then records the company's today.
                            const form: PayReservationForm = paidDate.trim() === ""
                                ? {_id: reservation._id}
                                : {_id: reservation._id, paidDate};
                            const parsed = payReservationFormSchema(
                                languageCode,
                                {paidDateLabel: String(resolveLanguageKey("paidDate"))},
                                undefined,
                                undefined,
                                {timeZone},
                            ).safeParse(form);
                            if (!parsed.success) {
                                setDateError(parsed.error.issues[0]?.message ?? null);
                                return;
                            }
                            // Same rule as the server (TD-B183): money is not received before the unit is reserved.
                            if (form.paidDate && form.paidDate < reservation.reservationDate) {
                                setDateError(String(resolveLanguageKey("paidDateBeforeReservation")));
                                return;
                            }
                            onFilterChange(form);
                        }}
                        disabled={loading}
                    >
                        {(loading) ? <IconLoader2 className="animate-spin"/> : <IconCircleCheck />}
                        <p>{resolveLanguageKey("confirmPaid")}</p>
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/components/custom/reservations/paidInFullReservationDialog.tsx"),
    withAxios(
        {
            method: "post",
            url: "/api/realEstate/unit/reservation/pay",
            data: {},
        },
        true,
    ),
    withDebug(true, true, "reservations"),
)(PaidInFullReservationDialog);
