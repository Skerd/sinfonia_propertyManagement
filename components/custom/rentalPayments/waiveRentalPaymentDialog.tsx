import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {compose} from "redux";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useImperativeHandle, useState} from "react";
import {LoaderCircle} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@coreModule/components/ui/dialog.tsx";
import {Button} from "@coreModule/components/ui/button.tsx";
import {Label} from "@coreModule/components/ui/label.tsx";
import {Textarea} from "@coreModule/components/ui/textarea.tsx";
import FormMaxLengthControl from "@coreModule/components/custom/formMaxLengthControl.tsx";
import type {RentalPayment} from "armonia/src/modules/propertyManagement/api/realEstate/private/rentalPayment/rentalPayment.dto.ts";
import {RENTAL_PAYMENT_LONG_TEXT_MAX} from "armonia/src/modules/propertyManagement/api/realEstate/private/rentalPayment/rentalPayment.schema-def.ts";

type WaivePayload = {_id: string; notes?: string};

type WaiveRentalPaymentDialogProps = WithLanguageType &
    WithAxiosType<RentalPayment, WaivePayload> & {
        open: boolean;
        onClose: () => void;
        payment: RentalPayment;
        onSuccess?: (updated?: RentalPayment) => void;
    };

function WaiveRentalPaymentDialog({
    payment,
    open,
    onClose,
    resolveLanguageKey,
    innerRef,
    onFilterChange,
    onSuccess = () => {},
    loading,
}: WaiveRentalPaymentDialogProps) {
    const [notes, setNotes] = useState("");

    useImperativeHandle(innerRef, () => ({
        success: (data?: RentalPayment) => {
            onClose();
            onSuccess?.(data);
        },
    }));

    const handleOpenChange = (next: boolean) => {
        if (!next && !loading) onClose();
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-md" onClick={(e) => e.stopPropagation()}>
                <DialogHeader>
                    <DialogTitle>
                        {payment.name
                            ? `${resolveLanguageKey("dialogTitle")} — ${payment.name}`
                            : resolveLanguageKey("dialogTitle")}
                    </DialogTitle>
                    <DialogDescription>{resolveLanguageKey("dialogDescription")}</DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-y-2">
                    <Label htmlFor="waiveNotes">{resolveLanguageKey("notes")}</Label>
                    <FormMaxLengthControl maxLength={RENTAL_PAYMENT_LONG_TEXT_MAX} value={notes}>
                        <Textarea
                            id="waiveNotes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value.slice(0, RENTAL_PAYMENT_LONG_TEXT_MAX))}
                            placeholder={resolveLanguageKey("notesPlaceholder")}
                            disabled={loading}
                            maxLength={RENTAL_PAYMENT_LONG_TEXT_MAX}
                            className="field-sizing-fixed min-h-[100px] max-h-56 overflow-y-auto resize-none"
                        />
                    </FormMaxLengthControl>
                </div>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={loading}>
                        {resolveLanguageKey("cancel")}
                    </Button>
                    <Button
                        type="button"
                        onClick={() => onFilterChange({_id: payment._id, notes: notes || undefined})}
                        disabled={loading}
                    >
                        {loading ? <LoaderCircle className="animate-spin h-4 w-4" /> : null}
                        {resolveLanguageKey("submit")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/components/custom/rentalPayments/waiveRentalPaymentDialog.tsx"),
    withAxios(
        {
            method: "POST",
            url: "/api/realEstate/rentalPayment/waive",
            data: {},
        },
        true,
    ),
    withDebug(true, true, "rentalpayments"),
)(WaiveRentalPaymentDialog);
