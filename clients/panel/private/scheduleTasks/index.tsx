import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage from "@coreModule/components/entityPage/EntityListPage.tsx";
import {GRID_TRANSACTIONAL} from "@propertyManagementModule/components/custom/cards/entityCard.constants.ts";
import {IconListCheck} from "@tabler/icons-react";
import {buildPageTitle} from "@coreModule/helpers/general";
import type {ScheduleTask} from "armonia/src/modules/propertyManagement/api/realEstate/private/scheduleTask/scheduleTask.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import ScheduleTaskCard from "@propertyManagementModule/clients/panel/private/scheduleTasks/center/cardView/scheduleTaskCard.tsx";
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

interface AllScheduleTasksProps extends WithLanguageType {
    projectId?: string;
    projectName?: string;
}

function buildScheduleTaskEditPath(scheduleTask: ScheduleTask) {
    const params = new URLSearchParams();
    params.set("scheduleTaskId", scheduleTask._id);
    if (scheduleTask.name) params.set("scheduleTaskName", scheduleTask.name);
    if (scheduleTask.project?._id) params.set("projectId", scheduleTask.project._id);
    if (scheduleTask.project?.name) params.set("projectName", scheduleTask.project.name);
    return `/realEstate/scheduleTasks/edit?${params.toString()}`;
}

function AllScheduleTasks({resolveLanguageKey, projectId, projectName}: AllScheduleTasksProps) {
    const extraFilters = projectId ? {projectId} : undefined;
    const headerTitle = buildPageTitle(
        String(resolveLanguageKey("title")),
        projectName ? [projectName] : [],
    );

    return (
        <EntityListPage<ScheduleTask>
            apiUrl="/api/realEstate/scheduleTask"
            collectionName="scheduletasks"
            accessModel="scheduletasks"
            tableConfigKey="scheduletasks"
            createPath={projectId
                ? `/realEstate/scheduleTasks/create?projectId=${projectId}${projectName ? `&projectName=${encodeURIComponent(projectName)}` : ""}`
                : "/realEstate/scheduleTasks/create"
            }
            createIcon={<IconListCheck className="h-4 w-4" />}
            createLanguageKey="createScheduleTask"
            buildEditPath={buildScheduleTaskEditPath}
            resolveLanguageKey={resolveLanguageKey}
            sheetLanguagePath="src/modules/propertyManagement/clients/panel/private/scheduleTasks/center/sheetView/scheduleTaskSheetView.tsx"
            cardViewClassName={GRID_TRANSACTIONAL}
            extraFilters={extraFilters}
            headerTitle={headerTitle}
            rowActionMenu={{allowMenuForCustomChildren: true}}
            renderActionMenuChildren={(scheduleTask, bindRowAction) => (
                <>
                    <StartScheduleTask scheduleTask={scheduleTask} onAction={bindRowAction} />
                    <CompleteScheduleTask scheduleTask={scheduleTask} onAction={bindRowAction} />
                    <UpdateProgressScheduleTask scheduleTask={scheduleTask} onAction={bindRowAction} />
                    <MarkDelayedScheduleTask scheduleTask={scheduleTask} onAction={bindRowAction} />
                    <CancelScheduleTask scheduleTask={scheduleTask} onAction={bindRowAction} />
                </>
            )}
            renderFloatingModals={({action, entity, resetAction, listRef}) => {
                const onSuccess = (updated?: ScheduleTask) => {
                    if (updated?._id) listRef.current?.updateRow?.(updated._id, updated);
                    resetAction();
                };
                if (action === START_SCHEDULE_TASK_ACTION)
                    return <StartScheduleTaskDialog open onClose={resetAction} scheduleTask={entity} onSuccess={onSuccess} />;
                if (action === COMPLETE_SCHEDULE_TASK_ACTION)
                    return <CompleteScheduleTaskDialog open onClose={resetAction} scheduleTask={entity} onSuccess={onSuccess} />;
                if (action === UPDATE_PROGRESS_SCHEDULE_TASK_ACTION)
                    return <UpdateProgressScheduleTaskDialog open onClose={resetAction} scheduleTask={entity} onSuccess={onSuccess} />;
                if (action === MARK_DELAYED_SCHEDULE_TASK_ACTION)
                    return <MarkDelayedScheduleTaskDialog open onClose={resetAction} scheduleTask={entity} onSuccess={onSuccess} />;
                if (action === CANCEL_SCHEDULE_TASK_ACTION)
                    return <CancelScheduleTaskDialog open onClose={resetAction} scheduleTask={entity} onSuccess={onSuccess} />;
                return null;
            }}
            renderCard={(scheduleTask, onDelete, onRestore, listRef) => (
                <ScheduleTaskCard
                    scheduleTask={scheduleTask}
                    onDelete={(row: ScheduleTask | undefined, response?: DeletedData) => onDelete(row, response)}
                    onRestore={() => onRestore(scheduleTask)}
                    onActionSuccess={(updated?: ScheduleTask) =>
                        updated && listRef.current?.updateRow?.(updated._id, updated)
                    }
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/scheduleTasks/index.tsx"),
    withDebug(true, true, "scheduletasks"),
)(AllScheduleTasks);
