import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import HiddenElement from "@coreModule/components/custom/hiddenElement.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import TooltipDisplayer from "@coreModule/components/custom/tooltipDisplayer.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import type {Milestone} from "armonia/src/modules/propertyManagement/api/realEstate/private/milestone/milestone.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import {Separator} from "@coreModule/components/ui/separator.tsx";
import {Badge} from "@coreModule/components/ui/badge.tsx";
import {withDeletedDrawer} from "@coreModule/helpers/hocs/withDeletedDrawer.tsx";
import InfoRow from "@coreModule/components/custom/infoRow.tsx";
import {IconCalendar, IconFolder, IconPercentage} from "@tabler/icons-react";
import MilestoneSheetView from "@propertyManagementModule/clients/panel/private/milestones/center/sheetView/milestoneSheetView.tsx";
import DeleteAction from "@coreModule/components/custom/actions/deleteAction.tsx";
import RestoreAction from "@coreModule/components/custom/actions/restoreAction.tsx";
import ActionMenu from "@coreModule/components/custom/actions/menu/actionMenu.tsx";
import {useEntityCard} from "@coreModule/helpers/hooks/useEntityCard.ts";
import {EntityCardShell} from "@propertyManagementModule/components/custom/cards/EntityCardShell.tsx";
import {EntityTextCardHeader} from "@propertyManagementModule/components/custom/cards/EntityTextCardHeader.tsx";
import {CARD_BODY_CLASS, CARD_INFO_ROWS_CLASS, STATUS_BADGE_NEUTRAL} from "@propertyManagementModule/components/custom/cards/entityCard.constants.ts";
import StartMilestone, {START_MILESTONE_ACTION} from "@propertyManagementModule/clients/panel/private/milestones/center/actions/start.tsx";
import CompleteMilestone, {COMPLETE_MILESTONE_ACTION} from "@propertyManagementModule/clients/panel/private/milestones/center/actions/complete.tsx";
import MarkDelayedMilestone, {MARK_DELAYED_MILESTONE_ACTION} from "@propertyManagementModule/clients/panel/private/milestones/center/actions/markDelayed.tsx";
import CancelMilestone, {CANCEL_MILESTONE_ACTION} from "@propertyManagementModule/clients/panel/private/milestones/center/actions/cancel.tsx";
import StartMilestoneDialog from "@propertyManagementModule/components/custom/milestones/startMilestoneDialog.tsx";
import CompleteMilestoneDialog from "@propertyManagementModule/components/custom/milestones/completeMilestoneDialog.tsx";
import MarkDelayedMilestoneDialog from "@propertyManagementModule/components/custom/milestones/markDelayedMilestoneDialog.tsx";
import CancelMilestoneDialog from "@propertyManagementModule/components/custom/milestones/cancelMilestoneDialog.tsx";

type MilestoneCardProps = WithLanguageType & {
    milestone: Milestone;
    onDelete?: (deletedMilestone?: Milestone, response?: DeletedData) => void;
    onRestore?: () => void;
    onActionSuccess?: (updated?: Milestone) => void;
    hideActions?: boolean;
};

