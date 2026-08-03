import {compose} from "redux";
import {Badge} from "@coreModule/components/ui/badge.tsx";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import HiddenElement from "@coreModule/components/custom/hiddenElement.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import ActionMenu from "@coreModule/components/custom/actions/menu/actionMenu.tsx";
import DeleteAction from "@coreModule/components/custom/actions/deleteAction.tsx";
import RestoreAction from "@coreModule/components/custom/actions/restoreAction.tsx";
import {useEffect, useImperativeHandle, useState} from "react";
import TooltipDisplayer from "@coreModule/components/custom/tooltipDisplayer.tsx";
import DeletedInfo from "@coreModule/components/custom/deletedInfo";
import {format} from "date-fns";
import type {DeletedData, SingleForm} from "armonia/src/modules/core/types/shared.types.ts";
import {Sale} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/sale/sale.dto.ts";
import {
    IconCalendarClock,
    IconCreditCard,
    IconCurrencyDollar,
    IconFileText,
    IconHome,
    IconPackage,
    IconUser,
    IconWallet,
} from "@tabler/icons-react";
import {cn} from "@coreModule/components/lib/utils.ts";
import InfoRow from "@coreModule/components/custom/infoRow.tsx";
import CopyTooltip from "@coreModule/components/custom/copyTooltip.tsx";
import {MdiIcon} from "@coreModule/components/custom/mdiIcons/mdiIcon.tsx";
import {Separator} from "@coreModule/components/ui/separator.tsx";
import SaleSheetView, {
    buildSaleEditPath,
    saleDeleteRestoreConfirmLabel,
} from "@propertyManagementModule/clients/panel/private/sales/center/sheetView/saleSheetView.tsx";
import SaleRowMenuExtras from "@propertyManagementModule/clients/panel/private/sales/center/actions/saleRowMenuExtras.tsx";
import {useEntityCard} from "@coreModule/helpers/hooks/useEntityCard.ts";
import {EntityCardShell} from "@propertyManagementModule/components/custom/cards/EntityCardShell.tsx";
import {EntityCardFetchGuard} from "@propertyManagementModule/components/custom/cards/EntityCardFetchGuard.tsx";
import {EntityTextCardHeader} from "@propertyManagementModule/components/custom/cards/EntityTextCardHeader.tsx";
import {
    CARD_BODY_CLASS,
    CARD_INFO_ROWS_CLASS,
    STATUS_BADGE_DANGER,
    STATUS_BADGE_INFO,
    STATUS_BADGE_NEUTRAL,
    STATUS_BADGE_SUCCESS,
    STATUS_BADGE_WARNING,
} from "@propertyManagementModule/components/custom/cards/entityCard.constants.ts";

type SaleUnit = Sale["unit"] & {
    unitType?: {
        icon?: string;
        name?: string;
    };
};

type SaleCardProps = WithLanguageType &
    WithAxiosType<Sale, SingleForm> & {
        sale: Sale;
        unitId?: string;
        unitName?: string;
        fetchId?: string;
        onDelete?: (sale?: Sale, response?: DeletedData) => void;
        onRestore?: () => void;
        small?: boolean;
    };

function fullName(p: {fullName?: string; name?: string; surname?: string} | null | undefined): string | null {
    if (!p) return null;
    const s = p.fullName || [p.name, p.surname].filter(Boolean).join(" ").trim();
    return s.length > 0 ? s : null;
}

function paymentTypeBadgeClass(paymentType: string): string {
    if (!paymentType) return STATUS_BADGE_NEUTRAL;
    const typeLower = paymentType.toLowerCase();
    if (typeLower === "cash") return STATUS_BADGE_SUCCESS;
    if (typeLower === "payment_plan" || typeLower === "payment plan") return STATUS_BADGE_INFO;
    return STATUS_BADGE_NEUTRAL;
}

