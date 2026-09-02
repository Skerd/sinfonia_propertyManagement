import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useEffect, useImperativeHandle, useRef, useState} from "react";
import {toast} from "sonner";
import {Input} from "@coreModule/components/ui/input.tsx";
import {Label} from "@coreModule/components/ui/label.tsx";
import {Textarea} from "@coreModule/components/ui/textarea.tsx";
import {DollarSign, LoaderCircle} from "lucide-react";
import FormMaxLengthControl from "@coreModule/components/custom/formMaxLengthControl.tsx";
import {RENTAL_PAYMENT_LONG_TEXT_MAX} from "armonia/src/modules/propertyManagement/api/realEstate/private/rentalPayment/rentalPayment.schema-def.ts";
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
import type {RentalPayment} from "armonia/src/modules/propertyManagement/api/realEstate/private/rentalPayment/rentalPayment.dto.ts";

type MarkPaidPayload = {
    _id: string;
    paidAmount: number;
    notes?: string;
};

type MarkRentalPaymentPaidDialogProps = WithLanguageType &
    WithAxiosType<RentalPayment, MarkPaidPayload> & {
        open: boolean;
        onClose: () => void;
        payment: RentalPayment;
        onSuccess?: (updated?: RentalPayment) => void;
    };

function moneyLabel(amount: number | undefined, symbol?: string): string {
    if (amount == null) return "—";
    const n = amount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
    return symbol ? `${n} ${symbol}` : n;
}

function MarkRentalPaymentPaidDialog({
    payment,
    open,
    onClose,
    resolveLanguageKey,
    innerRef,
    onFilterChange,
    data,
    onSuccess = () => {},
    loading,
}: MarkRentalPaymentPaidDialogProps) {
    const remaining = payment.remaining ?? 0;
    const defaultAmount = remaining > 0 ? remaining.toString() : "";
    const [paidAmount, setPaidAmount] = useState(defaultAmount);
    const [notes, setNotes] = useState("");
    const waitingForSuccessRef = useRef(false);
    const previousDataRef = useRef<RentalPayment | null>(null);

    useEffect(() => {
        if (open) {
            setPaidAmount(defaultAmount);
            setNotes("");
        }
    }, [open, defaultAmount]);

    useEffect(() => {
        if (waitingForSuccessRef.current && data && data !== previousDataRef.current) {
            previousDataRef.current = data;
            waitingForSuccessRef.current = false;
            onClose();
            onSuccess(data);
        }
    }, [data, onClose, onSuccess]);

    useImperativeHandle(innerRef, () => ({
        success: () => {
            toast.success(resolveLanguageKey("paymentRecorded"));
            waitingForSuccessRef.current = true;
        },
        error: () => {
            toast.error(resolveLanguageKey("paymentFailed"));
            waitingForSuccessRef.current = false;
        },
    }));

    const symbol = payment.currency?.symbol;
    const canSubmit = !!paidAmount && Number(paidAmount) > 0;

    return (
        <AlertDialog
            open={open}
            onOpenChange={(next) => {
                if (!next && !loading) onClose();
            }}
        >
            <AlertDialogContent
                className="flex max-h-[85vh] w-[calc(100%-2rem)] flex-col overflow-hidden data-[size=default]:max-w-xl data-[size=default]:sm:max-w-xl"
                onClick={(e) => e.stopPropagation()}
            >
                <AlertDialogHeader className="shrink-0">
                    <AlertDialogTitle>
                        {payment.name
                            ? `${resolveLanguageKey("dialogTitle")} — ${payment.name}`
                            : resolveLanguageKey("dialogTitle")}
                    </AlertDialogTitle>
                    <AlertDialogDescription>{resolveLanguageKey("dialogDescription")}</AlertDialogDescription>
                </AlertDialogHeader>
                <div className="flex min-h-0 flex-1 flex-col gap-y-3 overflow-y-auto py-2">
                    <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                        <dt className="text-muted-foreground">{resolveLanguageKey("dueAmount")}</dt>
                        <dd className="tabular-nums text-right">{moneyLabel(payment.amount, symbol)}</dd>
                        <dt className="text-muted-foreground">{resolveLanguageKey("lateFeeAmount")}</dt>
                        <dd className="tabular-nums text-right">{moneyLabel(payment.lateFeeAmount ?? 0, symbol)}</dd>
                        <dt className="text-muted-foreground">{resolveLanguageKey("alreadyPaid")}</dt>
                        <dd className="tabular-nums text-right">{moneyLabel(payment.paidAmount ?? 0, symbol)}</dd>
                        <dt className="font-medium">{resolveLanguageKey("remainingAmount")}</dt>
                        <dd className="tabular-nums text-right font-medium">{moneyLabel(remaining, symbol)}</dd>
                    </dl>
                    <div className="flex flex-col gap-y-2">
                        <Label htmlFor="paidAmount">{resolveLanguageKey("paidAmount")} *</Label>
                        <Input
                            id="paidAmount"
                            type="number"
                            step="0.01"
                            min="0.01"
                            value={paidAmount}
                            onChange={(e) => setPaidAmount(e.target.value)}
                            placeholder={defaultAmount}
                            disabled={loading}
                        />
                    </div>
                    <div className="flex min-h-0 flex-col gap-y-2">
                        <Label htmlFor="notes">{resolveLanguageKey("notes")}</Label>
                        <FormMaxLengthControl maxLength={RENTAL_PAYMENT_LONG_TEXT_MAX} value={notes}>
                            <Textarea
                                id="notes"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value.slice(0, RENTAL_PAYMENT_LONG_TEXT_MAX))}
                                placeholder={resolveLanguageKey("notesPlaceholder")}
                                disabled={loading}
                                maxLength={RENTAL_PAYMENT_LONG_TEXT_MAX}
                                className="field-sizing-fixed min-h-[120px] max-h-56 overflow-y-auto resize-none"
                            />
                        </FormMaxLengthControl>
                    </div>
                </div>
                <AlertDialogFooter className="shrink-0">
                    <AlertDialogCancel disabled={loading} onClick={(e) => e.stopPropagation()}>
                        {resolveLanguageKey("cancel")}
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            if (!canSubmit) return;
                            onFilterChange({
                                _id: payment._id,
                                paidAmount: Number(paidAmount),
                                notes: notes || undefined,
                            });
                        }}
                        disabled={loading || !canSubmit}
                    >
                        {loading ? (
                            <>
                                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                {resolveLanguageKey("processing")}
                            </>
                        ) : (
                            <>
                                <DollarSign className="mr-2 h-4 w-4" />
                                {resolveLanguageKey("confirmPay")}
                            </>
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/components/custom/rentalPayments/markRentalPaymentPaidDialog.tsx"),
    withAxios(
        {
            method: "POST",
            url: "/api/realEstate/rentalPayment/markPaid",
            data: {},
        },
        true,
    ),
    withDebug(true, true, "rentalpayments"),
)(MarkRentalPaymentPaidDialog);
