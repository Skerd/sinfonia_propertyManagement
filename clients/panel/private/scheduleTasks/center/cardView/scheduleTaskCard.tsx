import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import HiddenElement from "@coreModule/components/custom/hiddenElement.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import TooltipDisplayer from "@coreModule/components/custom/tooltipDisplayer.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import type {ScheduleTask} from "armonia/src/modules/propertyManagement/api/realEstate/private/scheduleTask/scheduleTask.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import {Separator} from "@coreModule/components/ui/separator.tsx";
import {Badge} from "@coreModule/components/ui/badge.tsx";
import {withDeletedDrawer} from "@coreModule/helpers/hocs/withDeletedDrawer.tsx";
import InfoRow from "@coreModule/components/custom/infoRow.tsx";
import {IconCalendar, IconFolder, IconPercentage, IconUser} from "@tabler/icons-react";
import ScheduleTaskSheetView from "@propertyManagementModule/clients/panel/private/scheduleTasks/center/sheetView/scheduleTaskSheetView.tsx";
import DeleteAction from "@coreModule/components/custom/actions/deleteAction.tsx";
import RestoreAction from "@coreModule/components/custom/actions/restoreAction.tsx";
import ActionMenu from "@coreModule/components/custom/actions/menu/actionMenu.tsx";
import {useEntityCard} from "@coreModule/helpers/hooks/useEntityCard.ts";
import {EntityCardShell} from "@propertyManagementModule/components/custom/cards/EntityCardShell.tsx";
import {EntityTextCardHeader} from "@propertyManagementModule/components/custom/cards/EntityTextCardHeader.tsx";
import {CARD_BODY_CLASS, CARD_INFO_ROWS_CLASS, STATUS_BADGE_NEUTRAL} from "@propertyManagementModule/components/custom/cards/entityCard.constants.ts";
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

type ScheduleTaskCardProps = WithLanguageType & {
    scheduleTask: ScheduleTask;
    onDelete?: (deletedScheduleTask?: ScheduleTask, response?: DeletedData) => void;
    onRestore?: () => void;
    onActionSuccess?: (updated?: ScheduleTask) => void;
    hideActions?: boolean;
};

function buildEditPath(scheduleTask: ScheduleTask) {
    const params = new URLSearchParams();
    params.set("scheduleTaskId", scheduleTask._id);
    if (scheduleTask.name) params.set("scheduleTaskName", scheduleTask.name);
    if (scheduleTask.project?._id) params.set("projectId", scheduleTask.project._id);
    if (scheduleTask.project?.name) params.set("projectName", scheduleTask.project.name);
    return `/realEstate/scheduleTasks/edit?${params.toString()}`;
}

function formatDate(value?: string) {
    if (!value) return undefined;
    try {
        return new Date(value).toLocaleDateString();
    } catch {
        return value;
    }
}

function getStatusLabel(resolveLanguageKey: (key: string) => unknown, status?: string) {
    if (!status) return undefined;
    return resolveLanguageKey(`fields.!enums.status.${status}`) as string;
}