function SaleCard({
    sale: paramSale,
    resolveLanguageKey,
    unitId,
    unitName,
    fetchId,
    onFilterChange,
    loading,
    error,
    innerRef,
    onDelete: onDeleteProp,
    onRestore: onRestoreProp,
    small,
}: SaleCardProps) {
    const {action, setAction, entity: sale, setEntity: setSale, hideAfterDeletion, onDelete, onRestore} = useEntityCard({
        entityProp: paramSale,
        onDeleteProp,
        onRestoreProp,
        syncPropOnChange: !fetchId,
    });
    const [forceReload, setForceReload] = useState(1);
    const {read, restore} = useAccess("sales");

    useEffect(() => {
        if (fetchId) {
            onFilterChange({_id: fetchId});
        }
    }, [fetchId, forceReload]);

    useImperativeHandle(innerRef, () => ({
        success: (data: unknown) => {
            const wrapped = data as {data?: Sale[]};
            const next =
                Array.isArray(wrapped?.data) && wrapped.data.length > 0 ? wrapped.data[0] : (data as Sale);
            setSale(next);
        },
    }));

    if (!read || !Object.keys(read).length) {
        return <HiddenElement />;
    }
    if (hideAfterDeletion && !restore) {
        return <></>;
    }

    const resolvedUnitId = unitId ?? sale.unit?._id ?? "";
    const resolvedUnitDisplayName = unitName ?? sale.unit?.name ?? sale.unit?.unitNumber;
    const unit = sale.unit as SaleUnit | undefined;

    const formatMoney = (amount: number) =>
        amount.toLocaleString("en-US", {minimumFractionDigits: 0, maximumFractionDigits: 2});

    const saleTitle =
        sale.name?.trim() ||
        [sale.unit?.name, sale.unit?.unitNumber].filter(Boolean).join(" · ") ||
        "—";
    const soldByDisplay = fullName(sale.soldBy);
    const buyerDisplay = fullName(sale.buyer);
    const finalPriceDisplay =
        sale.finalPrice != null
            ? `${sale.saleCurrency?.symbol ? `${sale.saleCurrency.symbol} ` : ""}${formatMoney(sale.finalPrice)}`
            : null;

    const deleteRestoreName = saleDeleteRestoreConfirmLabel(sale, read);

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
                    <div className="flex w-full items-stretch">
                        {(read?.deletedBy || read?.deletedAt) && (
                            <DeletedInfo deletedAt={sale.deletedAt} deletedBy={sale.deletedBy} />
                        )}
                        <div className="w-full min-w-0">
                            <EntityTextCardHeader
                                title={
                                    <TooltipDisplayer tooltip={saleTitle} show>
                                        <span className="flex items-center gap-1 truncate">
                                            {saleTitle}
                                            <CopyTooltip text={sale.name ?? saleTitle} />
                                        </span>
                                    </TooltipDisplayer>
                                }
                                showTitle={!!read?.name}
                                badges={
                                    <>
                                        {sale.paymentType && (
                                            <TooltipDisplayer tooltip={resolveLanguageKey("paymentType")}>
                                                <Badge
                                                    variant="outline"
                                                    className={cn(
                                                        "flex items-center gap-1 text-xs font-medium",
                                                        paymentTypeBadgeClass(sale.paymentType),
                                                    )}
                                                >
                                                    {sale.paymentType === "cash" ? (
                                                        <IconWallet className="h-3 w-3 shrink-0" />
                                                    ) : (
                                                        <IconCreditCard className="h-3 w-3 shrink-0" />
                                                    )}
                                                    {sale.paymentType === "cash"
                                                        ? resolveLanguageKey("cash")
                                                        : resolveLanguageKey("paymentPlan")}
                                                </Badge>
                                            </TooltipDisplayer>
                                        )}
                                        {sale.paymentPlan?.name && (
                                            <TooltipDisplayer tooltip={resolveLanguageKey("paymentPlan")}>
                                                <Badge variant="outline" className={cn("flex items-center gap-1 text-xs font-medium", STATUS_BADGE_INFO)}>
                                                    <IconCreditCard className="h-3 w-3 shrink-0" />
                                                    {sale.paymentPlan.name}
                                                </Badge>
                                            </TooltipDisplayer>
                                        )}
                                        {!!sale.reservation?.name && (
                                            <TooltipDisplayer tooltip={`${resolveLanguageKey("fromReservation")}: ${sale.reservation.name}`}>
                                                <Badge variant="outline" className="text-xs font-medium text-muted-foreground">
                                                    {resolveLanguageKey("fromReservation")}: {sale.reservation.name}
                                                </Badge>
                                            </TooltipDisplayer>
                                        )}
                                        {!!sale.approvalStatus && sale.approvalStatus !== "approved" && (
                                            <TooltipDisplayer tooltip={resolveLanguageKey("status")}>
                                                <Badge
                                                    variant="outline"
                                                    className={cn(
                                                        "text-xs font-medium",
                                                        sale.approvalStatus === "rejected" ? STATUS_BADGE_DANGER : STATUS_BADGE_WARNING,
                                                    )}
                                                >
                                                    {resolveLanguageKey(`approvalStatuses.${sale.approvalStatus}`)}
                                                </Badge>
                                            </TooltipDisplayer>
                                        )}
                                        {!!sale.notes?.trim() && (
                                            <TooltipDisplayer tooltip={resolveLanguageKey("notes")}>
                                                <Badge variant="outline" className={cn("text-xs font-medium", STATUS_BADGE_NEUTRAL)}>
                                                    <IconFileText className="h-3 w-3 mr-1" />
                                                    {resolveLanguageKey("notes")}
                                                </Badge>
                                            </TooltipDisplayer>
                                        )}
                                    </>
                                }
                                showBadges={!!(read?.paymentType || read?.paymentPlan || read?.reservation || read?.approvalStatus || read?.notes)}
                                actionMenu={
                                    <ActionMenu
                                        accessModel={"sales"}
                                        deletedData={sale}
                                        onAction={(a: string) => setAction(a)}
                                        editPath={buildSaleEditPath(sale, resolvedUnitId, resolvedUnitDisplayName)}
                                        allowMenuForCustomChildren={true}
                                    >
                                        <SaleRowMenuExtras sale={sale} />
                                    </ActionMenu>
                                }
                            />
                            <div className={CARD_BODY_CLASS}>
                                <Separator />
                                <div className={cn(CARD_INFO_ROWS_CLASS, "grid grid-cols-2 gap-1 px-1")}>
                                    <InfoRow
                                        icon={IconHome}
                                        iconReplacement={
                                            unit?.unitType?.icon ? (
                                                <MdiIcon
                                                    icon={unit.unitType.icon}
                                                    size={0.75}
                                                    showFallback
                                                    className="text-muted-foreground"
                                                />
                                            ) : undefined
                                        }
                                        label={unit?.unitType?.name ?? resolveLanguageKey("unit")}
                                        tooltip={unit?.unitType?.name ?? resolveLanguageKey("unit")}
                                        show={!!read?.unit}
                                        value={
                                            sale.unit != null &&
                                            (sale.unit.name ?? sale.unit.unitNumber ?? null)
                                        }
                                    />
                                    <InfoRow
                                        icon={IconUser}
                                        label={resolveLanguageKey("soldBy")}
                                        tooltip={resolveLanguageKey("soldBy")}
                                        show={!!read?.soldBy}
                                        value={soldByDisplay}
                                    />
                                    <InfoRow
                                        icon={IconUser}
                                        label={resolveLanguageKey("buyer")}
                                        tooltip={resolveLanguageKey("buyer")}
                                        show={!!read?.buyer}
                                        value={buyerDisplay}
                                    />
                                    {!small && (
                                        <>
                                            <InfoRow
                                                icon={IconCalendarClock}
                                                label={resolveLanguageKey("saleDate")}
                                                tooltip={resolveLanguageKey("saleDate")}
                                                show={!!read?.saleDate}
                                                value={
                                                    sale.saleDate != null
                                                        ? format(new Date(sale.saleDate), "PP")
                                                        : null
                                                }
                                            />
                                            <InfoRow
                                                icon={IconCurrencyDollar}
                                                label={resolveLanguageKey("finalPrice")}
                                                tooltip={resolveLanguageKey("finalPrice")}
                                                show={!!read?.finalPrice}
                                                value={
                                                    finalPriceDisplay ? (
                                                        <span className="text-status-sold font-semibold tabular-nums">
                                                            {finalPriceDisplay}
                                                        </span>
                                                    ) : null
                                                }
                                            />
                                            {!!sale.handoverDate && (
                                                <InfoRow
                                                    icon={IconPackage}
                                                    label={resolveLanguageKey("handoverDate")}
                                                    tooltip={resolveLanguageKey("handoverDate")}
                                                    show={!!read?.handoverDate}
                                                    className="text-status-sold"
                                                    value={format(new Date(sale.handoverDate), "PP")}
                                                />
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </EntityCardShell>

                {action === "view" && (
                    <SaleSheetView
                        open
                        onOpenChange={() => setAction("")}
                        sale={sale}
                        unitId={resolvedUnitId}
                        unitName={resolvedUnitDisplayName}
                        onDelete={onDelete}
                        onRestore={onRestore}
                    />
                )}

                {!!action && action !== "view" && (
                    <>
                        {action === "delete" && (
                            <DeleteAction
                                accessModel={"sales"}
                                deleteId={sale._id}
                                openAlert={action === "delete"}
                                name={deleteRestoreName}
                                confirmName={deleteRestoreName}
                                onSuccess={(data: DeletedData) => {
                                    onDelete(data);
                                    setAction("");
                                }}
                                onCancel={() => setAction("")}
                                url={`/api/realEstate/unit/sale`}
                            />
                        )}
                        {action === "restore" && (
                            <RestoreAction
                                accessModel={"sales"}
                                deleteId={sale._id}
                                openAlert={action === "restore"}
                                name={deleteRestoreName}
                                confirmName={deleteRestoreName}
                                onSuccess={() => {
                                    onRestore();
                                    setAction("");
                                }}
                                onCancel={() => setAction("")}
                                url={`/api/realEstate/unit/sale/restore`}
                            />
                        )}
                    </>
                )}
            </>
        </EntityCardFetchGuard>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/sales/center/cardView/saleCard.tsx"),
    withAxios(
        {
            url: "/api/realEstate/unit/sale/single",
            method: "POST",
            data: {},
        },
        true,
    ),
    withDebug(true, true),
)(SaleCard);
