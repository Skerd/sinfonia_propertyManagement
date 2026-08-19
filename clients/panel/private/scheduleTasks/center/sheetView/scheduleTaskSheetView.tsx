import {compose} from "redux";
import {useEffect, useState} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import type {ScheduleTask} from "armonia/src/modules/propertyManagement/api/realEstate/private/scheduleTask/scheduleTask.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import SheetViewRenderer from "@coreModule/components/viewEngine/SheetViewRenderer.tsx";
import {useViewConfig} from "@coreModule/helpers/hooks/useViewConfig.ts";

export type ScheduleTaskSheetViewOwnProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    scheduleTask?: ScheduleTask;
    hideActions?: boolean;
    onDelete?: (response?: DeletedData) => void;
    onRestore?: () => void;
    fetchId?: string;
};

function buildScheduleTaskEditPath(scheduleTask: ScheduleTask) {
    const params = new URLSearchParams();
    params.set("scheduleTaskId", scheduleTask._id);
    if (scheduleTask.name) params.set("scheduleTaskName", scheduleTask.name);
    if (scheduleTask.project?._id) params.set("projectId", scheduleTask.project._id);
    if (scheduleTask.project?.name) params.set("projectName", scheduleTask.project.name);
    return `/realEstate/scheduleTasks/edit?${params.toString()}`;
}

function ScheduleTaskSheetView({
    open,
    onOpenChange,
    scheduleTask: scheduleTaskProp,
    resolveLanguageKey,
    hideActions = false,
    onDelete = () => {},
    onRestore = () => {},
    fetchId,
}: ScheduleTaskSheetViewOwnProps & WithLanguageType) {
    const [sheetData, setSheetData] = useState<Record<string, any>>(scheduleTaskProp || {_id: fetchId});
    const access = useAccess("scheduletasks");
    const viewConfig = useViewConfig("scheduletasks", "sheet");

    useEffect(() => {
        if (!scheduleTaskProp) return;
        setSheetData(scheduleTaskProp);
    }, [scheduleTaskProp]);

    const entityId = scheduleTaskProp?._id ?? fetchId;

    if (!viewConfig) return null;
    if (!entityId) return null;

    return (
        <SheetViewRenderer
            config={viewConfig}
            url="/api/realEstate/scheduleTask/single"
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
            editPath={buildScheduleTaskEditPath(sheetData as ScheduleTask)}
        />
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/scheduleTasks/center/sheetView/scheduleTaskSheetView.tsx"),
    withDebug(true, true, "scheduletasks"),
)(ScheduleTaskSheetView);
