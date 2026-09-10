import {DropdownMenuSeparator} from "@coreModule/components/ui/dropdown-menu.tsx";
import Inspections from "@propertyManagementModule/clients/panel/private/units/center/actions/inspections.tsx";
import UnitCostsAction from "@propertyManagementModule/clients/panel/private/units/center/actions/unitCosts.tsx";
import ModificationRequests from "@propertyManagementModule/clients/panel/private/units/center/actions/modificationRequests.tsx";
import Reservations from "@propertyManagementModule/clients/panel/private/units/center/actions/reservations.tsx";
import Sales from "@propertyManagementModule/clients/panel/private/units/center/actions/sales.tsx";
import MarketingBooklet from "@propertyManagementModule/clients/panel/private/units/center/actions/marketingBooklet.tsx";
import UnitRowMenuExtras from "@propertyManagementModule/clients/panel/private/units/center/actions/unitRowMenuExtras.tsx";
import {Unit} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/unit/unit.dto.ts";

export type UnitDomainMenuItemsProps = {
    unit: Unit;
    onAction: (action: string) => void;
};

/**
 * Domain dropdown entries for units (before ActionMenu View/Edit/Delete/Restore).
 */
export function UnitDomainMenuItems({ unit, onAction }: UnitDomainMenuItemsProps) {
    const label = unit.name || unit.unitNumber || unit._id;
    return (
        <>
            <Inspections unitId={unit._id} unitName={label} />
            <UnitCostsAction unitId={unit._id} unitName={label} />
            <ModificationRequests unitId={unit._id} unitName={label} />
            <Reservations unitId={unit._id} unitName={label} />
            <Sales unitId={unit._id} unitName={label} />
            <MarketingBooklet unitId={unit._id} unitName={label} />
            <DropdownMenuSeparator />
            <UnitRowMenuExtras unit={unit} onAction={onAction} />
        </>
    );
}
