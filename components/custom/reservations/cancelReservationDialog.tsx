import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {compose} from "redux";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useEffect, useImperativeHandle, useState} from "react";
import {CancelReservationForm} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/reservation/cancelReservation.form.type.ts";
import {LoaderCircle, XCircle} from "lucide-react";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@coreModule/components/ui/alert-dialog.tsx";
import {Reservation} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/reservation/reservation.dto.ts";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import {Textarea} from "@coreModule/components/ui/textarea.tsx";
import {Label} from "@coreModule/components/ui/label.tsx";

type CancelReservationDialogProps = WithLanguageType & WithAxiosType<any, CancelReservationForm> & {
    open: boolean;
    onClose: () => void;
    reservation: Reservation;
    onSuccess?: (updated?: Reservation) => void;
};

function CancelReservationDialog({
    reservation,
    open,
    onClose,
    resolveLanguageKey,
    innerRef,
    onFilterChange,
    onSuccess = () => {},
    loading,
}: CancelReservationDialogProps) {
    const [cancellationReason, setCancellationReason] = useState("");

    const {write} = useAccess("reservations");
    const writeFields = (typeof write === "object" && write !== null ? write : {}) as Record<string, unknown>;
    const canWriteCancellationReason = writeFields.cancellationReason !== undefined;

    useImperativeHandle(innerRef, () => ({
        success: (data: Reservation) => {
            onSuccess?.(data);
            setCancellationReason("");
            onClose();
        },
    }));

    useEffect(() => {
        if (!open) setCancellationReason("");
    }, [open]);

    const handleCancel = () => {
        const payload: CancelReservationForm = {_id: reservation._id};
        if (canWriteCancellationReason) {
            payload.cancellationReason = cancellationReason.trim();
        }
        onFilterChange(payload);
    };

    const handleOpenChange = (next: boolean) => {
        if (!next && !loading) {
            setCancellationReason("");
            onClose();
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={handleOpenChange}>
            <AlertDialogContent className="max-w-md">
                <AlertDialogHeader>
                    <AlertDialogTitle>{resolveLanguageKey("cancelConfirmTitle")}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {resolveLanguageKey(
                            canWriteCancellationReason
                                ? "cancelConfirmDescription"
                                : "cancelConfirmDescriptionNoReason",
                        )}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                {canWriteCancellationReason && (
                    <div className="py-4">
                        <Label htmlFor="cancellationReason" className="mb-2">
                            {resolveLanguageKey("cancellationReasonLabel")} *
                        </Label>
                        <Textarea
                            id="cancellationReason"
                            value={cancellationReason}
                            onChange={(e) => setCancellationReason(e.target.value)}
                            placeholder={resolveLanguageKey("cancellationReasonPlaceholder")}
                            disabled={loading}
                            className="min-h-[100px]"
                        />
                    </div>
                )}
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={loading} onClick={() => setCancellationReason("")}>
                        {resolveLanguageKey("cancel")}
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleCancel();
                        }}
                        disabled={loading || (canWriteCancellationReason && !cancellationReason.trim())}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        {(loading) ? <LoaderCircle className="animate-spin"/> : <XCircle />}
                        <p>{resolveLanguageKey("confirmCancel")}</p>
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/components/custom/reservations/cancelReservationDialog.tsx"),
    withAxios(
        {
            method: "post",
            url: "/api/realEstate/unit/reservation/cancel",
            data: {},
        },
        true,
    ),
    withDebug(true, true),
)(CancelReservationDialog);
