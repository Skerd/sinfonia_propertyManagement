import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {compose} from "redux";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {DropdownMenuItem} from "@coreModule/components/ui/dropdown-menu.tsx";
import {Gauge} from "lucide-react";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import type {ScheduleTask} from "armonia/src/modules/propertyManagement/api/realEstate/private/scheduleTask/scheduleTask.dto.ts";

export const UPDATE_PROGRESS_SCHEDULE_TASK_ACTION = "updateProgressScheduleTask";

type UpdateProgressScheduleTaskProps = WithLanguageType & {
    onAction: (action: string) => void;
    scheduleTask?: ScheduleTask;
};

function UpdateProgressScheduleTask({onAction, scheduleTask, resolveLanguageKey}: UpdateProgressScheduleTaskProps) {
    const {write} = useAccess("scheduletasks");
    const status = scheduleTask?.status ?? "planned";
    const canUpdate = !!write && !scheduleTask?.deletedAt && status !== "completed" && status !== "cancelled";

    if (!canUpdate) {
        return null;
    }

    return (
        <DropdownMenuItem onClick={() => {onAction(UPDATE_PROGRESS_SCHEDULE_TASK_ACTION);}}>
            <Gauge className="text-primary" size={16} />
            <p>{resolveLanguageKey("title")}</p>
        </DropdownMenuItem>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/scheduleTasks/center/actions/updateProgress.tsx"),
    withDebug(true, true, "scheduletasks"),
)(UpdateProgressScheduleTask);
