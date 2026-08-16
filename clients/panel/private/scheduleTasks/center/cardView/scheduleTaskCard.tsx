import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import TooltipDisplayer from "@coreModule/components/custom/tooltipDisplayer.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import type {ScheduleTask} from "armonia/src/modules/propertyManagement/api/realEstate/private/scheduleTask/scheduleTask.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import {Badge} from "@coreModule/components/ui/badge.tsx";
import {IconCalendar, IconFolder, IconPercentage, IconUser} from "@tabler/icons-react";
import ScheduleTaskSheetView from "@propertyManagementModule/clients/panel/private/scheduleTasks/center/sheetView/scheduleTaskSheetView.tsx";
import {STATUS_BADGE_NEUTRAL} from "@propertyManagementModule/components/custom/cards/entityCard.constants.ts";
import StartScheduleTask, {START_SCHEDULE_TASK_ACTION} from "@propertyManagementModule/clients/panel/private/scheduleTasks/center/actions/start.tsx";
import CompleteScheduleTask, {COMPLETE_SCHEDULE_TASK_ACTION} from "@propertyManagementModule/clients/panel/private/scheduleTasks/center/actions/complete.tsx";
import UpdateProgressScheduleTask, {UPDATE_PROGRESS_SCHEDULE_TASK_ACTION} from "@propertyManagementModule/clients/panel/private/scheduleTasks/center/actions/updateProgress.tsx";
import MarkDelayedScheduleTask, {MARK_DELAYED_SCHEDULE_TASK_ACTION} from "@propertyManagementModule/clients/panel/private/scheduleTasks/center/actions/markDelayed.tsx";
import CancelScheduleTask, {CANCEL_SCHEDULE_TASK_ACTION} from "@propertyManagementModule/clients/panel/private/scheduleTasks/center/actions/cancel.tsx";
import StartScheduleTaskDialog from "@propertyManagementModule/components/custom/scheduleTasks/startScheduleTaskDialog.tsx";
import CompleteScheduleTaskDialog from "@propertyManagementModule/components/custom/scheduleTasks/completeScheduleTaskDialog.tsx";
import UpdateProgressScheduleTaskDialog from "@propertyManagementModule/components/custom/scheduleTasks/updateProgressScheduleTaskDialog.tsx";
import MarkDelayedScheduleTaskDialog from "@propertyManagementModule/components/custom/scheduleTasks/markDelayedScheduleTaskDialog.tsx";
import CancelScheduleTaskDialog from "@propertyManagementModule/components/custom/scheduleTasks/cancelScheduleTaskDialog.tsx";
import DisplayRow from "@coreModule/components/custom/displayValue/displayRow.tsx";
import DisplayValue from "@coreModule/components/custom/displayValue/displayValue.tsx";
import EntityCard from "@coreModule/components/custom/systemCards/entityCard.tsx";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {ReactNode, RefObject} from "react";

type ScheduleTaskCardProps = WithLanguageType & {
    scheduleTask: ScheduleTask;
    fetchId?: string;
    hideActions?: boolean;
    onDelete?: (deletedScheduleTask?: ScheduleTask, response?: DeletedData) => void;
    onRestore?: () => void;
    onActionSuccess?: (updated?: ScheduleTask) => void;
    sheetOnly?: boolean;
    innerRef?: RefObject<WithAxiosLifecycleRef<ScheduleTask> | null>;
};

function buildEditPath(scheduleTask: ScheduleTask) {
    const params = new URLSearchParams();
    params.set("scheduleTaskId", scheduleTask._id);
    if (scheduleTask.name) params.set("scheduleTaskName", scheduleTask.name);
    if (scheduleTask.project?._id) params.set("projectId", scheduleTask.project._id);
    if (scheduleTask.project?.name) params.set("projectName", scheduleTask.project.name);
    return `/realEstate/scheduleTasks/edit?${params.toString()}`;
}

