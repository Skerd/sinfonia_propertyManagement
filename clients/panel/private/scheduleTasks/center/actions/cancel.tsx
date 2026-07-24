import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {compose} from "redux";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {DropdownMenuItem} from "@coreModule/components/ui/dropdown-menu.tsx";
import {XCircle} from "lucide-react";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import type {ScheduleTask} from "armonia/src/modules/propertyManagement/api/realEstate/private/scheduleTask/scheduleTask.dto.ts";

export const CANCEL_SCHEDULE_TASK_ACTION = "cancelScheduleTask";

type CancelScheduleTaskProps = WithLanguageType & {
    onAction: (action: string) => void;
    scheduleTask?: ScheduleTask;
};

function CancelScheduleTask({onAction, scheduleTask, resolveLanguageKey}: CancelScheduleTaskProps) {
    const {write} = useAccess("scheduletasks");
    const status = scheduleTask?.status ?? "planned";
    const canCancel = !!write && !scheduleTask?.deletedAt && status !== "completed" && status !== "cancelled";

    if (!canCancel) {
        return null;
    }

    return (
        <DropdownMenuItem onClick={() => {onAction(CANCEL_SCHEDULE_TASK_ACTION);}}>
            <XCircle className="text-primary" size={16} />
            <p>{resolveLanguageKey("title")}</p>
        </DropdownMenuItem>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/scheduleTasks/center/actions/cancel.tsx"),
    withDebug(true, true),
)(CancelScheduleTask);
