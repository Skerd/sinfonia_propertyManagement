import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {compose} from "redux";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useImperativeHandle} from "react";
import {CircleCheck, LoaderCircle} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@coreModule/components/ui/dialog.tsx";
import {Button} from "@coreModule/components/ui/button.tsx";
import type {RentalPayment} from "armonia/src/modules/propertyManagement/api/realEstate/private/rentalPayment/rentalPayment.dto.ts";

type MarkPaidPayload = {_id: string};

type MarkRentalPaymentPaidDialogProps = WithLanguageType &
    WithAxiosType<RentalPayment, MarkPaidPayload> & {
        open: boolean;
        onClose: () => void;
        payment: RentalPayment;
        onSuccess?: (updated?: RentalPayment) => void;
    };

function MarkRentalPaymentPaidDialog({
    payment,
    open,
    onClose,
    resolveLanguageKey,
    innerRef,
    onFilterChange,
    onSuccess = () => {},
    loading,
}: MarkRentalPaymentPaidDialogProps) {
    useImperativeHandle(innerRef, () => ({
        success: (data?: RentalPayment) => {
            onClose();
            onSuccess?.(data);
        },
    }));

    const handleOpenChange = (next: boolean) => {
        if (!next && !loading) onClose();
    };

    const amountLabel = payment.currency?.symbol
        ? `${payment.amount} ${payment.currency.symbol}`
        : String(payment.amount);

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-md" onClick={(e) => e.stopPropagation()}>
                <DialogHeader>
                    <DialogTitle>
                        {payment.name
                            ? `${resolveLanguageKey("dialogTitle")} — ${payment.name}`
                            : resolveLanguageKey("dialogTitle")}
                    </DialogTitle>
                    <DialogDescription>
                        {resolveLanguageKey("dialogDescription").replace("{amount}", amountLabel)}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={loading}>
                        {resolveLanguageKey("cancel")}
                    </Button>
                    <Button type="button" onClick={() => onFilterChange({_id: payment._id})} disabled={loading}>
                        {loading ? <LoaderCircle className="animate-spin h-4 w-4" /> : <CircleCheck className="h-4 w-4" />}
                        {resolveLanguageKey("submit")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/components/custom/rentalPayments/markRentalPaymentPaidDialog.tsx"),
    withAxios(
        {
            method: "POST",
            url:    "/api/realEstate/rentalPayment/markPaid",
            data:   {},
        },
        true,
    ),
    withDebug(true, true),
)(MarkRentalPaymentPaidDialog);