function ScheduleTaskCard({
    scheduleTask,
    resolveLanguageKey,
    fetchId,
    hideActions = false,
    onDelete,
    onRestore,
    onActionSuccess,
    sheetOnly = false,
    innerRef,
}: ScheduleTaskCardProps) {
    return (
        <EntityCard
            resource="scheduletasks"
            entity={scheduleTask}
            fetchId={fetchId}
            singleUrl="/api/realEstate/scheduleTask/single"
            onDelete={onDelete}
            onRestore={onRestore}
            hideActions={hideActions}
            sheetOnly={sheetOnly}
            editPath={buildEditPath}
            Sheet={ScheduleTaskSheetView}
            sheetEntityProp="scheduleTask"
            deleteUrl="/api/realEstate/scheduleTask"
            restoreUrl="/api/realEstate/scheduleTask/restore"
            failedTitle={String(resolveLanguageKey("failedTitle") || "")}
            failedDescription={String(resolveLanguageKey("failedDescription") || "")}
            titlePath="title"
            innerRef={innerRef}
            sheetProps={() => ({fetchId})}
            extraDialogs={({action, setAction, entity, setEntity}) => {
                const handleSuccess = (updated?: ScheduleTask) => {
                    if (updated) setEntity({...entity, ...updated});
                    onActionSuccess?.(updated);
                    setAction("");
                };
                return (
                    <>
                        {action === START_SCHEDULE_TASK_ACTION && (
                            <StartScheduleTaskDialog open onClose={() => setAction("")} scheduleTask={entity} onSuccess={handleSuccess} />
                        )}
                        {action === COMPLETE_SCHEDULE_TASK_ACTION && (
                            <CompleteScheduleTaskDialog open onClose={() => setAction("")} scheduleTask={entity} onSuccess={handleSuccess} />
                        )}
                        {action === UPDATE_PROGRESS_SCHEDULE_TASK_ACTION && (
                            <UpdateProgressScheduleTaskDialog open onClose={() => setAction("")} scheduleTask={entity} onSuccess={handleSuccess} />
                        )}
                        {action === MARK_DELAYED_SCHEDULE_TASK_ACTION && (
                            <MarkDelayedScheduleTaskDialog open onClose={() => setAction("")} scheduleTask={entity} onSuccess={handleSuccess} />
                        )}
                        {action === CANCEL_SCHEDULE_TASK_ACTION && (
                            <CancelScheduleTaskDialog open onClose={() => setAction("")} scheduleTask={entity} onSuccess={handleSuccess} />
                        )}
                    </>
                );
            }}
        >
            {({entity, setAction}) => (
                <>
                    <EntityCard.Header
                        titlePath="title"
                        title={entity.title}
                        subtitle={entity.name}
                        subtitlePath="name"
                        badges={
                            entity.status ? (
                                <DisplayValue
                                    path="status"
                                    type="enum"
                                    languageKeyCategory="fields.!enums.status"
                                    value={entity.status}
                                >
                                    {(formatted: ReactNode) => (
                                        <TooltipDisplayer tooltip={resolveLanguageKey("statusLabel") as string}>
                                            <Badge variant="secondary" className={cn("text-xs", STATUS_BADGE_NEUTRAL)}>
                                                {formatted}
                                            </Badge>
                                        </TooltipDisplayer>
                                    )}
                                </DisplayValue>
                            ) : undefined
                        }
                    >
                        <StartScheduleTask scheduleTask={entity} onAction={setAction} />
                        <CompleteScheduleTask scheduleTask={entity} onAction={setAction} />
                        <UpdateProgressScheduleTask scheduleTask={entity} onAction={setAction} />
                        <MarkDelayedScheduleTask scheduleTask={entity} onAction={setAction} />
                        <CancelScheduleTask scheduleTask={entity} onAction={setAction} />
                    </EntityCard.Header>
                    <EntityCard.Body>
                        <DisplayRow
                            icon={IconFolder}
                            label={resolveLanguageKey("fields.project")}
                            tooltip={resolveLanguageKey("fields.project")}
                            path="project"
                            value={entity.project?.name}
                        />
                        <DisplayRow
                            icon={IconUser}
                            label={resolveLanguageKey("fields.assignee")}
                            tooltip={resolveLanguageKey("fields.assignee")}
                            path="assignee"
                            type="user"
                            value={entity.assignee}
                        />
                        <DisplayRow
                            icon={IconCalendar}
                            label={resolveLanguageKey("fields.plannedEnd")}
                            tooltip={resolveLanguageKey("fields.plannedEnd")}
                            path="plannedEnd"
                            type="date"
                            value={entity.plannedEnd}
                        />
                        <DisplayRow
                            icon={IconPercentage}
                            label={resolveLanguageKey("fields.percentComplete")}
                            tooltip={resolveLanguageKey("fields.percentComplete")}
                            path="percentComplete"
                            type="number"
                            value={entity.percentComplete}
                        />
                    </EntityCard.Body>
                </>
            )}
        </EntityCard>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/scheduleTasks/center/cardView/scheduleTaskCard.tsx"),
    withDebug(true, true),
)(ScheduleTaskCard);
