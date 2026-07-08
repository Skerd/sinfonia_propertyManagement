import {compose} from "redux";
import {useEffect, useState} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import {Edifice} from "armonia/src/modules/propertyManagement/api/realEstate/private/edifice/edifice.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import ViewFloors from "@propertyManagementModule/clients/panel/private/edifices/center/actions/viewFloors.tsx";
import ViewFloorsOverlay from "@propertyManagementModule/clients/panel/private/edifices/center/actions/viewFloorsOverlay.tsx";
import GenerateFloorsUnits from "@propertyManagementModule/clients/panel/private/edifices/center/actions/generateFloorsUnits.tsx";
import FloorsOverlay from "@propertyManagementModule/components/custom/edifices/floorsOverlay.tsx";
import GenerateFloorsUnitsDialog from "@propertyManagementModule/components/custom/edifices/generateFloorsUnitsDialog.tsx";
import SheetViewRenderer from "@coreModule/components/viewEngine/SheetViewRenderer.tsx";
import {useViewConfig} from "@coreModule/helpers/hooks/useViewConfig.ts";
import {buildEdificeEditPath} from "@propertyManagementModule/clients/panel/private/edifices";

export type EdificeSheetViewOwnProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    /** Full row or bootstrap from `#SmallInfoCard` while `/single` loads. */
    edifice?: Edifice;
    projectId?: string;
    projectName?: string;
    hideActions?: boolean;
    onDelete?: (response?: DeletedData) => void;
    onRestore?: () => void;
    onSheetRowPatched?: (row: Record<string, unknown>) => void;
    fetchId?: string;
};

function EdificeSheetView({
    open,
    onOpenChange,
    edifice: edificeProp,
    resolveLanguageKey,
    projectId,
    projectName,
    hideActions = false,
    onDelete = () => {},
    onRestore = () => {},
    onSheetRowPatched,
    fetchId,
}: EdificeSheetViewOwnProps & WithLanguageType) {
    const access = useAccess("edifices");
    const {read: readFloors} = useAccess("floors");
    const viewConfig = useViewConfig("edifices", "sheet");
    const [sheetData, setSheetData] = useState<Record<string, unknown>>(edificeProp || {_id: fetchId});
    const [action, setAction] = useState("");

    useEffect(() => {
        if (!open) {
            setAction("");
        }
    }, [open]);

    useEffect(() => {
        if (!edificeProp) return;
        setSheetData(edificeProp);
    }, [edificeProp]);

    const asEdifice = sheetData as Edifice;
    const entityId = edificeProp?._id ?? fetchId;
    const resolvedProjectId = projectId ?? (typeof asEdifice.project === "object" && asEdifice.project ? asEdifice.project._id : undefined);
    const resolvedProjectName = projectName ?? (typeof asEdifice.project === "object" && asEdifice.project ? asEdifice.project.name : undefined);

    if (!viewConfig) return null;
    if (!entityId) return null;

    return (
        <>
            <SheetViewRenderer
                config={viewConfig}
                data={sheetData}
                url="/api/realEstate/edifice/single"
                fetchId={fetchId ?? edificeProp?._id}
                onDataFetched={(data) => setSheetData(data)}
                open={open}
                onOpenChange={onOpenChange}
                resolveLanguageKey={resolveLanguageKey}
                access={access}
                hideActions={hideActions}
                onDelete={onDelete}
                onRestore={onRestore}
                editPath={buildEdificeEditPath(asEdifice)}
                onSheetRowPatched={(row) => {
                    setSheetData(row);
                    onSheetRowPatched?.(row);
                }}
                actionMenuAllowCustomChildren={!!readFloors}
                actionMenuChildren={
                    <>
                        <ViewFloors
                            edifice={asEdifice}
                            projectId={resolvedProjectId}
                            projectName={resolvedProjectName}
                        />
                        <ViewFloorsOverlay onAction={(a: string) => setAction(a)} />
                        <GenerateFloorsUnits onAction={(a: string) => setAction(a)} />
                    </>
                }
            />
            {action === "viewFloorOverlay" && (
                <FloorsOverlay
                    projectMainImageId={asEdifice.project?.mainImage?._id}
                    edificeName={asEdifice.name}
                    floorsCoordinates={asEdifice.floorsCoordinates}
                    openFloorOverlay={true}
                    onClose={() => setAction("")}
                />
            )}
            {action === "generateFloorsUnits" && (
                <GenerateFloorsUnitsDialog
                    open={true}
                    onClose={() => setAction("")}
                    edificeId={asEdifice._id}
                    projectId={
                        typeof asEdifice.project === "object" && asEdifice.project
                            ? asEdifice.project._id
                            : String(asEdifice.project ?? "")
                    }
                />
            )}
        </>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/edifices/center/sheetView/edificeSheetView.tsx"),
    withDebug(true, true),
)(EdificeSheetView);
