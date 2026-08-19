import {compose} from "redux";
import {useEffect, useState} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import type {Story} from "armonia/src/modules/propertyManagement/api/realEstate/private/story/story.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import SheetViewRenderer from "@coreModule/components/viewEngine/SheetViewRenderer.tsx";
import {useViewConfig} from "@coreModule/helpers/hooks/useViewConfig.ts";

export type StorySheetViewOwnProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    story?: Story;
    hideActions?: boolean;
    onDelete?: (response?: DeletedData) => void;
    onRestore?: () => void;
    fetchId?: string;
};

function buildStoryEditPath(story: Story) {
    const params = new URLSearchParams();
    params.set("storyId", story._id);
    if (story.name) params.set("storyName", story.name);
    if (story.project?._id) params.set("projectId", story.project._id);
    if (story.project?.name) params.set("projectName", story.project.name);
    return `/realEstate/stories/edit?${params.toString()}`;
}

function StorySheetView({
    open,
    onOpenChange,
    story: storyProp,
    resolveLanguageKey,
    hideActions = false,
    onDelete = () => {},
    onRestore = () => {},
    fetchId,
}: StorySheetViewOwnProps & WithLanguageType) {
    const [sheetData, setSheetData] = useState<Record<string, any>>(storyProp || {_id: fetchId});
    const access = useAccess("stories");
    const viewConfig = useViewConfig("stories", "sheet");

    useEffect(() => {
        if (!storyProp) return;
        setSheetData(storyProp);
    }, [storyProp]);

    const entityId = storyProp?._id ?? fetchId;

    if (!viewConfig) return null;
    if (!entityId) return null;

    return (
        <SheetViewRenderer
            config={viewConfig}
            url="/api/realEstate/story/single"
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
            editPath={buildStoryEditPath(sheetData as Story)}
        />
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/stories/center/sheetView/storySheetView.tsx"),
    withDebug(true, true, "stories"),
)(StorySheetView);
