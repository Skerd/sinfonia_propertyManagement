import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {IconCalendar, IconCashBanknote, IconDoor, IconReceipt, IconUser} from "@tabler/icons-react";
import type {UnitCost} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/unitCost/unitCost.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import CopyTooltip from "@coreModule/components/custom/copyTooltip.tsx";
import UnitCostSheetView, {
    UnitCostStatusBadges,
    unitCostTitle,
} from "@propertyManagementModule/clients/panel/private/unitCosts/center/sheetView/unitCostSheetView.tsx";
import {buildUnitCostEditPath} from "@propertyManagementModule/clients/panel/private/unitCosts/unitCostEditPath.ts";
import UnitCostInvoicePdfActionMenuItem from "@propertyManagementModule/components/custom/unitCosts/unitCostInvoicePdfActionMenuItem.tsx";
import EntityCardRow from "@coreModule/components/entityPage/list/card/entityCardRow.tsx";
import EntityCard from "@coreModule/components/entityPage/list/card/entityCard.tsx";
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
            failedTitle={resolveLanguageKey("failedTitle")}
            failedDescription={resolveLanguageKey("failedDescription")}
            titlePath="name"
            innerRef={innerRef}
            shellClassName={small ? "text-sm" : undefined}
            sheetProps={() => ({
                fetchId,
                unitId: resolvedUnitId,
                unitName: resolvedUnitName,
            })}
        >
            {({entity}) => {
                const title = unitCostTitle(entity);
                const unitName = entity.unit?.name || (entity.unit?.unitNumber != null ? String(entity.unit.unitNumber) : "");
                return (
                    <>
                        {/* Named by its vendor (else tag, else unit), the code beside it, both states as badges (UX-01, UX-02, D151). */}
                        <EntityCard.Header
                            titlePath={["vendorName", "tag", "unit"]}
                            title={
                                <span className="flex items-center gap-1 truncate">
                                    {title || entity.name}
                                    {title ? null : <CopyTooltip text={entity.name} />}
                                </span>
                            }
                            subtitlePath="name"
                            subtitle={title ? entity.name : undefined}
                            icon={<IconReceipt className="h-5 w-5 text-muted-foreground" />}
                            badges={<UnitCostStatusBadges cost={entity} resolveLanguageKey={resolveLanguageKey} />}
                        >
                            <UnitCostInvoicePdfActionMenuItem entity={entity as Record<string, unknown>} />
                        </EntityCard.Header>
                        {/* Where → when → how much → who bought it (UX-02). */}
                        <EntityCard.Body>
                            {unitName && unitName !== title ? (
                                <EntityCardRow
                                    icon={IconDoor}
                                    label={resolveLanguageKey("unit")}
                                    tooltip={resolveLanguageKey("unit")}
                                    path="unit"
                                    value={unitName}
                                />
                            ) : null}
                            <EntityCardRow
                                icon={IconCalendar}
                                label={resolveLanguageKey("purchaseDate")}
                                tooltip={resolveLanguageKey("purchaseDate")}
                                path="purchaseDate"
                                type="date"
                                value={entity.purchaseDate}
                            />
                            <EntityCardRow
                                icon={IconCashBanknote}
                                label={resolveLanguageKey("documentSubtotal")}
                                tooltip={resolveLanguageKey("documentSubtotal")}
                                path="expenditureItems"
                                type="currency"
                                value={{amount: entity.documentSubtotal, currency: entity.currency}}
                            />
                            {!small && (
                                <EntityCardRow
                                    icon={IconUser}
                                    label={resolveLanguageKey("purchasePerson")}
                                    tooltip={resolveLanguageKey("purchasePerson")}
                                    path="purchasePerson"
                                    type="user"
                                    value={entity.purchasePerson}
                                />
                            )}
                        </EntityCard.Body>
                    </>
                );
            }}
        </EntityCard>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/unitCosts/center/cardView/unitCostCard.tsx"),
    withDebug(true, true, "unitCosts"),
)(UnitCostCard);
