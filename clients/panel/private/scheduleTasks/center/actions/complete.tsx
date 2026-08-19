import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {compose} from "redux";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {DropdownMenuItem} from "@coreModule/components/ui/dropdown-menu.tsx";
import {CheckCircle2} from "lucide-react";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import type {ScheduleTask} from "armonia/src/modules/propertyManagement/api/realEstate/private/scheduleTask/scheduleTask.dto.ts";

export const COMPLETE_SCHEDULE_TASK_ACTION = "completeScheduleTask";

type CompleteScheduleTaskProps = WithLanguageType & {
    onAction: (action: string) => void;
    scheduleTask?: ScheduleTask;
};

function CompleteScheduleTask({onAction, scheduleTask, resolveLanguageKey}: CompleteScheduleTaskProps) {
    const {write} = useAccess("scheduletasks");
    const status = scheduleTask?.status ?? "planned";
    const canComplete = !!write && !scheduleTask?.deletedAt && (status === "in_progress" || status === "delayed");

    if (!canComplete) {
        return null;
    }

    return (
        <DropdownMenuItem onClick={() => {onAction(COMPLETE_SCHEDULE_TASK_ACTION);}}>
            <CheckCircle2 className="text-primary" size={16} />
            <p>{resolveLanguageKey("title")}</p>
        </DropdownMenuItem>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/scheduleTasks/center/actions/complete.tsx"),
    withDebug(true, true, "scheduletasks"),
)(CompleteScheduleTask);
