import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import TooltipDisplayer from "@coreModule/components/custom/tooltipDisplayer.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import type {Milestone} from "armonia/src/modules/propertyManagement/api/realEstate/private/milestone/milestone.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import {Badge} from "@coreModule/components/ui/badge.tsx";
import {IconCalendar, IconFolder, IconPercentage} from "@tabler/icons-react";
import MilestoneSheetView from "@propertyManagementModule/clients/panel/private/milestones/center/sheetView/milestoneSheetView.tsx";
import {STATUS_BADGE_NEUTRAL} from "@propertyManagementModule/components/custom/cards/entityCard.constants.ts";
import StartMilestone, {START_MILESTONE_ACTION} from "@propertyManagementModule/clients/panel/private/milestones/center/actions/start.tsx";
import CompleteMilestone, {COMPLETE_MILESTONE_ACTION} from "@propertyManagementModule/clients/panel/private/milestones/center/actions/complete.tsx";
import MarkDelayedMilestone, {MARK_DELAYED_MILESTONE_ACTION} from "@propertyManagementModule/clients/panel/private/milestones/center/actions/markDelayed.tsx";
import CancelMilestone, {CANCEL_MILESTONE_ACTION} from "@propertyManagementModule/clients/panel/private/milestones/center/actions/cancel.tsx";
import StartMilestoneDialog from "@propertyManagementModule/components/custom/milestones/startMilestoneDialog.tsx";
import CompleteMilestoneDialog from "@propertyManagementModule/components/custom/milestones/completeMilestoneDialog.tsx";
import MarkDelayedMilestoneDialog from "@propertyManagementModule/components/custom/milestones/markDelayedMilestoneDialog.tsx";
import CancelMilestoneDialog from "@propertyManagementModule/components/custom/milestones/cancelMilestoneDialog.tsx";
import DisplayRow from "@coreModule/components/custom/displayValue/displayRow.tsx";
import DisplayValue from "@coreModule/components/custom/displayValue/displayValue.tsx";
import EntityCard from "@coreModule/components/custom/systemCards/entityCard.tsx";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {ReactNode, RefObject} from "react";

type MilestoneCardProps = WithLanguageType & {
    milestone: Milestone;
    fetchId?: string;
    hideActions?: boolean;
    onDelete?: (deletedMilestone?: Milestone, response?: DeletedData) => void;
    onRestore?: () => void;
    onActionSuccess?: (updated?: Milestone) => void;
    sheetOnly?: boolean;
    innerRef?: RefObject<WithAxiosLifecycleRef<Milestone> | null>;
};

function buildEditPath(milestone: Milestone) {
    const params = new URLSearchParams();
    params.set("milestoneId", milestone._id);
    if (milestone.name) params.set("milestoneName", milestone.name);
    if (milestone.project?._id) params.set("projectId", milestone.project._id);
    if (milestone.project?.name) params.set("projectName", milestone.project.name);
    return `/realEstate/milestones/edit?${params.toString()}`;
}

function MilestoneCard({
    milestone,
    resolveLanguageKey,
    fetchId,
    hideActions = false,
    onDelete,
    onRestore,
    onActionSuccess,
    sheetOnly = false,
    innerRef,
}: MilestoneCardProps) {
    return (
        <EntityCard
            resource="milestones"
            entity={milestone}
            fetchId={fetchId}
            singleUrl="/api/realEstate/milestone/single"
            onDelete={onDelete}
            onRestore={onRestore}
            hideActions={hideActions}
            sheetOnly={sheetOnly}
            editPath={buildEditPath}
            Sheet={MilestoneSheetView}
            sheetEntityProp="milestone"
            deleteUrl="/api/realEstate/milestone"
            restoreUrl="/api/realEstate/milestone/restore"
            failedTitle={String(resolveLanguageKey("failedTitle") || "")}
            failedDescription={String(resolveLanguageKey("failedDescription") || "")}
            titlePath="title"
            innerRef={innerRef}
            sheetProps={() => ({fetchId})}
            extraDialogs={({action, setAction, entity, setEntity}) => {
                const handleSuccess = (updated?: Milestone) => {
                    if (updated) setEntity({...entity, ...updated});
                    onActionSuccess?.(updated);
                    setAction("");
                };
                return (
                    <>
                        {action === START_MILESTONE_ACTION && (
                            <StartMilestoneDialog open onClose={() => setAction("")} milestone={entity} onSuccess={handleSuccess} />
                        )}
                        {action === COMPLETE_MILESTONE_ACTION && (
                            <CompleteMilestoneDialog open onClose={() => setAction("")} milestone={entity} onSuccess={handleSuccess} />
                        )}
                        {action === MARK_DELAYED_MILESTONE_ACTION && (
                            <MarkDelayedMilestoneDialog open onClose={() => setAction("")} milestone={entity} onSuccess={handleSuccess} />
                        )}
                        {action === CANCEL_MILESTONE_ACTION && (
                            <CancelMilestoneDialog open onClose={() => setAction("")} milestone={entity} onSuccess={handleSuccess} />
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
                        <StartMilestone milestone={entity} onAction={setAction} />
                        <CompleteMilestone milestone={entity} onAction={setAction} />
                        <MarkDelayedMilestone milestone={entity} onAction={setAction} />
                        <CancelMilestone milestone={entity} onAction={setAction} />
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
                            icon={IconCalendar}
                            label={resolveLanguageKey("fields.plannedEnd")}
                            tooltip={resolveLanguageKey("fields.plannedEnd")}
                            path="plannedEnd"
                            type="date"
                            value={entity.plannedEnd}
                        />
                        <DisplayRow
                            icon={IconPercentage}
                            label={resolveLanguageKey("fields.weightPercent")}
                            tooltip={resolveLanguageKey("fields.weightPercent")}
                            path="weightPercent"
                            type="number"
                            value={entity.weightPercent}
                        />
                    </EntityCard.Body>
                </>
            )}
        </EntityCard>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/milestones/center/cardView/milestoneCard.tsx"),
    withDebug(true, true, "milestones"),
)(MilestoneCard);
