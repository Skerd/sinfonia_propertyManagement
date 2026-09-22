import {compose} from "redux";
import {useEffect, useState} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hooks/useAccess.ts";
import type {ConstructionProgress} from "armonia/src/modules/propertyManagement/api/realEstate/private/constructionProgress/constructionProgress.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import SheetViewRenderer from "@coreModule/components/viewEngine/SheetViewRenderer.tsx";
import ConstructionProgressRowMenuExtras from "@propertyManagementModule/clients/panel/private/constructionProgress/center/actions/constructionProgressRowMenuExtras.tsx";
import {useViewConfig} from "@coreModule/helpers/hooks/useViewConfig.ts";

export type ConstructionProgressSheetViewOwnProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    constructionProgress?: ConstructionProgress;
    hideActions?: boolean;
    onDelete?: (response?: DeletedData) => void;
    onRestore?: () => void;
    fetchId?: string;
};

function buildConstructionProgressEditPath(update: ConstructionProgress) {
    const params = new URLSearchParams();
    params.set("constructionProgressId", update._id);
    if (update.name) params.set("constructionProgressName", update.name);
    if (update.project?._id) params.set("projectId", update.project._id);
    if (update.project?.name) params.set("projectName", update.project.name);
    return `/realEstate/constructionProgress/edit?${params.toString()}`;
}

function ConstructionProgressSheetView({
    open,
    onOpenChange,
    constructionProgress: updateProp,
    resolveLanguageKey,
    hideActions = false,
    onDelete = () => {},
    onRestore = () => {},
    fetchId,
}: ConstructionProgressSheetViewOwnProps & WithLanguageType) {
    const [sheetData, setSheetData] = useState<Record<string, any>>(updateProp || {_id: fetchId});
    const access = useAccess("constructionprogresses");
    const viewConfig = useViewConfig("constructionprogresses", "sheet");

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
            url="/api/realEstate/constructionProgress/single"
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
            editPath={buildConstructionProgressEditPath(sheetData as ConstructionProgress)}
            actionMenuChildren={<ConstructionProgressRowMenuExtras constructionProgress={sheetData as ConstructionProgress} />}
        />
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/constructionProgress/center/sheetView/constructionProgressSheetView.tsx"),
    withDebug(true, true, "constructionprogresses"),
)(ConstructionProgressSheetView);
