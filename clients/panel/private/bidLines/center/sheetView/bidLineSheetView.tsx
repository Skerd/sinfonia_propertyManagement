import {compose} from "redux";
import {useEffect, useState} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import type {BidLine} from "armonia/src/modules/propertyManagement/api/realEstate/private/bidLine/bidLine.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import SheetViewRenderer from "@coreModule/components/viewEngine/SheetViewRenderer.tsx";
import {useViewConfig} from "@coreModule/helpers/hooks/useViewConfig.ts";

type Props = WithLanguageType & {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    entity?: BidLine;
    hideActions?: boolean;
    onDelete?: (response?: DeletedData) => void;
    onRestore?: () => void;
    fetchId?: string;
};

function Sheet({open, onOpenChange, entity, resolveLanguageKey, hideActions = false, onDelete = () => {}, onRestore = () => {}, fetchId}: Props) {
    const [sheetData, setSheetData] = useState<Record<string, any>>(entity || {_id: fetchId});
    const access = useAccess("bidlines");
    const viewConfig = useViewConfig("bidlines", "sheet");
    useEffect(() => { if (entity) setSheetData(entity); }, [entity]);
    const entityId = entity?._id ?? fetchId;
    if (!viewConfig || !entityId) return null;
    const params = new URLSearchParams();
    params.set("bidLineId", String(entityId));
    return (
        <SheetViewRenderer
            config={viewConfig}
            url="/api/realEstate/bidLine/single"
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
            editPath={`/realEstate/bidLines/edit?${params.toString()}`}
        />
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/bidLines/center/sheetView/bidLineSheetView.tsx"),
    withDebug(true, true),
)(Sheet);
