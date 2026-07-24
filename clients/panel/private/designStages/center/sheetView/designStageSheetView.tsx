import {compose} from "redux";
import {useEffect, useState} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import type {DesignStage} from "armonia/src/modules/propertyManagement/api/realEstate/private/designStage/designStage.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import SheetViewRenderer from "@coreModule/components/viewEngine/SheetViewRenderer.tsx";
import {useViewConfig} from "@coreModule/helpers/hooks/useViewConfig.ts";

type Props = WithLanguageType & {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    entity?: DesignStage;
    hideActions?: boolean;
    onDelete?: (response?: DeletedData) => void;
    onRestore?: () => void;
    fetchId?: string;
};

function Sheet({open, onOpenChange, entity, resolveLanguageKey, hideActions = false, onDelete = () => {}, onRestore = () => {}, fetchId}: Props) {
    const [sheetData, setSheetData] = useState<Record<string, any>>(entity || {_id: fetchId});
    const access = useAccess("designstages");
    const viewConfig = useViewConfig("designstages", "sheet");
    useEffect(() => { if (entity) setSheetData(entity); }, [entity]);
    const entityId = entity?._id ?? fetchId;
    if (!viewConfig || !entityId) return null;
    const params = new URLSearchParams();
    params.set("designStageId", String(entityId));
    return (
        <SheetViewRenderer
            config={viewConfig}
            url="/api/realEstate/designStage/single"
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
            editPath={`/realEstate/designStages/edit?${params.toString()}`}
        />
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/designStages/center/sheetView/designStageSheetView.tsx"),
    withDebug(true, true),
)(Sheet);
