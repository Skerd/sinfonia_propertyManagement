import {useAccess} from "@coreModule/helpers/hooks/useAccess.ts";
import {Unit} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/unit/unit.dto.ts";
import {UnitStatus} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/unit/unit.constants.ts";
import MarkUnavailable from "@propertyManagementModule/clients/panel/private/units/center/actions/markUnavailable.tsx";
import MarkAvailable from "@propertyManagementModule/clients/panel/private/units/center/actions/markAvailable.tsx";

type UnitRowMenuExtrasProps = {
    unit: Unit;
    onAction: (action: string) => void;
};

/** Custom `ActionMenu` children for unit status (Mark unavailable / Mark available). */
export default function UnitRowMenuExtras({unit, onAction}: UnitRowMenuExtrasProps) {
    const {write} = useAccess("units");
    const writeFields = (typeof write === "object" && write !== null ? write : {}) as Record<string, unknown>;
    const canWriteAll = write === true;
    const canWriteStatus = canWriteAll || writeFields.status !== undefined;
    const canWriteNotes = canWriteAll || writeFields.unavailableNotes !== undefined;
    const isModelDeleted = unit.deletedAt != null || unit.deletedBy != null;

    const showMarkUnavailable = canWriteStatus && !isModelDeleted && unit.status === UnitStatus.AVAILABLE && canWriteNotes;
    const showMarkAvailable = canWriteStatus && !isModelDeleted && unit.status === UnitStatus.UNAVAILABLE;

    if (!showMarkUnavailable && !showMarkAvailable) return null;

    return (
        <>
            {showMarkUnavailable && <MarkUnavailable onAction={onAction} />}
            {showMarkAvailable && <MarkAvailable onAction={onAction} />}
        </>
    );
}
