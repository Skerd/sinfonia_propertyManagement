import {compose} from "redux";
import withLanguage, {type ResolveLanguageKey, WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import {Sale} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/sale/sale.dto.ts";
import {
    IconBuilding,
    IconBuildingCommunity,
    IconCalendarClock,
    IconCurrencyDollar,
    IconHome,
    IconPackage,
    IconUser,
} from "@tabler/icons-react";
import CopyTooltip from "@coreModule/components/custom/copyTooltip.tsx";
import SaleSheetView, {buildSaleEditPath} from "@propertyManagementModule/clients/panel/private/sales/center/sheetView/saleSheetView.tsx";
import SaleRowMenuExtras from "@propertyManagementModule/clients/panel/private/sales/center/actions/saleRowMenuExtras.tsx";
import DisplayRow from "@coreModule/components/custom/displayValue/displayRow.tsx";
import DisplayValue from "@coreModule/components/custom/displayValue/displayValue.tsx";
import EntityCard from "@coreModule/components/custom/systemCards/entityCard.tsx";
import {Badge} from "@coreModule/components/ui/badge.tsx";
import {Separator} from "@coreModule/components/ui/separator.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import {
    CARD_INFO_ROWS_TWO_COL_CLASS,
    STATUS_BADGE_INFO,
    STATUS_BADGE_NEUTRAL,
    STATUS_BADGE_SUCCESS,
} from "@coreModule/components/custom/cards/entityCard.constants.ts";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {ReactNode, RefObject} from "react";

function paymentTypeBadgeClass(paymentType: string): string {
    switch (paymentType) {
        case "cash":
            return STATUS_BADGE_SUCCESS;
        case "payment_plan":
            return STATUS_BADGE_INFO;
        default:
            return STATUS_BADGE_NEUTRAL;
    }
}

function paymentTypeLabel(paymentType: string, resolveLanguageKey: ResolveLanguageKey): string {
    if (paymentType === "cash") return String(resolveLanguageKey("cash"));
    if (paymentType === "payment_plan") return String(resolveLanguageKey("paymentPlan"));
    return paymentType;
}

function SaleCardBadges({
    entity,
    resolveLanguageKey,
}: {
    entity: Sale;
    resolveLanguageKey: ResolveLanguageKey;
}): ReactNode {
    const paymentType = entity.paymentType;
    const projectName = entity.project?.name;
    const edificeName = entity.edifice?.name;

    if (!paymentType && !projectName && !edificeName) return null;

    return (
        <>
            {paymentType ? (
                <DisplayValue path="paymentType" value={paymentType}>
                    {() => (
                        <Badge variant="outline" className={cn("text-xs", paymentTypeBadgeClass(paymentType))}>
                            {paymentTypeLabel(paymentType, resolveLanguageKey)}
                        </Badge>
                    )}
                </DisplayValue>
            ) : null}
            {/* project/edifice are denormalized dependents (sheet uses skipReadAccessGate) */}
            {projectName ? (
                <DisplayValue value={projectName} show>
                    {() => (
                        <Badge variant="secondary" className={cn("text-xs gap-1", STATUS_BADGE_NEUTRAL)}>
                            <IconBuilding className="size-3" aria-hidden />
                            {projectName}
                        </Badge>
                    )}
                </DisplayValue>
            ) : null}
            {edificeName ? (
                <DisplayValue value={edificeName} show>
                    {() => (
                        <Badge variant="secondary" className={cn("text-xs gap-1", STATUS_BADGE_NEUTRAL)}>
                            <IconBuildingCommunity className="size-3" aria-hidden />
                            {edificeName}
                        </Badge>
                    )}
                </DisplayValue>
            ) : null}
        </>
    );
}

type SaleCardProps = WithLanguageType & {
    sale: Sale;
    unitId?: string;
    unitName?: string;
    fetchId?: string;
    hideActions?: boolean;
    onDelete?: (sale?: Sale, response?: DeletedData) => void;
    onRestore?: () => void;
    sheetOnly?: boolean;
    small?: boolean;
    innerRef?: RefObject<WithAxiosLifecycleRef<Sale> | null>;
};

