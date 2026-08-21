import {compose} from "redux";
import withLanguage, {type ResolveLanguageKey, WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {Avatar, AvatarFallback} from "@coreModule/components/ui/avatar.tsx";
import {IconCurrencyDollar, IconHome, IconUser} from "@tabler/icons-react";
import CommissionRowMenuExtras from "@propertyManagementModule/clients/panel/private/commissions/center/actions/commissionRowMenuExtras.tsx";
import CommissionSheetView, {commissionConfirmLabel} from "@propertyManagementModule/clients/panel/private/commissions/center/sheetView/commissionSheetView.tsx";
import {Commission} from "armonia/src/modules/propertyManagement/api/realEstate/private/commission/commission.dto.ts";
import DisplayRow from "@coreModule/components/custom/displayValue/displayRow.tsx";
import DisplayValue from "@coreModule/components/custom/displayValue/displayValue.tsx";
import EntityCard from "@coreModule/components/custom/systemCards/entityCard.tsx";
import {Badge} from "@coreModule/components/ui/badge.tsx";
import {Separator} from "@coreModule/components/ui/separator.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import {
    CARD_INFO_ROWS_TWO_COL_CLASS,
    STATUS_BADGE_DANGER,
    STATUS_BADGE_INFO,
    STATUS_BADGE_NEUTRAL,
    STATUS_BADGE_SUCCESS,
    STATUS_BADGE_WARNING,
} from "@coreModule/components/custom/cards/entityCard.constants.ts";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {ReactNode, RefObject} from "react";

function commissionStatusBadgeClass(status: string): string {
    switch (status) {
        case "paid":
            return STATUS_BADGE_SUCCESS;
        case "pending":
            return STATUS_BADGE_WARNING;
        case "pending_approval":
            return STATUS_BADGE_INFO;
        case "voided":
            return STATUS_BADGE_DANGER;
        default:
            return STATUS_BADGE_NEUTRAL;
    }
}

function commissionSourceBadgeClass(sourceType: string): string {
    switch (sourceType) {
        case "sale":
            return STATUS_BADGE_SUCCESS;
        case "reservation":
            return STATUS_BADGE_INFO;
        default:
            return STATUS_BADGE_NEUTRAL;
    }
}

function CommissionCardBadges({
    entity,
    resolveLanguageKey,
}: {
    entity: Commission;
    resolveLanguageKey: ResolveLanguageKey;
}): ReactNode {
    const status = entity.status;
    const sourceType = entity.sourceType;
    const basis = entity.basis;

    if (!status && !sourceType && !basis) return null;

    return (
        <>
            {sourceType ? (
                <DisplayValue path="sourceType" value={sourceType}>
                    {() => (
                        <Badge variant="outline" className={cn("text-xs", commissionSourceBadgeClass(sourceType))}>
                            {String(
                                resolveLanguageKey(`fields.!enums.sourceType.${sourceType}`, true) || sourceType,
                            )}
                        </Badge>
                    )}
                </DisplayValue>
            ) : null}
            {status ? (
                <DisplayValue path="status" value={status}>
                    {() => (
                        <Badge variant="outline" className={cn("text-xs", commissionStatusBadgeClass(status))}>
                            {String(resolveLanguageKey(`fields.!enums.status.${status}`, true) || status)}
                        </Badge>
                    )}
                </DisplayValue>
            ) : null}
            {basis ? (
                <DisplayValue path="basis" value={basis}>
                    {() => (
                        <Badge variant="secondary" className={cn("text-xs", STATUS_BADGE_NEUTRAL)}>
                            {String(resolveLanguageKey(`basisEnum.${basis}`, true) || basis)}
                        </Badge>
                    )}
                </DisplayValue>
            ) : null}
        </>
    );
}

export type CommissionCardProps = WithLanguageType & {
    commission: Commission;
    fetchId?: string;
    hideActions?: boolean;
    sheetOnly?: boolean;
    onModifySuccess?: (updated?: Commission) => void;
    innerRef?: RefObject<WithAxiosLifecycleRef<Commission> | null>;
};

