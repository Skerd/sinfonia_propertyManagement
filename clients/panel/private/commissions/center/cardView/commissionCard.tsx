import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import HiddenElement from "@coreModule/components/custom/hiddenElement.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import {Separator} from "@coreModule/components/ui/separator.tsx";
import TooltipDisplayer from "@coreModule/components/custom/tooltipDisplayer.tsx";
import {Badge} from "@coreModule/components/ui/badge.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import ActionMenu from "@coreModule/components/custom/actions/menu/actionMenu.tsx";
import CommissionRowMenuExtras from "@propertyManagementModule/clients/panel/private/commissions/center/actions/commissionRowMenuExtras.tsx";
import CommissionSheetView, {commissionConfirmLabel} from "@propertyManagementModule/clients/panel/private/commissions/center/sheetView/commissionSheetView.tsx";
import {format} from "date-fns";
import {Commission} from "armonia/src/modules/propertyManagement/api/realEstate/private/commission/commission.dto.ts";
import {IconCalendar, IconCurrencyDollar, IconFileText, IconHome, IconPercentage} from "@tabler/icons-react";
import {MdiIcon} from "@coreModule/components/custom/mdiIcons/mdiIcon.tsx";
import DeletedInfo from "@coreModule/components/custom/deletedInfo";
import InfoRow from "@coreModule/components/custom/infoRow.tsx";
import {useEntityCard} from "@coreModule/helpers/hooks/useEntityCard.ts";
import {EntityCardShell} from "@propertyManagementModule/components/custom/cards/EntityCardShell.tsx";
import {EntityTextCardHeader} from "@propertyManagementModule/components/custom/cards/EntityTextCardHeader.tsx";
import {
    CARD_BODY_CLASS,
    CARD_INFO_ROWS_CLASS,
    STATUS_BADGE_DANGER,
    STATUS_BADGE_INFO,
    STATUS_BADGE_SUCCESS,
    STATUS_BADGE_WARNING,
} from "@propertyManagementModule/components/custom/cards/entityCard.constants.ts";

export type CommissionCardProps = WithLanguageType & {
    commission: Commission;
    onModifySuccess?: (updated?: Commission) => void;
};

function commissionStatusBadgeClass(status: string): string {
    const s = (status || "").toLowerCase();
    if (s === "paid") return STATUS_BADGE_SUCCESS;
    if (s === "voided") return STATUS_BADGE_DANGER;
    return STATUS_BADGE_WARNING;
}

