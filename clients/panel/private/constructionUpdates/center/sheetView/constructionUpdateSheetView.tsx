import {compose} from "redux";
import {useEffect, useState} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import type {ConstructionUpdate} from "armonia/src/modules/propertyManagement/api/realEstate/private/constructionUpdate/constructionUpdate.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import SheetViewRenderer from "@coreModule/components/viewEngine/SheetViewRenderer.tsx";
import {useViewConfig} from "@coreModule/helpers/hooks/useViewConfig.ts";

export type ConstructionUpdateSheetViewOwnProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    constructionUpdate?: ConstructionUpdate;
    hideActions?: boolean;
    onDelete?: (response?: DeletedData) => void;
    onRestore?: () => void;
    fetchId?: string;
};

function buildConstructionUpdateEditPath(update: ConstructionUpdate) {
    const params = new URLSearchParams();
    params.set("constructionUpdateId", update._id);
    if (update.name) params.set("constructionUpdateName", update.name);
    if (update.project?._id) params.set("projectId", update.project._id);
    if (update.project?.name) params.set("projectName", update.project.name);
    return `/realEstate/constructionUpdates/edit?${params.toString()}`;
}

function ConstructionUpdateSheetView({
    open,
    onOpenChange,
    constructionUpdate: updateProp,
    resolveLanguageKey,
    hideActions = false,
    onDelete = () => {},
    onRestore = () => {},
    fetchId,
}: ConstructionUpdateSheetViewOwnProps & WithLanguageType) {
    const [sheetData, setSheetData] = useState<Record<string, any>>(updateProp || {_id: fetchId});
    const access = useAccess("constructionUpdates");
    const viewConfig = useViewConfig("constructionupdates", "sheet");

    useEffect(() => {
        if (!updateProp) return;
        setSheetData(updateProp);
    }, [updateProp]);

    const entityId = updateProp?._id ?? fetchId;

    if (!viewConfig) return null;
    if (!entityId) return null;

    return (
        <SheetViewRenderer
            config={viewConfig}
            url="/api/realEstate/constructionUpdate/single"
            fetchId={fetchId}
            onDataFetched={(data) => setSheetData(data)}
            data={sheetData}
            open={open}
            onOpenChange={onOpenChange}
            resolveLanguageKey={resolveLanguageKey}
            access={access}
            hideActions={hideActions}
            onDelete={onDelete}
            onRestore={onRestore}
            editPath={buildConstructionUpdateEditPath(sheetData as ConstructionUpdate)}
        />
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/constructionUpdates/center/sheetView/constructionUpdateSheetView.tsx"),
    withDebug(true, true),
)(ConstructionUpdateSheetView);