function CommissionCard({
    commission,
    resolveLanguageKey,
    fetchId,
    hideActions = false,
    sheetOnly = false,
    onModifySuccess,
    innerRef,
}: CommissionCardProps) {
    return (
        <EntityCard
            resource="commissions"
            entity={commission}
            fetchId={fetchId}
            singleUrl="/api/realEstate/commission/single"
            hideActions={hideActions}
            hideEdit
            hideDelete
            hideRestore
            sheetOnly={sheetOnly}
            editPath={() => ""}
            Sheet={CommissionSheetView}
            sheetEntityProp="commission"
            deleteUrl=""
            restoreUrl=""
            failedTitle={String(resolveLanguageKey("failedTitle") || "")}
            failedDescription={String(resolveLanguageKey("failedDescription") || "")}
            titlePath="agent.name"
            innerRef={innerRef}
            sheetProps={({entity, setEntity}) => ({
                fetchId,
                onModifySuccess: (updated?: Commission) => {
                    if (updated) setEntity({...entity, ...updated});
                    onModifySuccess?.(updated);
                },
            })}
        >
            {({entity, setEntity}) => {
                const hasBadges = Boolean(entity.status || entity.sourceType || entity.basis);
                return (
                    <>
                        <EntityCard.Header
                            titlePath="agent.name"
                            title={commissionConfirmLabel(entity) ?? "—"}
                            icon={
                                <Avatar className="h-10 w-10 shrink-0 rounded-xl border-0">
                                    <AvatarFallback className="rounded-xl bg-muted/50 text-muted-foreground text-sm font-semibold">
                                        {entity.agent
                                            ? `${entity.agent.name?.[0] ?? ""}${entity.agent.surname?.[0] ?? ""}`.toUpperCase() || "?"
                                            : <IconUser className="h-4 w-4" />}
                                    </AvatarFallback>
                                </Avatar>
                            }
                            badges={
                                hasBadges ? (
                                    <CommissionCardBadges
                                        entity={entity}
                                        resolveLanguageKey={resolveLanguageKey}
                                    />
                                ) : undefined
                            }
                        >
                            <CommissionRowMenuExtras
                                commission={entity}
                                onModify={(updated?: Commission) => {
                                    if (updated) setEntity({...entity, ...updated});
                                    onModifySuccess?.(updated);
                                }}
                            />
                        </EntityCard.Header>
                        {hasBadges && (
                            <Separator className="-mx-(--density-pad) w-auto self-stretch" />
                        )}
                        <EntityCard.Body className={CARD_INFO_ROWS_TWO_COL_CLASS}>
                            <DisplayRow
                                icon={IconCurrencyDollar}
                                label={resolveLanguageKey("amount")}
                                tooltip={resolveLanguageKey("amount")}
                                path="amount"
                                type="currency"
                                value={{amount: entity.amount, currency: entity.currency}}
                            />
                            <DisplayRow
                                icon={IconHome}
                                label={entity.unit?.unitType?.name ?? resolveLanguageKey("unit")}
                                tooltip={entity.unit?.unitType?.name ?? resolveLanguageKey("unit")}
                                // Mapper-derived from sale/reservation — not a commissions ACL key.
                                show
                                value={entity.unit?.name ?? entity.unit?.unitNumber}
                            />
                            <div className="col-span-2">
                                <DisplayRow
                                    icon={IconCurrencyDollar}
                                    label={resolveLanguageKey(
                                        entity.sourceType === "reservation"
                                            ? "fields.!enums.sourceType.reservation"
                                            : "fields.!enums.sourceType.sale",
                                    )}
                                    tooltip={resolveLanguageKey(
                                        entity.sourceType === "reservation"
                                            ? "fields.!enums.sourceType.reservation"
                                            : "fields.!enums.sourceType.sale",
                                    )}
                                    path={entity.sourceType === "reservation" ? "reservation" : "sale"}
                                    value={entity.sale?.name ?? entity.reservation?.name}
                                />
                            </div>
                        </EntityCard.Body>
                    </>
                );
            }}
        </EntityCard>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/commissions/center/cardView/commissionCard.tsx"),
    withDebug(true, true, "commissions"),
)(CommissionCard);
