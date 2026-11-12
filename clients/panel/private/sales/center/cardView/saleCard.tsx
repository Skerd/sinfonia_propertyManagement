import {compose} from "redux";
import withLanguage, {type ResolveLanguageKey, WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import {Sale} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/sale/sale.dto.ts";
import {IconCalendarClock, IconCurrencyDollar, IconHome} from "@tabler/icons-react";
import SaleSheetView, {buildSaleEditPath, saleBuyerName} from "@propertyManagementModule/clients/panel/private/sales/center/sheetView/saleSheetView.tsx";
import SaleRowMenuExtras from "@propertyManagementModule/clients/panel/private/sales/center/actions/saleRowMenuExtras.tsx";
import SaleHandoverDialogs from "@propertyManagementModule/components/custom/sales/saleHandoverDialogs.tsx";
import EntityCardRow from "@coreModule/components/entityPage/list/card/entityCardRow.tsx";
import DisplayValue from "@coreModule/components/viewEngine/widgets/display/displayValue.tsx";
import EntityCard from "@coreModule/components/entityPage/list/card/entityCard.tsx";
import {Badge} from "@coreModule/components/ui/badge.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import {
    STATUS_BADGE_INFO,
    STATUS_BADGE_NEUTRAL,
    STATUS_BADGE_SUCCESS,
} from "@coreModule/components/entityPage/list/entityCard.constants.ts";
import StatusBadge from "@coreModule/components/entityPage/sheet/statusBadge.tsx";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {RefObject} from "react";

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

type SaleCardProps = WithLanguageType & {
    sale: Sale;
    unitId?: string;
    unitName?: string;
    fetchId?: string;
    hideActions?: boolean;
    onDelete?: (sale?: Sale, response?: DeletedData) => void;
    onRestore?: () => void;
    onModifySuccess?: (updated?: Sale) => void;
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
    onModifySuccess,
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
            failedTitle={resolveLanguageKey("failedTitle")}
            failedDescription={resolveLanguageKey("failedDescription")}
            titlePath="name"
            innerRef={innerRef}
            sheetProps={({entity, setEntity}) => ({
                fetchId,
                unitId: resolvedUnitId,
                unitName: resolvedUnitDisplayName,
                onModifySuccess: (updated?: Sale) => {
                    if (updated) setEntity({...entity, ...updated});
                    onModifySuccess?.(updated);
                },
            })}
            extraDialogs={({action, setAction, entity, setEntity}) => (
                <SaleHandoverDialogs
                    action={action}
                    sale={entity}
                    onClose={() => setAction("")}
                    onSaleSuccess={(updated) => {
                        if (updated) setEntity({...entity, ...updated});
                        onModifySuccess?.(updated);
                        setAction("");
                    }}
                />
            )}
        >
            {({entity, setAction}) => (
                <>
                    <EntityCard.Header
                        titlePath={["buyer", "buyerCompany", "name"]}
                        title={saleBuyerName(entity) || entity.name || "—"}
                        subtitlePath="name"
                        // The code goes beside a name, never twice when there is no buyer to name it by.
                        subtitle={saleBuyerName(entity) ? entity.name : undefined}
                        badgesBesideTitle
                        badges={
                            <>
                                <StatusBadge
                                    tableConfigKey="sales"
                                    field="approvalStatus"
                                    value={entity.approvalStatus}
                                    label={String(resolveLanguageKey(`approvalStatuses.${entity.approvalStatus}`))}
                                />
                                {entity.paymentType ? (
                                    <DisplayValue path="paymentType" value={entity.paymentType}>
                                        {() => (
                                            <Badge variant="outline" className={cn("text-xs", paymentTypeBadgeClass(entity.paymentType))}>
                                                {paymentTypeLabel(entity.paymentType, resolveLanguageKey)}
                                            </Badge>
                                        )}
                                    </DisplayValue>
                                ) : null}
                            </>
                        }
                    >
                        <SaleRowMenuExtras sale={entity} onAction={setAction} />
                    </EntityCard.Header>
                    {/* Who → when → how much (UX-02); the buyer is the title and the state a badge. */}
                    <EntityCard.Body>
                        <EntityCardRow
                            icon={IconHome}
                            label={entity.unit?.unitType?.name ?? resolveLanguageKey("unit")}
                            tooltip={entity.unit?.unitType?.name ?? resolveLanguageKey("unit")}
                            path="unit"
                            value={entity.unit?.name ?? entity.unit?.unitNumber}
                        />
                        <EntityCardRow
                            icon={IconCalendarClock}
                            label={resolveLanguageKey("saleDate")}
                            tooltip={resolveLanguageKey("saleDate")}
                            path="saleDate"
                            type="date"
                            value={entity.saleDate}
                        />
                        {!small && (
                            <EntityCardRow
                                icon={IconCurrencyDollar}
                                label={resolveLanguageKey("finalPrice")}
                                tooltip={resolveLanguageKey("finalPrice")}
                                path="finalPrice"
                                type="currency"
                                value={{amount: entity.finalPrice, currency: entity.saleCurrency}}
                            />
                        )}
                    </EntityCard.Body>
                </>
            )}
        </EntityCard>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/sales/center/cardView/saleCard.tsx"),
    withDebug(true, true, "sales"),
)(SaleCard);