function CommissionCard({
    commission: paramCommission,
    resolveLanguageKey,
    onModifySuccess,
}: CommissionCardProps) {
    const {action, setAction, entity: commission, setEntity: setCommission} = useEntityCard({
        entityProp: paramCommission,
    });
    const {read} = useAccess("commissions");

    if (!read || !Object.keys(read).length) {
        return <HiddenElement />;
    }

    const handleModify = (updated?: Commission) => {
        if (updated) setCommission(updated);
        onModifySuccess?.(updated);
    };

    const unit = commission.unit;
    const unitValue =
        unit != null ? (unit.name ?? unit.unitNumber ?? unit._id ?? null) : null;
    const amountDisplay =
        commission.amount != null
            ? `${commission.amount}${commission.currency?.name ? ` ${commission.currency.name}` : ""}`
            : null;

    return (
        <>
            <EntityCardShell onClick={() => setAction("view")}>
                <div className="flex w-full items-stretch">
                    {(read.deletedBy || read.deletedAt) && (
                        <DeletedInfo deletedAt={commission.deletedAt} deletedBy={commission.deletedBy} />
                    )}
                    <div className="w-full min-w-0">
                        <EntityTextCardHeader
                            title={
                                <TooltipDisplayer tooltip={resolveLanguageKey("agent")} show={!!read?.agent}>
                                    {commissionConfirmLabel(commission) ?? "—"}
                                </TooltipDisplayer>
                            }
                            badges={
                                <>
                                    <TooltipDisplayer tooltip={resolveLanguageKey("status")}>
                                        <Badge
                                            variant="outline"
                                            className={cn("text-xs font-medium", commissionStatusBadgeClass(commission.status))}
                                        >
                                            {resolveLanguageKey(`statusEnum.${(commission.status || "").toLowerCase()}`)}
                                        </Badge>
                                    </TooltipDisplayer>
                                    {!!commission.sourceType && (
                                        <TooltipDisplayer tooltip={resolveLanguageKey("sourceType")}>
                                            <Badge
                                                variant="outline"
                                                className={cn(
                                                    "text-xs font-medium",
                                                    commission.sourceType === "sale" ? STATUS_BADGE_INFO : "border-violet-500/30 bg-violet-500/10 text-violet-600 dark:text-violet-400",
                                                )}
                                            >
                                                {resolveLanguageKey(`sourceTypeEnum.${commission.sourceType}`)}
                                            </Badge>
                                        </TooltipDisplayer>
                                    )}
                                </>
                            }
                            actionMenu={
                                <ActionMenu
                                    accessModel={"commissions"}
                                    deletedData={commission}
                                    onAction={(a: string) => setAction(a)}
                                    editPath=""
                                    hideEdit={true}
                                    hideDelete={true}
                                    hideRestore={true}
                                    allowMenuForCustomChildren={true}
                                >
                                    <CommissionRowMenuExtras commission={commission} onModify={handleModify} />
                                </ActionMenu>
                            }
                        />
                        <div className={CARD_BODY_CLASS}>
                            <Separator />
                            <div className={CARD_INFO_ROWS_CLASS}>
                                <InfoRow
                                    icon={IconCurrencyDollar}
                                    label={resolveLanguageKey("amount")}
                                    tooltip={resolveLanguageKey("amount")}
                                    show={!!read?.amount}
                                    value={amountDisplay}
                                />
                                <InfoRow
                                    icon={IconPercentage}
                                    label={resolveLanguageKey("ratePercent")}
                                    tooltip={resolveLanguageKey("ratePercent")}
                                    show={!!read?.ratePercent}
                                    value={commission.ratePercent != null ? `${commission.ratePercent}%` : null}
                                />
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
                                    show={!!(read?.sale || read?.reservation)}
                                    value={unitValue}
                                />
                                {!!(commission.sale?.name || commission.reservation?.name) && (
                                    <InfoRow
                                        icon={IconCurrencyDollar}
                                        label={resolveLanguageKey(commission.sourceType === "reservation" ? "sourceTypeEnum.reservation" : "sourceTypeEnum.sale")}
                                        tooltip={resolveLanguageKey(commission.sourceType === "reservation" ? "sourceTypeEnum.reservation" : "sourceTypeEnum.sale")}
                                        show={true}
                                        value={commission.sale?.name ?? commission.reservation?.name ?? null}
                                    />
                                )}
                            </div>
                            {commission.status === "paid" && !!commission.paidAt && (
                                <InfoRow
                                    icon={IconCalendar}
                                    label={resolveLanguageKey("paidAt")}
                                    tooltip={resolveLanguageKey("paidAt")}
                                    show={true}
                                    className="text-status-sold"
                                    value={format(new Date(commission.paidAt), "PP")}
                                />
                            )}
                            {!!commission.notes && (
                                <InfoRow
                                    icon={IconFileText}
                                    label={resolveLanguageKey("notes")}
                                    tooltip={resolveLanguageKey("notes")}
                                    show={!!read?.notes}
                                    value=""
                                    dontRenderValue={true}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </EntityCardShell>

            {action === "view" && (
                <CommissionSheetView
                    open={action === "view"}
                    onOpenChange={(open: boolean) => {
                        if (!open) setAction("");
                    }}
                    commission={commission}
                    onModifySuccess={handleModify}
                />
            )}
        </>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/commissions/center/cardView/commissionCard.tsx"),
    withDebug(true, true),
)(CommissionCard);
