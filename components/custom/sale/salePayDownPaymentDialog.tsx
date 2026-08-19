import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useEffect, useImperativeHandle, useRef} from "react";
import type {PaymentPlan as PaymentPlanData} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/paymentPlan/paymentPlan.dto.ts";
import {SingleForm} from "armonia/src/modules/core/types/shared.types.ts";
import {LoaderCircle, Wallet} from "lucide-react";
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

type SalePayDownPaymentDialogProps = WithLanguageType & WithAxiosType<PaymentPlanData, SingleForm> & {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    paymentPlanId: string;
    onSuccess?: (updatedPaymentPlan: PaymentPlanData) => void;
};

function SalePayDownPaymentDialog({
    open,
    onOpenChange,
    paymentPlanId,
    resolveLanguageKey,
    loading,
    innerRef,
    onFilterChange,
    data,
    onSuccess = () => {},
}: SalePayDownPaymentDialogProps) {
    const waitingForSuccessRef = useRef(false);
    const previousDataRef = useRef<PaymentPlanData | null>(null);

    useEffect(() => {
        if (waitingForSuccessRef.current && data && data !== previousDataRef.current) {
            previousDataRef.current = data;
            waitingForSuccessRef.current = false;
            onOpenChange(false);
            onSuccess(data);
        }
    }, [data, onOpenChange, onSuccess]);

    useImperativeHandle(innerRef, () => ({
        start: () => {
            waitingForSuccessRef.current = true;
        },
        success: () => {
            waitingForSuccessRef.current = true;
        },
        error: () => {
            waitingForSuccessRef.current = false;
        },
    }));

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="max-w-md" onClick={(e) => e.stopPropagation()}>
                <AlertDialogHeader>
                    <AlertDialogTitle>{resolveLanguageKey("payDownPaymentTitle")}</AlertDialogTitle>
                    <AlertDialogDescription>{resolveLanguageKey("payDownPaymentDescription")}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={loading} onClick={(e) => e.stopPropagation()}>
                        {resolveLanguageKey("cancel")}
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            onFilterChange({_id: paymentPlanId});
                        }}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                {resolveLanguageKey("processing")}
                            </>
                        ) : (
                            <>
                                <Wallet className="mr-2 h-4 w-4" />
                                {resolveLanguageKey("confirmPayDownPayment")}
                            </>
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/components/custom/sale/salePayDownPaymentDialog.tsx"),
    withAxios(
        {
            url: "/api/realEstate/unit/sale/payDownPayment",
            method: "post",
            data: {},
        },
        true,
    ),
    withDebug(true, true, ["paymentPlans", "sales"]),
)(SalePayDownPaymentDialog);
