import { compose } from "redux";
import { useEffect, useState } from "react";
import withLanguage, { WithLanguageType } from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import { useAccess } from "@coreModule/helpers/hocs/withAccess.tsx";
import { UnitType } from "armonia/src/modules/propertyManagement/api/realEstate/private/unitType/unitType.dto.ts";
import type { DeleteResponse } from "armonia/src/modules/core/types/shared.types.ts";
import { useViewConfig } from "@coreModule/helpers/hooks/useViewConfig.ts";
import SheetViewRenderer from "@coreModule/components/viewEngine/SheetViewRenderer.tsx";

export type UnitTypeSheetViewOwnProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    /** Full row from list/card, or bootstrap from DisplayCard while `/single` loads. */
    unitType?: UnitType;
    hideActions?: boolean;
    onDelete?: (response?: DeleteResponse) => void;
    onRestore?: () => void;
    isRestored?: boolean;
    fetchId?: string;
};

function unitTypeEditPath(ut: UnitType) {
    const params = new URLSearchParams();
    params.set("unitTypeId", ut._id);
    if (ut.name) params.set("unitTypeName", ut.name);
    return `/tenancy/systemSettings/unitTypes/edit?${params.toString()}`;
}

function UnitTypeSheetView({
    open,
    onOpenChange,
    unitType: unitTypeProp,
    resolveLanguageKey,
    hideActions = false,
    onDelete = () => {},
    onRestore = () => {},
    fetchId,
}: UnitTypeSheetViewOwnProps & WithLanguageType) {
    const [sheetData, setSheetData] = useState<Record<string, any>>(unitTypeProp || {_id: fetchId});
    const access = useAccess("unitTypes");
    const viewConfig = useViewConfig("unittypes", "sheet");

    useEffect(() => {
        if (!unitTypeProp) return;
        setSheetData(unitTypeProp);
    }, [unitTypeProp]);

    const entityId = unitTypeProp?._id ?? fetchId;

    if (!viewConfig) return null;
    if (!entityId) return null;

    return (
        <SheetViewRenderer
            config={viewConfig}
            url="/api/realEstate/unitType/single"
            fetchId={fetchId}
            onDataFetched={(data) => {
                setSheetData(data);
            }}
            data={sheetData}
            open={open}
            onOpenChange={onOpenChange}
            resolveLanguageKey={resolveLanguageKey}
            access={access}
            hideActions={hideActions}
            onDelete={onDelete}
            onRestore={onRestore}
            editPath={unitTypeEditPath(sheetData as UnitType)}
        />
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/unitTypes/center/sheetView/unitTypeSheetView.tsx"),
    withDebug(true, true, "unitTypes"),
)(UnitTypeSheetView);
