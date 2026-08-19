import {compose} from "redux";
import {useEffect, useState} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import {StoryType} from "armonia/src/modules/propertyManagement/api/realEstate/private/storyType/storyType.dto.ts";
import type {DeleteResponse} from "armonia/src/modules/core/types/shared.types.ts";
import {useViewConfig} from "@coreModule/helpers/hooks/useViewConfig.ts";
import SheetViewRenderer from "@coreModule/components/viewEngine/SheetViewRenderer.tsx";

export type StoryTypeSheetViewOwnProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    /** Full row from list/card, or bootstrap from DisplayCard while `/single` loads. */
    storyType?: StoryType;
    hideActions?: boolean;
    onDelete?: (response?: DeleteResponse) => void;
    onRestore?: () => void;
    isRestored?: boolean;
    fetchId?: string;
};

function storyTypeEditPath(st: StoryType) {
    const params = new URLSearchParams();
    params.set("storyTypeId", st._id);
    if (st.name) params.set("storyTypeName", st.name);
    return `/tenancy/systemSettings/storyTypes/edit?${params.toString()}`;
}

function StoryTypeSheetView({
    open,
    onOpenChange,
    storyType: storyTypeProp,
    resolveLanguageKey,
    hideActions = false,
    onDelete = () => {},
    onRestore = () => {},
    fetchId,
}: StoryTypeSheetViewOwnProps & WithLanguageType) {
    const [sheetData, setSheetData] = useState<Record<string, any>>(storyTypeProp || {_id: fetchId});
    const access = useAccess("storyTypes");
    const viewConfig = useViewConfig("storytypes", "sheet");

    useEffect(() => {
        if (!storyTypeProp) return;
        setSheetData(storyTypeProp);
    }, [storyTypeProp]);

    const entityId = storyTypeProp?._id ?? fetchId;

    if (!viewConfig) return null;
    if (!entityId) return null;

    return (
        <SheetViewRenderer
            config={viewConfig}
            url="/api/realEstate/storyType/single"
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
            editPath={storyTypeEditPath(sheetData as StoryType)}
        />
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/storyTypes/center/sheetView/storyTypeSheetView.tsx"),
    withDebug(true, true, "storyTypes"),
)(StoryTypeSheetView);
