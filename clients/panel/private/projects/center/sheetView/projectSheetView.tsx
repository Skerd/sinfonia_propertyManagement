import {compose} from "redux";
import {useEffect, useState} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import {Project} from "armonia/src/modules/propertyManagement/api/realEstate/private/project/project.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import ViewEdifices from "@propertyManagementModule/clients/panel/private/projects/center/actions/viewEdifices.tsx";
import ViewEdificesOverlay from "@propertyManagementModule/clients/panel/private/projects/center/actions/viewEdificesOverlay.tsx";
import EdificesOverlay from "@propertyManagementModule/components/custom/projects/edificesOverlay.tsx";
import ViewFloorsOverlay from "@propertyManagementModule/clients/panel/private/projects/center/actions/viewFloorsOverlay.tsx";
import ProjectFloorsOverlay from "@propertyManagementModule/components/custom/projects/projectFloorsOverlay.tsx";
import SheetViewRenderer from "@coreModule/components/viewEngine/SheetViewRenderer.tsx";
import {useViewConfig} from "@coreModule/helpers/hooks/useViewConfig.ts";

export type ProjectSheetViewOwnProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    /** Full row from list/card, or bootstrap from DisplayCard while `/single` loads. */
    project?: Project;
    hideActions?: boolean;
    onDelete?: (response?: DeletedData) => void;
    onRestore?: () => void;
    isRestored?: boolean;
    fetchId?: string;
};

function ProjectSheetView({
    open,
    onOpenChange,
    project: projectProp,
    resolveLanguageKey,
    hideActions = false,
    onDelete = () => {},
    onRestore = () => {},
    fetchId,
}: ProjectSheetViewOwnProps & WithLanguageType) {

    const [sheetData, setSheetData] = useState< Record<string, any>>(projectProp || {_id: fetchId});
    const access = useAccess("projects");
    const {read: readEdifices} = useAccess("edifices");
    const [edificesOverlayAction, setEdificesOverlayAction] = useState("");
    const [floorsOverlayAction, setFloorsOverlayAction] = useState("");
    const viewConfig = useViewConfig("projects", "sheet");

    useEffect(() => {
        if (!open) {
            setEdificesOverlayAction("");
            setFloorsOverlayAction("");
        }
    }, [open]);

    useEffect(() => {
        if( !projectProp ) return;
        setSheetData(projectProp);
    }, [projectProp]);

    const entityId = projectProp?._id ?? fetchId;

    const editPath = (() => {
        if (!entityId) return "";
        const params = new URLSearchParams();
        params.set("projectId", entityId);
        const nm = projectProp?.name;
        if (nm) params.set("projectName", nm);
        return `/realEstate/projects/edit?${params.toString()}`;
    })();

    if (!viewConfig) return null;
    if (!entityId) return null;

    return (
        <>
            <SheetViewRenderer
                config={viewConfig}
                url="/api/realEstate/project/single"
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
                editPath={editPath}
                actionMenuAllowCustomChildren={!!readEdifices}
                actionMenuChildren={
                    <>
                        <ViewEdifices project={sheetData} />
                        <ViewEdificesOverlay onAction={(a: string) => { setEdificesOverlayAction(a); }} />
                        <ViewFloorsOverlay onAction={(a: string) => { setFloorsOverlayAction(a); }} />
                    </>
                }
            />
            {edificesOverlayAction === "viewEdificesOverlay" && (
                <EdificesOverlay
                    project={sheetData}
                    openEdificesOverlay={edificesOverlayAction === "viewEdificesOverlay"}
                    onClose={() => { setEdificesOverlayAction(""); }}
                />
            )}
            {floorsOverlayAction === "viewFloorsOverlay" && (
                <ProjectFloorsOverlay
                    project={sheetData}
                    openFloorsOverlay={floorsOverlayAction === "viewFloorsOverlay"}
                    onClose={() => { setFloorsOverlayAction(""); }}
                />
            )}
        </>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/projects/center/sheetView/projectSheetView.tsx"),
    withDebug(true, true, ["projects", "edifices"]),
)(ProjectSheetView);
