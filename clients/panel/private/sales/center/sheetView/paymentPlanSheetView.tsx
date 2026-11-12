import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hooks/useAccess.ts";
import {useViewConfig} from "@coreModule/helpers/hooks/useViewConfig.ts";
import SheetViewRenderer from "@coreModule/components/viewEngine/SheetViewRenderer.tsx";
import SheetNameTitle from "@coreModule/components/entityPage/sheet/sheetNameTitle.tsx";
import StatusBadge from "@coreModule/components/entityPage/sheet/statusBadge.tsx";
import {useEffect, useState} from "react";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import type {PaymentPlan} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/paymentPlan/paymentPlan.dto.ts";
import SalePayDownPaymentAction from "@propertyManagementModule/clients/panel/private/sales/center/actions/salePayDownPaymentAction.tsx";
import SalePayDownPaymentDialog from "@propertyManagementModule/components/custom/sale/salePayDownPaymentDialog.tsx";
import SalePayInstallmentDialog from "@propertyManagementModule/components/custom/sale/salePayInstallmentDialog.tsx";
import {saleBuyerName} from "@propertyManagementModule/clients/panel/private/sales/center/sheetView/saleSheetView.tsx";
import {planTakesPayments} from "@propertyManagementModule/clients/panel/private/sales/center/sheetView/paymentPlanInstallments.tsx";
import {PaymentPlanPayInstallment} from "@propertyManagementModule/clients/panel/private/sales/center/sheetView/paymentPlanPayInstallment.ts";

type PaymentPlanSheetViewOwnProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    /** Full row from list/card, or bootstrap from DisplayCard while `/single` loads. */
    paymentPlan?: PaymentPlan;
    hideActions?: boolean;
    onDelete?: (paymentPlan: PaymentPlan, response?: DeletedData) => void;
    onRestore?: () => void;
    fetchId?: string;
};

function PaymentPlanSheetView({
    open,
    onOpenChange,
    paymentPlan: paymentPlanProp,
    hideActions = false,
    onDelete,
    onRestore,
    resolveLanguageKey,
    fetchId,
}: PaymentPlanSheetViewOwnProps & WithLanguageType) {
    const access = useAccess("paymentPlans");
    const viewConfig = useViewConfig("paymentplans", "sheet");
    const [sheetData, setSheetData] = useState<Record<string, any>>(paymentPlanProp || {_id: fetchId});
    const [localAction, setLocalAction] = useState("");
    const [selectedInstallment, setSelectedInstallment] = useState<PaymentPlan["installments"][number] | null>(null);

    useEffect(() => {
        if (!paymentPlanProp) return;
        setSheetData(paymentPlanProp);
    }, [paymentPlanProp]);

    const entityId = paymentPlanProp?._id ?? fetchId;
    const paymentPlan = sheetData as PaymentPlan;

    if (!viewConfig) return null;
    if (!entityId) return null;

    return (
        <PaymentPlanPayInstallment.Provider
            value={(installment) => {
                setSelectedInstallment(installment);
                setLocalAction("payInstallment");
            }}
        >
            <SheetViewRenderer
                config={viewConfig}
                url="/api/realEstate/unit/sale/paymentPlan/single"
                fetchId={fetchId}
                onDataFetched={(data) => {
                    setSheetData(data);
                }}
                data={sheetData}
                open={open}
                onOpenChange={onOpenChange}
                resolveLanguageKey={resolveLanguageKey}
                // Named by the buyer of its sale, the code as a badge and the state in tone (UX-01, UX-02, D151).
                headerTitle={<SheetNameTitle name={saleBuyerName(paymentPlan.sale)} code={paymentPlan.name} typeLabel={String(resolveLanguageKey("paymentPlan"))} />}
                headerDescription={
                    <StatusBadge
                        tableConfigKey="paymentplans"
                        field="status"
                        value={paymentPlan.status}
                        label={String(resolveLanguageKey(`paymentPlanStatusState.${paymentPlan.status}`))}
                    />
                }
                access={access}
                hideActions={hideActions}
                onDelete={onDelete}
                onRestore={onRestore}
                editPath=""
                hideEdit
                deleteRestoreConfirmLabel={paymentPlan.name}
                actionMenuChildren={
                    !!access.read?.downPaymentPaid && !paymentPlan.downPaymentPaid && planTakesPayments(paymentPlan.status) ? (
                        <SalePayDownPaymentAction
                            isPaid={!!paymentPlan.downPaymentPaid}
                            onAction={(action: string) => setLocalAction(action)}
                        />
                    ) : undefined
                }
            />
            {localAction === "payDownPayment" && (
                <SalePayDownPaymentDialog
                    open
                    onOpenChange={(dialogOpen: boolean) => {
                        if (!dialogOpen) setLocalAction("");
                    }}
                    paymentPlanId={paymentPlan._id}
                    onSuccess={(updatedPaymentPlan: PaymentPlan) => {
                        setSheetData(updatedPaymentPlan);
                        setLocalAction("");
                    }}
                />
            )}
            {localAction === "payInstallment" && (
                <SalePayInstallmentDialog
                    open
                    onOpenChange={(dialogOpen: boolean) => {
                        if (!dialogOpen) {
                            setLocalAction("");
                            setSelectedInstallment(null);
                        }
                    }}
                    paymentPlanId={paymentPlan._id}
                    installment={selectedInstallment}
                    onSuccess={(updatedPaymentPlan: PaymentPlan) => {
                        setSheetData(updatedPaymentPlan);
                        setLocalAction("");
                        setSelectedInstallment(null);
                    }}
                />
            )}
        </PaymentPlanPayInstallment.Provider>
    );
}

const ComposedPaymentPlanSheetView = compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/sales/center/sheetView/paymentPlanSheetView.tsx"),
    withDebug(true, true, ["paymentPlans", "sales"]),
)(PaymentPlanSheetView);

export default ComposedPaymentPlanSheetView;
