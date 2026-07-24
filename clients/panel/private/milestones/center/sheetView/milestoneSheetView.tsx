import {compose} from "redux";
import {useEffect, useState} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import type {Milestone} from "armonia/src/modules/propertyManagement/api/realEstate/private/milestone/milestone.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import SheetViewRenderer from "@coreModule/components/viewEngine/SheetViewRenderer.tsx";
import {useViewConfig} from "@coreModule/helpers/hooks/useViewConfig.ts";

export type MilestoneSheetViewOwnProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    milestone?: Milestone;
    hideActions?: boolean;
    onDelete?: (response?: DeletedData) => void;
    onRestore?: () => void;
    fetchId?: string;
};

function buildMilestoneEditPath(milestone: Milestone) {
    const params = new URLSearchParams();
    params.set("milestoneId", milestone._id);
    if (milestone.name) params.set("milestoneName", milestone.name);
    if (milestone.project?._id) params.set("projectId", milestone.project._id);
    if (milestone.project?.name) params.set("projectName", milestone.project.name);
    return `/realEstate/milestones/edit?${params.toString()}`;
}

function MilestoneSheetView({
    open,
    onOpenChange,
    milestone: milestoneProp,
    resolveLanguageKey,
    hideActions = false,
    onDelete = () => {},
    onRestore = () => {},
    fetchId,
}: MilestoneSheetViewOwnProps & WithLanguageType) {
    const [sheetData, setSheetData] = useState<Record<string, any>>(milestoneProp || {_id: fetchId});
    const access = useAccess("milestones");
    const viewConfig = useViewConfig("milestones", "sheet");

    useEffect(() => {
        if (!milestoneProp) return;
        setSheetData(milestoneProp);
    }, [milestoneProp]);

    const entityId = milestoneProp?._id ?? fetchId;

    if (!viewConfig) return null;
    if (!entityId) return null;

    return (
        <SheetViewRenderer
            config={viewConfig}
            url="/api/realEstate/milestone/single"
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
            editPath={buildMilestoneEditPath(sheetData as Milestone)}
        />
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/milestones/center/sheetView/milestoneSheetView.tsx"),
    withDebug(true, true),
)(MilestoneSheetView);
