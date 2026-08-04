import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import {useViewConfig} from "@coreModule/helpers/hooks/useViewConfig.ts";
import SheetViewRenderer from "@coreModule/components/viewEngine/SheetViewRenderer.tsx";
import {useEffect, useState} from "react";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import type {PaymentPlan} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/paymentPlan/paymentPlan.dto.ts";
import {format} from "date-fns";
import {Badge} from "@coreModule/components/ui/badge.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import SalePayInstallmentAction from "@propertyManagementModule/clients/panel/private/sales/center/actions/salePayInstallmentAction.tsx";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@coreModule/components/ui/table/table.tsx";
import {Button} from "@coreModule/components/ui/button.tsx";
import {DropdownMenu, DropdownMenuContent, DropdownMenuTrigger} from "@coreModule/components/ui/dropdown-menu.tsx";
import {MoreHorizontal} from "lucide-react";
import ManualInstallmentClientEmails, {
    installmentHasVisibleManualEmailActions,
} from "@propertyManagementModule/clients/panel/private/sales/center/actions/manualInstallmentClientEmails.tsx";
import SalePayDownPaymentAction from "@propertyManagementModule/clients/panel/private/sales/center/actions/salePayDownPaymentAction.tsx";
import SalePayDownPaymentDialog from "@propertyManagementModule/components/custom/sale/salePayDownPaymentDialog.tsx";
import SalePayInstallmentDialog from "@propertyManagementModule/components/custom/sale/salePayInstallmentDialog.tsx";

export function buildPaymentPlanEditPath(paymentPlan: PaymentPlan): string {
    const params = new URLSearchParams();
    params.set("paymentPlanId", paymentPlan._id);
    return `/realEstate/paymentPlans/edit?${params.toString()}`;
}

type PaymentPlanSheetViewOwnProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    /** Full row from list/card, or bootstrap from SmallInfoCard while `/single` loads. */
    paymentPlan?: PaymentPlan;
    hideActions?: boolean;
    onDelete?: (paymentPlan: PaymentPlan, response?: DeletedData) => void;
    onRestore?: () => void;
    fetchId?: string;
};

function formatMoney(value: number | undefined): string {
    if (value == null) return "-";
    return value.toLocaleString("en-US", {minimumFractionDigits: 0, maximumFractionDigits: 2});
}

function getInstallmentStatusStyles(status?: string): {bg: string; text: string; border: string} {
    const lowered = status?.toLowerCase() ?? "";
    if (lowered === "paid") {
        return {bg: "bg-success/10", text: "text-success", border: "border-success/30"};
    }
    if (lowered === "overdue" || lowered === "cancelled") {
        return {bg: "bg-destructive/10", text: "text-destructive", border: "border-destructive/30"};
    }
    if (lowered === "partially_paid") {
        return {bg: "bg-warning/10", text: "text-warning", border: "border-warning/30"};
    }
    return {bg: "bg-muted/50", text: "text-muted-foreground", border: "border-muted"};
}

function resolveStateLabel(
    resolveLanguageKey: (key: string) => string,
    category: string,
    rawValue?: string
): string {
    if (!rawValue) return "-";
    const key = `${category}.${rawValue}`;
    const resolved = resolveLanguageKey(key);
    return resolved === `---${key}---` ? rawValue : resolved;
}

