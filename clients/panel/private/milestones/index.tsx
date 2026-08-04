import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage from "@coreModule/components/entityPage/EntityListPage.tsx";
import {GRID_TRANSACTIONAL} from "@propertyManagementModule/components/custom/cards/entityCard.constants.ts";
import {IconFlag} from "@tabler/icons-react";
import {buildPageTitle} from "@coreModule/helpers/general";
import type {Milestone} from "armonia/src/modules/propertyManagement/api/realEstate/private/milestone/milestone.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import MilestoneCard from "@propertyManagementModule/clients/panel/private/milestones/center/cardView/milestoneCard.tsx";
import StartMilestone, {START_MILESTONE_ACTION} from "@propertyManagementModule/clients/panel/private/milestones/center/actions/start.tsx";
import CompleteMilestone, {COMPLETE_MILESTONE_ACTION} from "@propertyManagementModule/clients/panel/private/milestones/center/actions/complete.tsx";
import MarkDelayedMilestone, {MARK_DELAYED_MILESTONE_ACTION} from "@propertyManagementModule/clients/panel/private/milestones/center/actions/markDelayed.tsx";
import CancelMilestone, {CANCEL_MILESTONE_ACTION} from "@propertyManagementModule/clients/panel/private/milestones/center/actions/cancel.tsx";
import StartMilestoneDialog from "@propertyManagementModule/components/custom/milestones/startMilestoneDialog.tsx";
import CompleteMilestoneDialog from "@propertyManagementModule/components/custom/milestones/completeMilestoneDialog.tsx";
import MarkDelayedMilestoneDialog from "@propertyManagementModule/components/custom/milestones/markDelayedMilestoneDialog.tsx";
import CancelMilestoneDialog from "@propertyManagementModule/components/custom/milestones/cancelMilestoneDialog.tsx";

interface AllMilestonesProps extends WithLanguageType {
    projectId?: string;
    projectName?: string;
}

function buildMilestoneEditPath(milestone: Milestone) {
    const params = new URLSearchParams();
    params.set("milestoneId", milestone._id);
    if (milestone.name) params.set("milestoneName", milestone.name);
    if (milestone.project?._id) params.set("projectId", milestone.project._id);
    if (milestone.project?.name) params.set("projectName", milestone.project.name);
    return `/realEstate/milestones/edit?${params.toString()}`;
}

function AllMilestones({resolveLanguageKey, projectId, projectName}: AllMilestonesProps) {
    const extraFilters = projectId ? {projectId} : undefined;
    const headerTitle = buildPageTitle(
        String(resolveLanguageKey("title")),
        projectName ? [projectName] : [],
    );

    return (
        <EntityListPage<Milestone>
            apiUrl="/api/realEstate/milestone"
            collectionName="milestones"
            accessModel="milestones"
            tableConfigKey="milestones"
            createPath={projectId
                ? `/realEstate/milestones/create?projectId=${projectId}${projectName ? `&projectName=${encodeURIComponent(projectName)}` : ""}`
                : "/realEstate/milestones/create"
            }
            createIcon={<IconFlag className="h-4 w-4" />}
            createLanguageKey="createMilestone"
            buildEditPath={buildMilestoneEditPath}
            resolveLanguageKey={resolveLanguageKey}
            sheetLanguagePath="src/modules/propertyManagement/clients/panel/private/milestones/center/sheetView/milestoneSheetView.tsx"
            cardViewClassName={GRID_TRANSACTIONAL}
            extraFilters={extraFilters}
            headerTitle={headerTitle}
            rowActionMenu={{allowMenuForCustomChildren: true}}
            renderActionMenuChildren={(milestone, bindRowAction) => (
                <>
                    <StartMilestone milestone={milestone} onAction={bindRowAction} />
                    <CompleteMilestone milestone={milestone} onAction={bindRowAction} />
                    <MarkDelayedMilestone milestone={milestone} onAction={bindRowAction} />
                    <CancelMilestone milestone={milestone} onAction={bindRowAction} />
                </>
            )}
            renderFloatingModals={({action, entity, resetAction, listRef}) => {
                const onSuccess = (updated?: Milestone) => {
                    if (updated?._id) listRef.current?.updateRow?.(updated._id, updated);
                    resetAction();
                };
                if (action === START_MILESTONE_ACTION)
                    return <StartMilestoneDialog open onClose={resetAction} milestone={entity} onSuccess={onSuccess} />;
                if (action === COMPLETE_MILESTONE_ACTION)
                    return <CompleteMilestoneDialog open onClose={resetAction} milestone={entity} onSuccess={onSuccess} />;
                if (action === MARK_DELAYED_MILESTONE_ACTION)
                    return <MarkDelayedMilestoneDialog open onClose={resetAction} milestone={entity} onSuccess={onSuccess} />;
                if (action === CANCEL_MILESTONE_ACTION)
                    return <CancelMilestoneDialog open onClose={resetAction} milestone={entity} onSuccess={onSuccess} />;
                return null;
            }}
            renderCard={(milestone, onDelete, onRestore, listRef) => (
                <MilestoneCard
                    milestone={milestone}
                    onDelete={(row: Milestone | undefined, response?: DeletedData) => onDelete(row, response)}
                    onRestore={() => onRestore(milestone)}
                    onActionSuccess={(updated?: Milestone) =>
                        updated && listRef.current?.updateRow?.(updated._id, updated)
                    }
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/milestones/index.tsx"),
    withDebug(true, true),
)(AllMilestones);
