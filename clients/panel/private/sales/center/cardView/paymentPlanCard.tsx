import {compose} from "redux";
import {InfoRowGroup} from "@coreModule/components/custom/infoRowGroup.tsx";
import {Badge} from "@coreModule/components/ui/badge.tsx";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import HiddenElement from "@coreModule/components/custom/hiddenElement.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import ActionMenu from "@coreModule/components/custom/actions/menu/actionMenu.tsx";
import {useEffect, useImperativeHandle, useState} from "react";
import TooltipDisplayer from "@coreModule/components/custom/tooltipDisplayer.tsx";
import type {SingleForm} from "armonia/src/modules/core/types/shared.types.ts";
import {IconCalendarClock, IconListNumbers, IconWallet} from "@tabler/icons-react";
import {cn} from "@coreModule/components/lib/utils.ts";
import InfoRow from "@coreModule/components/custom/infoRow.tsx";
import CopyTooltip from "@coreModule/components/custom/copyTooltip.tsx";
import {format} from "date-fns";
import type {PaymentPlan} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/paymentPlan/paymentPlan.dto.ts";
import PaymentPlanSheetView from "@propertyManagementModule/clients/panel/private/sales/center/sheetView/paymentPlanSheetView.tsx";
import SalePayDownPaymentAction from "@propertyManagementModule/clients/panel/private/sales/center/actions/salePayDownPaymentAction.tsx";
import SalePayDownPaymentDialog from "@propertyManagementModule/components/custom/sale/salePayDownPaymentDialog.tsx";
import {useEntityCard} from "@coreModule/helpers/hooks/useEntityCard.ts";
import {EntityCardShell} from "@propertyManagementModule/components/custom/cards/EntityCardShell.tsx";
import {EntityCardFetchGuard} from "@propertyManagementModule/components/custom/cards/EntityCardFetchGuard.tsx";
import {EntityTextCardHeader} from "@propertyManagementModule/components/custom/cards/EntityTextCardHeader.tsx";
import {
    CARD_BODY_CLASS,
    STATUS_BADGE_DANGER,
    STATUS_BADGE_NEUTRAL,
    STATUS_BADGE_SUCCESS,
    STATUS_BADGE_WARNING,
} from "@propertyManagementModule/components/custom/cards/entityCard.constants.ts";

type PaymentPlanCardProps = WithLanguageType & WithAxiosType<PaymentPlan, SingleForm> & {
    paymentPlan: PaymentPlan;
    fetchId?: string;
    small?: boolean;
};

function formatMoney(value: number | undefined): string | null {
    if (value == null) return null;
    return value.toLocaleString("en-US", {minimumFractionDigits: 0, maximumFractionDigits: 2});
}

function paymentPlanStatusClass(status?: string): string {
    if (!status) return STATUS_BADGE_NEUTRAL;
    const lowered = status.toLowerCase();
    if (lowered.includes("completed") || lowered.includes("paid")) return STATUS_BADGE_SUCCESS;
    if (lowered.includes("cancelled") || lowered.includes("defaulted")) return STATUS_BADGE_DANGER;
    return STATUS_BADGE_WARNING;
}

function resolveStateLabel(
    resolveLanguageKey: (key: string) => string,
    category: string,
    rawValue?: string,
): string {
    if (!rawValue) return "-";
    const key = `${category}.${rawValue}`;
    const resolved = resolveLanguageKey(key);
    return resolved === `---${key}---` ? rawValue : resolved;
}