function isInstallmentPaid(installment: PaymentPlan["installments"][number]): boolean {
    const status = installment.status?.toLowerCase();
    if (status === "paid") return true;
    return (installment.paidAmount ?? 0) >= (installment.amount ?? 0) && (installment.amount ?? 0) > 0;
}

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
    const saleAccess = useAccess("sales");
    const saleReadFields =
        typeof saleAccess.read === "object" && saleAccess.read !== null
            ? (saleAccess.read as Record<string, unknown>)
            : {};
    const canReadSaleBuyer = saleReadFields.buyer !== undefined;
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

    const editPath = paymentPlan._id ? buildPaymentPlanEditPath(paymentPlan) : "";

    if (!viewConfig) return null;
    if (!entityId) return null;

    return (
        <>
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
                access={access}
                hideActions={hideActions}
                onDelete={onDelete}
                onRestore={onRestore}
                editPath={editPath}
                deleteRestoreConfirmLabel={paymentPlan.name}
                actionMenuChildren={
                    !!access.read?.downPaymentPaid && !paymentPlan.downPaymentPaid ? (
                        <SalePayDownPaymentAction
                            isPaid={!!paymentPlan.downPaymentPaid}
                            onAction={(action: string) => setLocalAction(action)}
                        />
                    ) : undefined
                }
            >
                {!!access.read?.installments && (
                    <div className="flex flex-col gap-y-2">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold">{resolveLanguageKey("installments")}</p>
                            <p className="text-xs text-muted-foreground">
                                {resolveLanguageKey("totalInstallments")} {paymentPlan.installments?.length ?? 0}
                            </p>
                        </div>

                        {paymentPlan.installments?.length ? (
                            <div className="rounded-lg border border-border/50 bg-muted/20 p-2">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>{resolveLanguageKey("installment")}</TableHead>
                                            <TableHead>{resolveLanguageKey("dueDate")}</TableHead>
                                            <TableHead>{resolveLanguageKey("amount")}</TableHead>
                                            <TableHead>{resolveLanguageKey("paidAmount")}</TableHead>
                                            <TableHead>{resolveLanguageKey("remainingAmount")}</TableHead>
                                            <TableHead>{resolveLanguageKey("status")}</TableHead>
                                            <TableHead className="text-right">{resolveLanguageKey("actions")}</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {paymentPlan.installments.map((installment) => {
                                            const paid = isInstallmentPaid(installment);
                                            const showPayAction = !paid && !!access.write;
                                            const showInstallmentEmails =
                                                canReadSaleBuyer && installmentHasVisibleManualEmailActions(installment);
                                            const showRowActionsMenu = showPayAction || showInstallmentEmails;
                                            const statusStyles = getInstallmentStatusStyles(installment.status);
                                            const paidAmount = installment.paidAmount ?? 0;
                                            const dueAmount = installment.amount ?? 0;
                                            const remaining = Math.max(0, dueAmount - paidAmount);
                                            return (
                                                <TableRow key={installment.installmentNumber}>
                                                    <TableCell className="font-medium">
                                                        #{installment.installmentNumber}
                                                    </TableCell>
                                                    <TableCell>
                                                        {installment.dueDate ? format(new Date(installment.dueDate), "PP") : "-"}
                                                    </TableCell>
                                                    <TableCell>{formatMoney(dueAmount)}</TableCell>
                                                    <TableCell>{formatMoney(paidAmount)}</TableCell>
                                                    <TableCell>{formatMoney(remaining)}</TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant="outline"
                                                            className={cn(
                                                                "text-2xs font-medium",
                                                                statusStyles.bg,
                                                                statusStyles.text,
                                                                statusStyles.border,
                                                            )}
                                                        >
                                                            {resolveStateLabel(
                                                                resolveLanguageKey,
                                                                "installmentStatusState",
                                                                installment.status ?? "pending",
                                                            )}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        {!paid && showRowActionsMenu && (
                                                            <div
                                                                className="inline-flex justify-end"
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                <DropdownMenu>
                                                                    <DropdownMenuTrigger asChild>
                                                                        <Button variant="ghost" size="icon-sm" className="size-8">
                                                                            <MoreHorizontal className="size-4" />
                                                                        </Button>
                                                                    </DropdownMenuTrigger>
                                                                    <DropdownMenuContent align="end" className="w-fit">
                                                                        <SalePayInstallmentAction
                                                                            installment={installment}
                                                                            onAction={(action: string) => {
                                                                                setSelectedInstallment(installment);
                                                                                setLocalAction(action);
                                                                            }}
                                                                        />
                                                                        <ManualInstallmentClientEmails
                                                                            saleId={paymentPlan.sale?._id ?? ""}
                                                                            installment={installment}
                                                                        />
                                                                    </DropdownMenuContent>
                                                                </DropdownMenu>
                                                            </div>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <div className="rounded-lg border border-border/50 bg-muted/20 p-3 text-xs text-muted-foreground">
                                {resolveLanguageKey("noInstallments")}
                            </div>
                        )}
                    </div>
                )}
            </SheetViewRenderer>
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
        </>
    );
}

const ComposedPaymentPlanSheetView = compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/sales/center/sheetView/paymentPlanSheetView.tsx"),
    withDebug(true, true),
)(PaymentPlanSheetView);

export default ComposedPaymentPlanSheetView;
