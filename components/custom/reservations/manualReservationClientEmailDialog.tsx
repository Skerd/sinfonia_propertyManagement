import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {compose} from "redux";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useImperativeHandle} from "react";
import {LoaderCircle} from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@coreModule/components/ui/alert-dialog.tsx";
import {Reservation} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/reservation/reservation.dto.ts";
import type {ManualReservationClientEmailForm} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/reservation/manualReservationClientEmail.form.type.ts";

export const MANUAL_CLIENT_EMAIL_ACTION_PREFIX = "manualClientEmail:";

export function parseManualClientEmailAction(action: string): ManualReservationClientEmailForm["action"] | null {
    if (!action.startsWith(MANUAL_CLIENT_EMAIL_ACTION_PREFIX)) return null;
    return action.slice(MANUAL_CLIENT_EMAIL_ACTION_PREFIX.length) as ManualReservationClientEmailForm["action"];
}

type ManualReservationClientEmailDialogProps = WithLanguageType &
    WithAxiosType<{ ok: true }, ManualReservationClientEmailForm> & {
        open: boolean;
        onClose: () => void;
        reservation: Reservation;
        pendingAction: ManualReservationClientEmailForm["action"];
        onSuccess?: () => void;
    };

function ManualReservationClientEmailDialog({
    reservation,
    open,
    onClose,
    pendingAction,
    resolveLanguageKey,
    innerRef,
    onFilterChange,
    onSuccess = () => {},
    loading,
}: ManualReservationClientEmailDialogProps) {
    useImperativeHandle(innerRef, () => ({
        success: () => {
            onSuccess?.();
            onClose();
        },
    }));

    const handleOpenChange = (next: boolean) => {
        if (!next && !loading) onClose();
    };

    const pendingConfirmKey = `confirmDescriptions.${pendingAction}`;

    return (
        <AlertDialog open={open} onOpenChange={handleOpenChange}>
            <AlertDialogContent className="max-w-md" onClick={(e) => e.stopPropagation()}>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        {resolveLanguageKey(`confirmTitles.${pendingAction}`)}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        {resolveLanguageKey(pendingConfirmKey)}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={loading}>
                        {resolveLanguageKey("cancel")}
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onFilterChange({_id: reservation._id, action: pendingAction});
                        }}
                        disabled={loading}
                    >
                        {loading ? <LoaderCircle className="animate-spin h-4 w-4" /> : null}
                        {resolveLanguageKey("confirmSend")}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/components/custom/reservations/manualReservationClientEmailDialog.tsx"),
    withAxios(
        {
            method: "post",
            url: "/api/realEstate/unit/reservation/manualClientEmail",
            data: {},
        },
        true,
    ),
    withDebug(true, true),
)(ManualReservationClientEmailDialog);
