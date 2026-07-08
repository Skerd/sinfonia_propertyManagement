import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {compose} from "redux";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useImperativeHandle} from "react";
import {SingleForm} from "armonia/src/modules/core/types/shared.types.ts";
import {LoaderCircle, CheckCircle2} from "lucide-react";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@coreModule/components/ui/alert-dialog.tsx";
import {Reservation} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/reservation/reservation.dto.ts";

type PaidInFullReservationDialogProps = WithLanguageType & WithAxiosType<any, SingleForm> & {
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
}: PaidInFullReservationDialogProps) {
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
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{resolveLanguageKey("paidConfirmTitle")}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {resolveLanguageKey("paidConfirmDescription")}
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
                            onFilterChange({_id: reservation._id});
                        }}
                        disabled={loading}
                    >
                        {(loading) ? <LoaderCircle className="animate-spin"/> : <CheckCircle2 />}
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
    withDebug(true, true),
)(PaidInFullReservationDialog);