function ScheduleTaskCard({
    scheduleTask: scheduleTaskProp,
    resolveLanguageKey,
    onDelete: onDeleteProp,
    onRestore: onRestoreProp,
    onActionSuccess,
    hideActions = false,
}: ScheduleTaskCardProps) {
    const {action, setAction, entity: scheduleTask, setEntity, hideAfterDeletion, onDelete, onRestore} = useEntityCard({
        entityProp: scheduleTaskProp,
        onDeleteProp,
        onRestoreProp,
    });

    const handleActionSuccess = (updated?: ScheduleTask) => {
        if (updated) setEntity(updated);
        onActionSuccess?.(updated);
        setAction("");
    };

    const {read, write, restore} = useAccess("scheduletasks");

    if (hideAfterDeletion || !restore) {
        return <></>;
    }
    if (!read || !Object.keys(read).length) {
        return <HiddenElement />;
    }

    const editPath = buildEditPath(scheduleTask);

    return (
        <>
            <EntityCardShell onClick={() => setAction("view")}>
                <EntityTextCardHeader
                    title={scheduleTask.title}
                    subtitle={scheduleTask.name}
                    badges={<>
                            {!!read?.status && !!scheduleTask.status && (
                                <TooltipDisplayer tooltip={resolveLanguageKey("statusLabel") as string}>
                                    <Badge variant="secondary" className={cn("text-xs", STATUS_BADGE_NEUTRAL)}>
                                        {getStatusLabel(resolveLanguageKey, scheduleTask.status)}
                                    </Badge>
                                </TooltipDisplayer>
                            )}
                        </>
                    }
                    showTitle={!!read?.title}
                    showSubtitle={!!read?.name}
                    showBadges={!!read?.status}
                    hideActions={hideActions}
                    actionMenu={
                        <ActionMenu
                            accessModel="scheduletasks"
                            deletedData={scheduleTask}
                            onAction={(a: string) => setAction(a)}
                            editPath={editPath}
                            allowMenuForCustomChildren={!!write && !scheduleTask.deletedAt}
                        >
                            <StartScheduleTask scheduleTask={scheduleTask} onAction={(a: string) => setAction(a)} />
                            <CompleteScheduleTask scheduleTask={scheduleTask} onAction={(a: string) => setAction(a)} />
                            <UpdateProgressScheduleTask scheduleTask={scheduleTask} onAction={(a: string) => setAction(a)} />
                            <MarkDelayedScheduleTask scheduleTask={scheduleTask} onAction={(a: string) => setAction(a)} />
                            <CancelScheduleTask scheduleTask={scheduleTask} onAction={(a: string) => setAction(a)} />
                        </ActionMenu>
                    }
                />
                <Separator />
                <div className={CARD_BODY_CLASS}>
                    <div className={CARD_INFO_ROWS_CLASS}>
                        <InfoRow
                            icon={IconFolder}
                            label={resolveLanguageKey("fields.project")}
                            show={!!read?.project}
                            value={scheduleTask.project?.name}
                        />
                        <InfoRow
                            icon={IconUser}
                            label={resolveLanguageKey("fields.assignee")}
                            show={!!read?.assignee && !!scheduleTask.assignee}
                            value={scheduleTask.assignee?.name}
                        />
                        <InfoRow
                            icon={IconCalendar}
                            label={resolveLanguageKey("fields.plannedEnd")}
                            show={!!read?.plannedEnd && !!scheduleTask.plannedEnd}
                            value={formatDate(scheduleTask.plannedEnd)}
                        />
                        <InfoRow
                            icon={IconPercentage}
                            label={resolveLanguageKey("fields.percentComplete")}
                            show={!!read?.percentComplete && typeof scheduleTask.percentComplete === "number"}
                            value={typeof scheduleTask.percentComplete === "number" ? `${scheduleTask.percentComplete}%` : undefined}
                        />
                    </div>
                </div>
            </EntityCardShell>

            {!!action && (
                <>
                    {action === "view" && (
                        <ScheduleTaskSheetView
                            open={action === "view"}
                            onOpenChange={() => setAction("")}
                            scheduleTask={scheduleTask}
                            onDelete={onDelete}
                            onRestore={onRestore}
                        />
                    )}
                    {action === "delete" && (
                        <DeleteAction
                            accessModel="scheduletasks"
                            deleteId={scheduleTask._id}
                            openAlert={action === "delete"}
                            name={read?.title && scheduleTask.title}
                            confirmName={read?.title && scheduleTask.title}
                            onSuccess={onDelete}
                            onCancel={() => setAction("")}
                            url="/api/realEstate/scheduleTask"
                        />
                    )}
                    {action === "restore" && (
                        <RestoreAction
                            accessModel="scheduletasks"
                            deleteId={scheduleTask._id}
                            openAlert={action === "restore"}
                            name={read?.title && scheduleTask.title}
                            confirmName={read?.title && scheduleTask.title}
                            onSuccess={onRestore}
                            onCancel={() => setAction("")}
                            url="/api/realEstate/scheduleTask/restore"
                        />
                    )}
                    {action === START_SCHEDULE_TASK_ACTION && (
                        <StartScheduleTaskDialog open onClose={() => setAction("")} scheduleTask={scheduleTask} onSuccess={handleActionSuccess} />
                    )}
                    {action === COMPLETE_SCHEDULE_TASK_ACTION && (
                        <CompleteScheduleTaskDialog open onClose={() => setAction("")} scheduleTask={scheduleTask} onSuccess={handleActionSuccess} />
                    )}
                    {action === UPDATE_PROGRESS_SCHEDULE_TASK_ACTION && (
                        <UpdateProgressScheduleTaskDialog open onClose={() => setAction("")} scheduleTask={scheduleTask} onSuccess={handleActionSuccess} />
                    )}
                    {action === MARK_DELAYED_SCHEDULE_TASK_ACTION && (
                        <MarkDelayedScheduleTaskDialog open onClose={() => setAction("")} scheduleTask={scheduleTask} onSuccess={handleActionSuccess} />
                    )}
                    {action === CANCEL_SCHEDULE_TASK_ACTION && (
                        <CancelScheduleTaskDialog open onClose={() => setAction("")} scheduleTask={scheduleTask} onSuccess={handleActionSuccess} />
                    )}
                </>
            )}
        </>
    );
}

export default compose(
    (Component: any) => withDeletedDrawer(Component, (props: any) => props.scheduleTask),
    withLanguage("src/modules/propertyManagement/clients/panel/private/scheduleTasks/center/cardView/scheduleTaskCard.tsx"),
    withDebug(true, true),
)(ScheduleTaskCard);