function buildEditPath(milestone: Milestone) {
    const params = new URLSearchParams();
    params.set("milestoneId", milestone._id);
    if (milestone.name) params.set("milestoneName", milestone.name);
    if (milestone.project?._id) params.set("projectId", milestone.project._id);
    if (milestone.project?.name) params.set("projectName", milestone.project.name);
    return `/realEstate/milestones/edit?${params.toString()}`;
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

function MilestoneCard({
    milestone: milestoneProp,
    resolveLanguageKey,
    onDelete: onDeleteProp,
    onRestore: onRestoreProp,
    onActionSuccess,
    hideActions = false,
}: MilestoneCardProps) {
    const {action, setAction, entity: milestone, setEntity, hideAfterDeletion, onDelete, onRestore} = useEntityCard({
        entityProp: milestoneProp,
        onDeleteProp,
        onRestoreProp,
    });

    const handleActionSuccess = (updated?: Milestone) => {
        if (updated) setEntity(updated);
        onActionSuccess?.(updated);
        setAction("");
    };

    const {read, write, restore} = useAccess("milestones");

    if (hideAfterDeletion || !restore) {
        return <></>;
    }
    if (!read || !Object.keys(read).length) {
        return <HiddenElement />;
    }

    const editPath = buildEditPath(milestone);

    return (
        <>
            <EntityCardShell onClick={() => setAction("view")}>
                <EntityTextCardHeader
                    title={milestone.title}
                    subtitle={milestone.name}
                    badges={<>
                            {!!read?.status && !!milestone.status && (
                                <TooltipDisplayer tooltip={resolveLanguageKey("statusLabel") as string}>
                                    <Badge variant="secondary" className={cn("text-xs", STATUS_BADGE_NEUTRAL)}>
                                        {getStatusLabel(resolveLanguageKey, milestone.status)}
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
                            accessModel="milestones"
                            deletedData={milestone}
                            onAction={(a: string) => setAction(a)}
                            editPath={editPath}
                            allowMenuForCustomChildren={!!write && !milestone.deletedAt}
                        >
                            <StartMilestone milestone={milestone} onAction={(a: string) => setAction(a)} />
                            <CompleteMilestone milestone={milestone} onAction={(a: string) => setAction(a)} />
                            <MarkDelayedMilestone milestone={milestone} onAction={(a: string) => setAction(a)} />
                            <CancelMilestone milestone={milestone} onAction={(a: string) => setAction(a)} />
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
                            value={milestone.project?.name}
                        />
                        <InfoRow
                            icon={IconCalendar}
                            label={resolveLanguageKey("fields.plannedEnd")}
                            show={!!read?.plannedEnd && !!milestone.plannedEnd}
                            value={formatDate(milestone.plannedEnd)}
                        />
                        <InfoRow
                            icon={IconPercentage}
                            label={resolveLanguageKey("fields.weightPercent")}
                            show={!!read?.weightPercent && typeof milestone.weightPercent === "number"}
                            value={typeof milestone.weightPercent === "number" ? `${milestone.weightPercent}%` : undefined}
                        />
                    </div>
                </div>
            </EntityCardShell>

            {!!action && (
                <>
                    {action === "view" && (
                        <MilestoneSheetView
                            open={action === "view"}
                            onOpenChange={() => setAction("")}
                            milestone={milestone}
                            onDelete={onDelete}
                            onRestore={onRestore}
                        />
                    )}
                    {action === "delete" && (
                        <DeleteAction
                            accessModel="milestones"
                            deleteId={milestone._id}
                            openAlert={action === "delete"}
                            name={read?.title && milestone.title}
                            confirmName={read?.title && milestone.title}
                            onSuccess={onDelete}
                            onCancel={() => setAction("")}
                            url="/api/realEstate/milestone"
                        />
                    )}
                    {action === "restore" && (
                        <RestoreAction
                            accessModel="milestones"
                            deleteId={milestone._id}
                            openAlert={action === "restore"}
                            name={read?.title && milestone.title}
                            confirmName={read?.title && milestone.title}
                            onSuccess={onRestore}
                            onCancel={() => setAction("")}
                            url="/api/realEstate/milestone/restore"
                        />
                    )}
                    {action === START_MILESTONE_ACTION && (
                        <StartMilestoneDialog open onClose={() => setAction("")} milestone={milestone} onSuccess={handleActionSuccess} />
                    )}
                    {action === COMPLETE_MILESTONE_ACTION && (
                        <CompleteMilestoneDialog open onClose={() => setAction("")} milestone={milestone} onSuccess={handleActionSuccess} />
                    )}
                    {action === MARK_DELAYED_MILESTONE_ACTION && (
                        <MarkDelayedMilestoneDialog open onClose={() => setAction("")} milestone={milestone} onSuccess={handleActionSuccess} />
                    )}
                    {action === CANCEL_MILESTONE_ACTION && (
                        <CancelMilestoneDialog open onClose={() => setAction("")} milestone={milestone} onSuccess={handleActionSuccess} />
                    )}
                </>
            )}
        </>
    );
}

export default compose(
    (Component: any) => withDeletedDrawer(Component, (props: any) => props.milestone),
    withLanguage("src/modules/propertyManagement/clients/panel/private/milestones/center/cardView/milestoneCard.tsx"),
    withDebug(true, true),
)(MilestoneCard);
