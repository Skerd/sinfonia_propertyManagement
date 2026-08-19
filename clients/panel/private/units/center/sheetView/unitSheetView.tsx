import {compose} from "redux";
import {useEffect, useState} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import {Unit} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/unit/unit.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import {UnitDomainMenuItems} from "@propertyManagementModule/clients/panel/private/units/center/actions/unitDomainMenuItems.tsx";
import {buildUnitEditPath, unitDeleteConfirmLabel} from "@propertyManagementModule/clients/panel/private/units/unitNavigation.ts";
import SheetViewRenderer from "@coreModule/components/viewEngine/SheetViewRenderer.tsx";
import {useViewConfig} from "@coreModule/helpers/hooks/useViewConfig.ts";

export type UnitSheetViewOwnProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    /** Full row or bootstrap from `#DisplayCard` while `/single` loads. */
    unit?: Unit;
    hideActions?: boolean;
    onDelete?: (response?: DeletedData) => void;
    onRestore?: () => void;
    onSheetRowPatched?: (row: Record<string, unknown>) => void;
    fetchId?: string;
};

function UnitSheetView({
    open,
    onOpenChange,
    unit: unitProp,
    resolveLanguageKey,
    hideActions = false,
    onDelete = () => {},
    onRestore = () => {},
    onSheetRowPatched,
    fetchId,
}: UnitSheetViewOwnProps & WithLanguageType) {
    const access = useAccess("units");
    const viewConfig = useViewConfig("units", "sheet");
    const [sheetData, setSheetData] = useState<Record<string, unknown>>(unitProp || {_id: fetchId});

    useEffect(() => {
        if (!unitProp) return;
        setSheetData(unitProp);
    }, [unitProp]);

    const asUnit = sheetData as Unit;
    const entityId = unitProp?._id ?? fetchId;
    const domainUnitName = asUnit.name || asUnit.unitNumber || asUnit._id;
    const deleteLabel = unitDeleteConfirmLabel(access.read as Record<string, unknown> | undefined, asUnit);

    if (!viewConfig) return null;
    if (!entityId) return null;

    return (
        <SheetViewRenderer
            config={viewConfig}
            data={sheetData}
            url="/api/realEstate/unit/single"
            fetchId={fetchId ?? unitProp?._id}
            onDataFetched={(data) => setSheetData(data)}
            open={open}
            onOpenChange={onOpenChange}
            resolveLanguageKey={resolveLanguageKey}
            access={access}
            hideActions={hideActions}
            onDelete={onDelete}
            onRestore={onRestore}
            editPath={buildUnitEditPath(asUnit)}
            deleteRestoreConfirmLabel={deleteLabel}
            onSheetRowPatched={(row) => {
                setSheetData(row);
                onSheetRowPatched?.(row);
            }}
            actionMenuAllowCustomChildren={true}
            actionMenuChildren={
                <UnitDomainMenuItems unitId={asUnit._id} unitName={domainUnitName} />
            }
        />
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/units/center/sheetView/unitSheetView.tsx"),
    withDebug(true, true, "units"),
)(UnitSheetView);
