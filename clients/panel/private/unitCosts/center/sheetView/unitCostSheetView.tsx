import { compose } from "redux";
import { useEffect, useState } from "react";
import withLanguage, { WithLanguageType } from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hooks/useAccess.ts";
import { useViewConfig } from "@coreModule/helpers/hooks/useViewConfig.ts";
import SheetViewRenderer from "@coreModule/components/viewEngine/SheetViewRenderer.tsx";
import type { UnitCost } from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/unitCost/unitCost.dto.ts";
import type { DeleteResponse } from "armonia/src/modules/core/types/shared.types.ts";
import { buildUnitCostEditPath } from "@propertyManagementModule/clients/panel/private/unitCosts/unitCostEditPath.ts";
import UnitCostInvoicePdfActionMenuItem from "@propertyManagementModule/components/custom/unitCosts/unitCostInvoicePdfActionMenuItem.tsx";
import SheetNameTitle from "@coreModule/components/entityPage/sheet/sheetNameTitle.tsx";
import StatusBadge from "@coreModule/components/entityPage/sheet/statusBadge.tsx";
import type {ResolveLanguageKey} from "@coreModule/helpers/hocs/withLanguage.tsx";

export type UnitCostSheetViewOwnProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    unitCost?: UnitCost;
    unitId?: string;
    unitName?: string;
    hideActions?: boolean;
    onDelete?: (response?: DeleteResponse) => void;
    onRestore?: () => void;
    fetchId?: string;
};

/** What a unit cost is called (D151): its vendor, else its tag, else its unit; empty when none is readable. */
export function unitCostTitle(cost: UnitCost): string {
    return cost.vendorName || cost.tag || cost.unit?.name || (cost.unit?.unitNumber != null ? String(cost.unit.unitNumber) : "");
}

/** The verification and the payment state, each in its tone (UX-02). Both dictionaries carry the enum labels. */
export function UnitCostStatusBadges({cost, resolveLanguageKey}: {cost: UnitCost; resolveLanguageKey: ResolveLanguageKey}) {
    return (
        <>
            <StatusBadge
                tableConfigKey="unitcosts"
                field="verificationStatus"
                value={cost.verificationStatus}
                label={String(resolveLanguageKey(`unitCostVerification.${cost.verificationStatus}`))}
            />
            <StatusBadge
                tableConfigKey="unitcosts"
                field="paymentStatus"
                value={cost.paymentStatus}
                label={String(resolveLanguageKey(`unitCostPayment.${cost.paymentStatus}`))}
            />
        </>
    );
}

function UnitCostSheetView({
    open,
    onOpenChange,
    unitCost: unitCostProp,
    resolveLanguageKey,
    unitId: unitIdProp,
    unitName: unitNameProp,
    hideActions = false,
    onDelete,
    onRestore,
    fetchId,
}: UnitCostSheetViewOwnProps & WithLanguageType) {
    const access = useAccess("unitCosts");
    const viewConfig = useViewConfig("unitcosts", "sheet");
    const read = access.read && typeof access.read === "object" ? access.read : {};
    const [sheetData, setSheetData] = useState<Record<string, any>>(unitCostProp || { _id: fetchId });

    useEffect(() => {
        if (!unitCostProp) return;
        setSheetData(unitCostProp);
    }, [unitCostProp]);

    const entityId = unitCostProp?._id ?? fetchId;
    const asCost = sheetData as UnitCost;
    const resolvedUnitId = unitIdProp ?? asCost.unit?._id ?? "";
    const resolvedUnitName =
        unitNameProp ??
        asCost.unit?.name ??
        (asCost.unit?.unitNumber != null ? String(asCost.unit.unitNumber) : "");

    const deleteRestoreConfirmLabel = read.name && asCost.name ? asCost.name : undefined;

    const editPath =
        resolvedUnitId && entityId ? buildUnitCostEditPath(asCost, resolvedUnitId, resolvedUnitName) : "";

    if (!viewConfig) return null;
    if (!entityId) return null;

    return (
        <SheetViewRenderer
            config={viewConfig}
            url="/api/realEstate/unit/cost/single"
            fetchId={fetchId}
            onDataFetched={(data) => {
                setSheetData(data);
            }}
            data={sheetData}
            open={open}
            onOpenChange={onOpenChange}
            resolveLanguageKey={resolveLanguageKey}
            // Named by its vendor (else tag, else unit), the code as a badge and both states in tone (UX-01, UX-02, D151).
            headerTitle={<SheetNameTitle name={unitCostTitle(asCost)} code={asCost.name} typeLabel={String(resolveLanguageKey("unitCost"))} />}
            headerDescription={<UnitCostStatusBadges cost={asCost} resolveLanguageKey={resolveLanguageKey} />}
            access={access}
            hideActions={hideActions}
            onDelete={onDelete}
            onRestore={onRestore}
            editPath={editPath}
            deleteRestoreConfirmLabel={deleteRestoreConfirmLabel}
            referenceCardUnitContext={{ unitId: resolvedUnitId, unitName: resolvedUnitName }}
            actionMenuChildren={<UnitCostInvoicePdfActionMenuItem entity={sheetData as Record<string, unknown>} />}
        />
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/unitCosts/center/sheetView/unitCostSheetView.tsx"),
    withDebug(true, true, "unitCosts"),
)(UnitCostSheetView);
