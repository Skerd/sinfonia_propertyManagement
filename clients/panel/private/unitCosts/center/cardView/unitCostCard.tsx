import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {IconBuilding, IconCalendar, IconCashBanknote, IconReceipt, IconTag, IconTool, IconUser} from "@tabler/icons-react";
import type {UnitCost} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/unitCost/unitCost.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import CopyTooltip from "@coreModule/components/custom/copyTooltip.tsx";
import UnitCostSheetView from "@propertyManagementModule/clients/panel/private/unitCosts/center/sheetView/unitCostSheetView.tsx";
import {buildUnitCostEditPath} from "@propertyManagementModule/clients/panel/private/unitCosts/unitCostEditPath.ts";
import UnitCostInvoicePdfActionMenuItem from "@propertyManagementModule/components/custom/unitCosts/unitCostInvoicePdfActionMenuItem.tsx";
import DisplayRow from "@coreModule/components/custom/displayValue/displayRow.tsx";
import EntityCard from "@coreModule/components/custom/systemCards/entityCard.tsx";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {RefObject} from "react";

type UnitCostCardProps = WithLanguageType & {
    unitCost: UnitCost;
    unitId: string;
    unitName: string;
    fetchId?: string;
    hideActions?: boolean;
    onDelete?: (unitCost: UnitCost, response: DeletedData) => void;
    onRestore?: () => void;
    sheetOnly?: boolean;
    small?: boolean;
    innerRef?: RefObject<WithAxiosLifecycleRef<UnitCost> | null>;
};

function UnitCostCard({
    unitCost,
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
}: UnitCostCardProps) {
    const resolvedUnitId = unitId || unitCost.unit?._id || "";
    const resolvedUnitName =
        unitName || unitCost.unit?.name || (unitCost.unit?.unitNumber != null ? String(unitCost.unit.unitNumber) : "");

    return (
        <EntityCard
            resource="unitCosts"
            entity={unitCost}
            fetchId={fetchId}
            singleUrl="/api/realEstate/unit/cost/single"
            onDelete={onDelete}
            onRestore={onRestore}
            hideActions={hideActions}
            sheetOnly={sheetOnly}
            editPath={(row) => buildUnitCostEditPath(row, resolvedUnitId, resolvedUnitName)}
            Sheet={UnitCostSheetView}
            sheetEntityProp="unitCost"
            deleteUrl="/api/realEstate/unit/cost"
            restoreUrl="/api/realEstate/unit/cost/restore"
            failedTitle={String(resolveLanguageKey("failedTitle"))}
            failedDescription={String(resolveLanguageKey("failedDescription"))}
            titlePath="name"
            innerRef={innerRef}
            shellClassName={small ? "text-sm" : undefined}
            sheetProps={() => ({
                fetchId,
                unitId: resolvedUnitId,
                unitName: resolvedUnitName,
            })}
        >
            {({entity}) => (
                <>
                    <EntityCard.Header
                        titlePath="name"
                        title={
                            <span className="flex items-center gap-1 truncate">
                                {entity.name}
                                {entity.invoiceNumber ? (
                                    <span className="shrink-0 text-xs font-normal text-muted-foreground">
                                        #{entity.invoiceNumber}
                                    </span>
                                ) : null}
                                <CopyTooltip text={entity.name} />
                            </span>
                        }
                        icon={<IconReceipt className="h-5 w-5 text-muted-foreground" />}
                    >
                        <UnitCostInvoicePdfActionMenuItem entity={entity as Record<string, unknown>} />
                    </EntityCard.Header>
                    <EntityCard.Body>
                        <DisplayRow
                            icon={IconTag}
                            label={resolveLanguageKey("verificationStatus")}
                            tooltip={resolveLanguageKey("verificationStatus")}
                            path="verificationStatus"
                            type="enum"
                            languageKeyCategory="unitCostVerification"
                            value={entity.verificationStatus || "pending_verification"}
                        />
                        <DisplayRow
                            icon={IconCashBanknote}
                            label={resolveLanguageKey("paymentStatus")}
                            tooltip={resolveLanguageKey("paymentStatus")}
                            path="paymentStatus"
                            type="enum"
                            languageKeyCategory="unitCostPayment"
                            value={entity.paymentStatus || "unpaid"}
                        />
                        {!small && (
                            <>
                                <DisplayRow
                                    icon={IconCalendar}
                                    label={resolveLanguageKey("purchaseDate")}
                                    tooltip={resolveLanguageKey("purchaseDate")}
                                    path="purchaseDate"
                                    type="date"
                                    value={entity.purchaseDate}
                                />
                                <DisplayRow
                                    icon={IconUser}
                                    label={resolveLanguageKey("purchasePerson")}
                                    tooltip={resolveLanguageKey("purchasePerson")}
                                    path="purchasePerson"
                                    type="user"
                                    value={entity.purchasePerson}
                                />
                                <DisplayRow
                                    icon={IconBuilding}
                                    label={resolveLanguageKey("vendorName")}
                                    tooltip={resolveLanguageKey("vendorName")}
                                    path="vendorName"
                                    value={entity.vendorName}
                                />
                                <DisplayRow
                                    icon={IconTool}
                                    label={resolveLanguageKey("relatedModificationRequest")}
                                    tooltip={resolveLanguageKey("relatedModificationRequest")}
                                    path="relatedModificationRequest.name"
                                    value={entity.relatedModificationRequest?.name}
                                />
                                <DisplayRow
                                    icon={IconCashBanknote}
                                    label={resolveLanguageKey("documentSubtotal")}
                                    tooltip={resolveLanguageKey("documentSubtotal")}
                                    path="documentSubtotal"
                                    type="currency"
                                    value={{amount: entity.documentSubtotal, currency: entity.currency}}
                                />
                            </>
                        )}
                    </EntityCard.Body>
                </>
            )}
        </EntityCard>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/unitCosts/center/cardView/unitCostCard.tsx"),
    withDebug(true, true),
)(UnitCostCard);
