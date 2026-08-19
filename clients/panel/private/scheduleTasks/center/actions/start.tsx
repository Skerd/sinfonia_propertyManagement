import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {compose} from "redux";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {DropdownMenuItem} from "@coreModule/components/ui/dropdown-menu.tsx";
import {Play} from "lucide-react";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import type {ScheduleTask} from "armonia/src/modules/propertyManagement/api/realEstate/private/scheduleTask/scheduleTask.dto.ts";

export const START_SCHEDULE_TASK_ACTION = "startScheduleTask";

type StartScheduleTaskProps = WithLanguageType & {
    onAction: (action: string) => void;
    scheduleTask?: ScheduleTask;
};

function StartScheduleTask({onAction, scheduleTask, resolveLanguageKey}: StartScheduleTaskProps) {
    const {write} = useAccess("scheduletasks");
    const status = scheduleTask?.status ?? "planned";
    const canStart = !!write && !scheduleTask?.deletedAt && status === "planned";

    if (!canStart) {
        return null;
    }

    return (
        <DropdownMenuItem onClick={() => {onAction(START_SCHEDULE_TASK_ACTION);}}>
            <Play className="text-primary" size={16} />
            <p>{resolveLanguageKey("title")}</p>
        </DropdownMenuItem>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/scheduleTasks/center/actions/start.tsx"),
    withDebug(true, true, "scheduletasks"),
)(StartScheduleTask);