function PaymentPlanCard({
    paymentPlan: paymentPlanProp,
    resolveLanguageKey,
    fetchId,
    onFilterChange,
    loading,
    error,
    innerRef,
    small,
}: PaymentPlanCardProps) {
    const {action, setAction, entity: paymentPlan, setEntity: setPaymentPlan} = useEntityCard({
        entityProp: paymentPlanProp,
        syncPropOnChange: !fetchId,
    });
    const [forceReload, setForceReload] = useState(1);
    const {read} = useAccess("paymentPlans");

    useEffect(() => {
        if (fetchId) {
            onFilterChange({_id: fetchId});
        }
    }, [fetchId, forceReload]);

    useImperativeHandle(innerRef, () => ({
        success: (data: unknown) => {
            setPaymentPlan(data as PaymentPlan);
        },
    }));

    if (!read || !Object.keys(read).length) return <HiddenElement />;

    const title = paymentPlan.name?.trim() || "—";

    return (
        <EntityCardFetchGuard
            fetchId={fetchId}
            loading={loading}
            error={error}
            failedTitle={resolveLanguageKey("failedTitle")}
            failedDescription={resolveLanguageKey("failedDescription")}
            onRetry={() => setForceReload((n) => n + 1)}
        >
            <>
                <EntityCardShell
                    onClick={fetchId ? undefined : () => setAction("view")}
                    disableClick={!!fetchId}
                >
                    <EntityTextCardHeader
                        title={
                            <TooltipDisplayer tooltip={resolveLanguageKey("paymentPlan")} show>
                                <span className="flex items-center gap-1 truncate">
                                    {title}
                                    <CopyTooltip text={paymentPlan.name ?? paymentPlan._id} />
                                </span>
                            </TooltipDisplayer>
                        }
                        showTitle={!!read?.name}
                        badges={
                            paymentPlan.status ? (
                                <TooltipDisplayer tooltip={resolveLanguageKey("status")}>
                                    <Badge
                                        variant="outline"
                                        className={cn(
                                            "flex w-fit items-center gap-1 text-xs font-medium",
                                            paymentPlanStatusClass(paymentPlan.status),
                                        )}
                                    >
                                        {resolveStateLabel(resolveLanguageKey, "paymentPlanStatusState", paymentPlan.status)}
                                    </Badge>
                                </TooltipDisplayer>
                            ) : undefined
                        }
                        showBadges={!!read?.status}
                        actionMenu={
                            <ActionMenu
                                accessModel={"paymentPlans"}
                                onAction={(a: string) => setAction(a)}
                                hideEdit={true}
                            >
                                {!!read?.downPaymentPaid && !paymentPlan.downPaymentPaid && (
                                    <SalePayDownPaymentAction
                                        isPaid={!!paymentPlan.downPaymentPaid}
                                        onAction={(actionName: string) => setAction(actionName)}
                                    />
                                )}
                            </ActionMenu>
                        }
                    />
                    <div className={CARD_BODY_CLASS}>
                        <InfoRowGroup className={cn("grid grid-cols-2 lg:grid-cols-3 px-1", {"lg:grid-cols-3": !small})}>
                            <InfoRow
                                icon={IconWallet}
                                label={resolveLanguageKey("remainingBalance")}
                                tooltip={resolveLanguageKey("remainingBalance")}
                                show={!!read?.remainingBalance}
                                value={formatMoney(paymentPlan.remainingBalance)}
                            />
                            <InfoRow
                                icon={IconListNumbers}
                                label={resolveLanguageKey("numberOfInstallments")}
                                tooltip={resolveLanguageKey("numberOfInstallments")}
                                show={!!read?.numberOfInstallments}
                                value={paymentPlan.numberOfInstallments}
                            />
                            <InfoRow
                                icon={IconCalendarClock}
                                label={resolveLanguageKey("endDate")}
                                tooltip={resolveLanguageKey("endDate")}
                                show={!!read?.endDate}
                                value={paymentPlan.endDate ? format(new Date(paymentPlan.endDate), "PP") : null}
                            />
                        </InfoRowGroup>
                    </div>
                </EntityCardShell>

                {action === "view" && (
                    <PaymentPlanSheetView
                        open
                        onOpenChange={(open: boolean) => {
                            if (!open) setAction("");
                        }}
                        paymentPlan={paymentPlan}
                    />
                )}
                {action === "payDownPayment" && (
                    <SalePayDownPaymentDialog
                        open
                        onOpenChange={(open: boolean) => {
                            if (!open) setAction("");
                        }}
                        paymentPlanId={paymentPlan._id}
                        onSuccess={(updatedPaymentPlan: PaymentPlan) => {
                            setPaymentPlan(updatedPaymentPlan);
                            setAction("");
                        }}
                    />
                )}
            </>
        </EntityCardFetchGuard>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/sales/center/cardView/paymentPlanCard.tsx"),
    withAxios(
        {
            url: "/api/realEstate/unit/sale/paymentPlan/single",
            method: "POST",
            data: {},
        },
        true,
    ),
    withDebug(true, true),
)(PaymentPlanCard);