function SaleCard({
    sale,
    resolveLanguageKey,
    unitId,
    unitName,
    fetchId,
    hideActions = false,
    onDelete,
    onRestore,
    sheetOnly = false,
    small,
    innerRef,
}: SaleCardProps) {
    const resolvedUnitId = unitId ?? sale.unit?._id ?? "";
    const resolvedUnitDisplayName = unitName ?? sale.unit?.name ?? sale.unit?.unitNumber;

    return (
        <EntityCard
            resource="sales"
            entity={sale}
            fetchId={fetchId}
            singleUrl="/api/realEstate/unit/sale/single"
            onDelete={onDelete}
            onRestore={onRestore}
            hideActions={hideActions}
            sheetOnly={sheetOnly}
            editPath={(row) => buildSaleEditPath(row, resolvedUnitId, resolvedUnitDisplayName)}
            Sheet={SaleSheetView}
            sheetEntityProp="sale"
            deleteUrl="/api/realEstate/unit/sale"
            restoreUrl="/api/realEstate/unit/sale/restore"
            failedTitle={String(resolveLanguageKey("failedTitle"))}
            failedDescription={String(resolveLanguageKey("failedDescription"))}
            titlePath="name"
            innerRef={innerRef}
            sheetProps={() => ({
                fetchId,
                unitId: resolvedUnitId,
                unitName: resolvedUnitDisplayName,
            })}
        >
            {({entity}) => {
                const saleTitle =
                    entity.name?.trim() ||
                    [entity.unit?.name, entity.unit?.unitNumber].filter(Boolean).join(" · ") ||
                    "—";
                const hasBadges = Boolean(
                    entity.paymentType || entity.project?.name || entity.edifice?.name,
                );
                return (
                    <>
                        <EntityCard.Header
                            titlePath="name"
                            title={
                                <span className="flex items-center gap-1 truncate">
                                    {saleTitle}
                                    <CopyTooltip text={entity.name ?? saleTitle} />
                                </span>
                            }
                            badges={
                                hasBadges ? (
                                    <SaleCardBadges entity={entity} resolveLanguageKey={resolveLanguageKey} />
                                ) : undefined
                            }
                        >
                            <SaleRowMenuExtras sale={entity} />
                        </EntityCard.Header>
                        {hasBadges && (
                            <Separator className="-mx-(--density-pad) w-auto self-stretch" />
                        )}
                        <EntityCard.Body className={CARD_INFO_ROWS_TWO_COL_CLASS}>
                            <DisplayRow
                                icon={IconHome}
                                label={entity.unit?.unitType?.name ?? resolveLanguageKey("unit")}
                                tooltip={entity.unit?.unitType?.name ?? resolveLanguageKey("unit")}
                                path="unit"
                                value={entity.unit?.name ?? entity.unit?.unitNumber}
                            />
                            <DisplayRow
                                icon={IconUser}
                                label={resolveLanguageKey("soldBy")}
                                tooltip={resolveLanguageKey("soldBy")}
                                path="soldBy"
                                type="user"
                                value={entity.soldBy}
                            />
                            <DisplayRow
                                icon={IconUser}
                                label={resolveLanguageKey("buyer")}
                                tooltip={resolveLanguageKey("buyer")}
                                path="buyer"
                                type="user"
                                value={entity.buyer}
                            />
                            {!small && (
                                <>
                                    <DisplayRow
                                        icon={IconCalendarClock}
                                        label={resolveLanguageKey("saleDate")}
                                        tooltip={resolveLanguageKey("saleDate")}
                                        path="saleDate"
                                        type="date"
                                        value={entity.saleDate}
                                    />
                                    <DisplayRow
                                        icon={IconCurrencyDollar}
                                        label={resolveLanguageKey("finalPrice")}
                                        tooltip={resolveLanguageKey("finalPrice")}
                                        path="finalPrice"
                                        type="currency"
                                        value={{amount: entity.finalPrice, currency: entity.saleCurrency}}
                                    />
                                    <DisplayRow
                                        icon={IconPackage}
                                        label={resolveLanguageKey("handoverDate")}
                                        tooltip={resolveLanguageKey("handoverDate")}
                                        path="handoverDate"
                                        type="date"
                                        value={entity.handoverDate}
                                    />
                                </>
                            )}
                        </EntityCard.Body>
                    </>
                );
            }}
        </EntityCard>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/sales/center/cardView/saleCard.tsx"),
    withDebug(true, true, "sales"),
)(SaleCard);
