import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {compose} from "redux";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {DropdownMenuItem} from "@coreModule/components/ui/dropdown-menu.tsx";
import {AlertTriangle} from "lucide-react";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import type {ScheduleTask} from "armonia/src/modules/propertyManagement/api/realEstate/private/scheduleTask/scheduleTask.dto.ts";

export const MARK_DELAYED_SCHEDULE_TASK_ACTION = "markDelayedScheduleTask";

type MarkDelayedScheduleTaskProps = WithLanguageType & {
    onAction: (action: string) => void;
    scheduleTask?: ScheduleTask;
};

function MarkDelayedScheduleTask({onAction, scheduleTask, resolveLanguageKey}: MarkDelayedScheduleTaskProps) {
    const {write} = useAccess("scheduletasks");
    const status = scheduleTask?.status ?? "planned";
    const canMark = !!write && !scheduleTask?.deletedAt && (status === "planned" || status === "in_progress");

    if (!canMark) {
        return null;
    }

    return (
        <DropdownMenuItem onClick={() => {onAction(MARK_DELAYED_SCHEDULE_TASK_ACTION);}}>
            <AlertTriangle className="text-primary" size={16} />
            <p>{resolveLanguageKey("title")}</p>
        </DropdownMenuItem>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/scheduleTasks/center/actions/markDelayed.tsx"),
    withDebug(true, true),
)(MarkDelayedScheduleTask);
