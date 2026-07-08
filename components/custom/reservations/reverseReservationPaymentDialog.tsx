import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {compose} from "redux";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useImperativeHandle} from "react";
import {SingleForm} from "armonia/src/modules/core/types/shared.types.ts";
import {LoaderCircle, Undo2} from "lucide-react";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@coreModule/components/ui/alert-dialog.tsx";
import {Reservation} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/reservation/reservation.dto.ts";

type ReverseReservationPaymentDialogProps = WithLanguageType & WithAxiosType<any, SingleForm> & {
    open: boolean;
    onClose: () => void;
    reservation: Reservation;
    onSuccess?: (updated?: Reservation) => void;
};

function ReverseReservationPaymentDialog({
    reservation,
    open,
    onClose,
    resolveLanguageKey,
    innerRef,
    onFilterChange,
    onSuccess = () => {},
    loading,
}: ReverseReservationPaymentDialogProps) {
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
                    <AlertDialogTitle>{resolveLanguageKey("reverseConfirmTitle")}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {resolveLanguageKey("reverseConfirmDescription")}
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
                        {(loading) ? <LoaderCircle className="animate-spin"/> : <Undo2 />}
                        <p>{resolveLanguageKey("confirmReverse")}</p>
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/components/custom/reservations/reverseReservationPaymentDialog.tsx"),
    withAxios(
        {
            method: "post",
            url: "/api/realEstate/unit/reservation/reversePayment",
            data: {},
        },
        true,
    ),
    withDebug(true, true),
)(ReverseReservationPaymentDialog);
