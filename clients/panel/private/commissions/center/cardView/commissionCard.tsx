import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import HiddenElement from "@coreModule/components/custom/hiddenElement.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import {Separator} from "@coreModule/components/ui/separator.tsx";
import TooltipDisplayer from "@coreModule/components/custom/tooltipDisplayer.tsx";
import {Badge} from "@coreModule/components/ui/badge.tsx";
import {Avatar, AvatarFallback} from "@coreModule/components/ui/avatar.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import {formatCardDecimal} from "@propertyManagementModule/helpers/general/formatCardNumber.ts";
import ActionMenu from "@coreModule/components/custom/actions/menu/actionMenu.tsx";
import CommissionRowMenuExtras from "@propertyManagementModule/clients/panel/private/commissions/center/actions/commissionRowMenuExtras.tsx";
import CommissionSheetView, {commissionConfirmLabel} from "@propertyManagementModule/clients/panel/private/commissions/center/sheetView/commissionSheetView.tsx";
import {Commission} from "armonia/src/modules/propertyManagement/api/realEstate/private/commission/commission.dto.ts";
import {IconCurrencyDollar, IconFileText, IconHome, IconUser} from "@tabler/icons-react";
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
    STATUS_BADGE_NEUTRAL,
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
    if (s === "pending_approval") return STATUS_BADGE_INFO;
    return STATUS_BADGE_WARNING;
}

function agentInitials(commission: Commission): string {
    const a = commission.agent;
    const f = a?.name?.[0] ?? "";
    const l = a?.surname?.[0] ?? "";
    return (f + l).toUpperCase() || "?";
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
        unit != null ? (unit.name ?? unit.unitNumber ?? null) : null;
    const amountDisplay =
        commission.amount != null
            ? `${formatCardDecimal(commission.amount)}${commission.currency?.name ? ` ${commission.currency.name}` : ""}`
            : null;
    const agentTitle = commissionConfirmLabel(commission) ?? "—";
    const statusKey = (commission.status || "").toLowerCase();

    return (
        <>
            <EntityCardShell onClick={() => setAction("view")}>
                <div className="flex w-full items-stretch">
                    {(read.deletedBy || read.deletedAt) && (
                        <DeletedInfo deletedAt={commission.deletedAt} deletedBy={commission.deletedBy} />
                    )}
                    <div className="w-full min-w-0">
                        <EntityTextCardHeader
                            iconTile={
                                <TooltipDisplayer tooltip={resolveLanguageKey("agent")}>
                                    <Avatar className="h-10 w-10 shrink-0 rounded-xl border-0">
                                        <AvatarFallback className="rounded-xl bg-muted/50 text-muted-foreground text-sm font-semibold">
                                            {commission.agent ? agentInitials(commission) : <IconUser className="h-4 w-4" />}
                                        </AvatarFallback>
                                    </Avatar>
                                </TooltipDisplayer>
                            }
                            title={agentTitle}
                            showTitle={!!read?.agent}
                            badges={
                                <>
                                    <TooltipDisplayer tooltip={resolveLanguageKey("status")}>
                                        <Badge
                                            variant="outline"
                                            className={cn("inline-flex items-center text-xs font-medium", commissionStatusBadgeClass(commission.status))}
                                        >
                                            {resolveLanguageKey(`fields.!enums.status.${statusKey}`) as string}
                                        </Badge>
                                    </TooltipDisplayer>
                                    {!!commission.sourceType && (
                                        <TooltipDisplayer tooltip={resolveLanguageKey("sourceType")}>
                                            <Badge
                                                variant="outline"
                                                className={cn(
                                                    "inline-flex items-center text-xs font-medium",
                                                    commission.sourceType === "sale" ? STATUS_BADGE_INFO : "border-primary/30 bg-primary/10 text-primary",
                                                )}
                                            >
                                                {resolveLanguageKey(`fields.!enums.sourceType.${commission.sourceType}`) as string}
                                            </Badge>
                                        </TooltipDisplayer>
                                    )}
                                    {!!commission.notes && (
                                        <TooltipDisplayer tooltip={resolveLanguageKey("notes")}>
                                            <Badge variant="outline" className={cn("inline-flex items-center gap-1 text-xs font-medium", STATUS_BADGE_NEUTRAL)}>
                                                <IconFileText className="h-3 w-3" />
                                                {resolveLanguageKey("notes")}
                                            </Badge>
                                        </TooltipDisplayer>
                                    )}
                                </>
                            }
                            showBadges={!!(read?.status || read?.sourceType || read?.notes)}
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
                                        label={resolveLanguageKey(commission.sourceType === "reservation" ? "fields.!enums.sourceType.reservation" : "fields.!enums.sourceType.sale")}
                                        tooltip={resolveLanguageKey(commission.sourceType === "reservation" ? "fields.!enums.sourceType.reservation" : "fields.!enums.sourceType.sale")}
                                        show={!!(read?.sale || read?.reservation)}
                                        value={commission.sale?.name ?? commission.reservation?.name ?? null}
                                    />
                                )}
                            </div>
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
