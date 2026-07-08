import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import {Floor} from "armonia/src/modules/propertyManagement/api/realEstate/private/floor/floor.dto.ts";
import type {DeleteResponse} from "armonia/src/modules/core/types/shared.types.ts";
import ViewUnits from "@propertyManagementModule/clients/panel/private/floors/center/actions/viewUnits.tsx";
import ViewUnitsOverlay from "@propertyManagementModule/clients/panel/private/floors/center/actions/viewUnitsOverlay.tsx";
import {useViewConfig} from "@coreModule/helpers/hooks/useViewConfig.ts";
import SheetViewRenderer from "@coreModule/components/viewEngine/SheetViewRenderer.tsx";
import {useEffect, useState} from "react";
import UnitsOverlay from "@propertyManagementModule/components/custom/floors/unitsOverlay.tsx";
import {buildFloorEditPath} from "@propertyManagementModule/clients/panel/private/floors";

export type FloorSheetViewOwnProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    /** Full row from list/card, or bootstrap from SmallInfoCard while `/single` loads. */
    floor?: Floor;
    hideActions?: boolean;
    onDelete?: (response?: DeleteResponse) => void;
    onRestore?: () => void;
    isRestored?: boolean;
    fetchId?: string;
};

function FloorSheetView({
    open,
    onOpenChange,
    floor: floorProp,
    resolveLanguageKey,
    hideActions = false,
    onDelete = () => {},
    onRestore = () => {},
    fetchId,
}: FloorSheetViewOwnProps & WithLanguageType) {

    const [sheetData, setSheetData] = useState<Record<string, any>>(floorProp || {_id: fetchId});
    const access = useAccess("floors");
    const {read: readUnits} = useAccess("units");
    const viewConfig = useViewConfig("floors", "sheet");
    const [unitOverlayAction, setUnitOverlayAction] = useState("");

    useEffect(() => {
        if (!open) {
            setUnitOverlayAction("");
        }
    }, [open]);

    useEffect(() => {
        if (!floorProp) return;
        setSheetData(floorProp);
    }, [floorProp]);

    const asFloor = sheetData as Floor;
    const entityId = floorProp?._id ?? fetchId;

    if (!viewConfig) return null;
    if (!entityId) return null;

    return (
        <>
            <SheetViewRenderer
                config={viewConfig}
                url="/api/realEstate/floor/single"
                fetchId={fetchId ?? floorProp?._id}
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
                editPath={buildFloorEditPath(asFloor)}
                actionMenuAllowCustomChildren={!!readUnits}
                actionMenuChildren={
                    <>
                        <ViewUnits floor={asFloor} />
                        <ViewUnitsOverlay onAction={(action: string) => {setUnitOverlayAction(action);}} />
                    </>
                }
            />

            {unitOverlayAction === "viewUnitsOverlay" && (
                <UnitsOverlay
                    floorMainImageId={asFloor.mainImage?._id ?? ""}
                    floorName={asFloor.name}
                    unitsCoordinates={asFloor.unitsCoordinates}
                    openUnitOverlay={unitOverlayAction === "viewUnitsOverlay"}
                    onClose={() => setUnitOverlayAction("")}
                />
            )}
        </>
    );
}

const ComposedFloorSheetView = compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/floors/center/sheetView/floorSheetView.tsx"),
    withDebug(true, true),
)(FloorSheetView);

export default ComposedFloorSheetView;
