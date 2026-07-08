import Inspections from "@propertyManagementModule/clients/panel/private/units/center/actions/inspections.tsx";
import UnitCostsAction from "@propertyManagementModule/clients/panel/private/units/center/actions/unitCosts.tsx";
import ModificationRequests from "@propertyManagementModule/clients/panel/private/units/center/actions/modificationRequests.tsx";
import Reservations from "@propertyManagementModule/clients/panel/private/units/center/actions/reservations.tsx";
import Sales from "@propertyManagementModule/clients/panel/private/units/center/actions/sales.tsx";
import MarketingBooklet from "@propertyManagementModule/clients/panel/private/units/center/actions/marketingBooklet.tsx";

export type UnitDomainMenuItemsProps = {
    unitId: string;
    /** Shown in filter URLs where applicable */
    unitName?: string;
};

/**
 * Domain dropdown entries for units (before ActionMenu View/Edit/Delete/Restore).
 */
export function UnitDomainMenuItems({ unitId, unitName }: UnitDomainMenuItemsProps) {
    const label = unitName ?? unitId;
    return (
        <>
            <Inspections unitId={unitId} unitName={label} />
            <UnitCostsAction unitId={unitId} unitName={label} />
            <ModificationRequests unitId={unitId} unitName={label} />
            <Reservations unitId={unitId} unitName={label} />
            <Sales unitId={unitId} unitName={label} />
            <MarketingBooklet unitId={unitId} unitName={label} />
        </>
    );
}
