import {useContext} from "react";
import {IconDots} from "@tabler/icons-react";
import type {ResolveLanguageKey} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {useAccess} from "@coreModule/helpers/hooks/useAccess.ts";
import {useCompanyTimeZone} from "@coreModule/helpers/hooks/useCompanyTimeZone.ts";
import {DATE_FORMATS, formatDate} from "@coreModule/helpers/general/dateTime.ts";
import {formatNumber} from "@coreModule/helpers/general/numbers.ts";
import StatusBadge from "@coreModule/components/entityPage/sheet/statusBadge.tsx";
import {Button} from "@coreModule/components/ui/button.tsx";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@coreModule/components/ui/table/table.tsx";
import {DropdownMenu, DropdownMenuContent, DropdownMenuTrigger} from "@coreModule/components/ui/dropdown-menu.tsx";
import {DEFAULT_DECIMAL_PLACES, subtractMoney} from "armonia/src/modules/core/helpers/money.ts";
import type {PaymentPlan} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/paymentPlan/paymentPlan.dto.ts";
import SalePayInstallmentAction from "@propertyManagementModule/clients/panel/private/sales/center/actions/salePayInstallmentAction.tsx";
import ManualInstallmentClientEmails, {
    installmentHasVisibleManualEmailActions,
} from "@propertyManagementModule/clients/panel/private/sales/center/actions/manualInstallmentClientEmails.tsx";
import {PaymentPlanPayInstallment} from "@propertyManagementModule/clients/panel/private/sales/center/sheetView/paymentPlanPayInstallment.ts";

type Installment = PaymentPlan["installments"][number];

function resolveStateLabel(resolveLanguageKey: ResolveLanguageKey, category: string, rawValue?: string): string {
    if (!rawValue) return "-";
    const key = `${category}.${rawValue}`;
    const resolved = resolveLanguageKey(key);
    return resolved === `---${key}---` ? rawValue : resolved;
}

/** The server takes payments only on a plan still running: active, or defaulted with installments to catch up on. */
export function planTakesPayments(status: string | undefined): boolean {
    return status === "active" || status === "defaulted";
}

function isInstallmentPaid(installment: Installment): boolean {
    const status = installment.status?.toLowerCase();
    if (status === "paid") return true;
    return (installment.paidAmount ?? 0) >= (installment.amount ?? 0) && (installment.amount ?? 0) > 0;
}

type Props = {
    plan: PaymentPlan;
    /** The payment plan sheet's dictionary, which holds the schedule's labels. */
    resolveLanguageKey: ResolveLanguageKey;
};

/** The installment schedule with its pay and client email actions, placed by the sheet view above Lifecycle (UX-03). */
export default function PaymentPlanInstallments({plan, resolveLanguageKey}: Props) {
    const access = useAccess("paymentPlans");
    const saleAccess = useAccess("sales");
    const timeZone = useCompanyTimeZone();
    const payInstallment = useContext(PaymentPlanPayInstallment);
    const canReadSaleBuyer =
        typeof saleAccess.read === "object" && saleAccess.read !== null && (saleAccess.read as Record<string, unknown>).buyer !== undefined;
    const symbol = plan.saleCurrency?.symbol ?? "";
    const decimals = plan.saleCurrency?.decimalPlaces ?? DEFAULT_DECIMAL_PLACES;
    // Every amount carries its currency (UX-07).
    const money = (value: number) => [symbol, formatNumber(value, {maximumFractionDigits: decimals}) || "-"].filter(Boolean).join(" ");
    const installments = plan.installments;

    return (
        <div className="flex flex-col gap-y-2">
            <p className="text-xs text-muted-foreground">
                {resolveLanguageKey("totalInstallments")} {installments.length}
            </p>
            {installments.length ? (
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
                            {installments.map((installment) => {
                                const paid = isInstallmentPaid(installment);
                                const showPayAction = !paid && !!access.write && planTakesPayments(plan.status);
                                const showInstallmentEmails =
                                    canReadSaleBuyer && installmentHasVisibleManualEmailActions(installment, timeZone);
                                const paidAmount = installment.paidAmount ?? 0;
                                const dueAmount = installment.amount ?? 0;
                                const remaining = Math.max(0, subtractMoney(dueAmount, paidAmount, decimals));
                                return (
                                    <TableRow key={installment.installmentNumber}>
                                        <TableCell className="font-medium">#{installment.installmentNumber}</TableCell>
                                        <TableCell>
                                            {installment.dueDate ? formatDate(installment.dueDate, {timeZone: "UTC", format: DATE_FORMATS.mediumDate}) : "-"}
                                        </TableCell>
                                        <TableCell>{money(dueAmount)}</TableCell>
                                        <TableCell>{money(paidAmount)}</TableCell>
                                        <TableCell>{money(remaining)}</TableCell>
                                        <TableCell>
                                            {/* The model's installment tones, like the plans table (UX-02, TD-F72). */}
                                            <StatusBadge
                                                tableConfigKey="paymentPlans"
                                                field="installments.status"
                                                value={installment.status ?? "pending"}
                                                label={resolveStateLabel(resolveLanguageKey, "installmentStatusState", installment.status ?? "pending")}
                                            />
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {!paid && (showPayAction || showInstallmentEmails) && (
                                                <div role="presentation" className="inline-flex justify-end" onClick={(e) => e.stopPropagation()}>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon-sm" className="size-8">
                                                                <IconDots className="size-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-fit">
                                                            {showPayAction && (
                                                                <SalePayInstallmentAction
                                                                    installment={installment}
                                                                    onAction={() => payInstallment(installment)}
                                                                />
                                                            )}
                                                            <ManualInstallmentClientEmails saleId={plan.sale?._id ?? ""} installment={installment} />
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
    );
}
