import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import type {ApprovalWorkflow} from "armonia/src/modules/propertyManagement/api/realEstate/private/approvalWorkflow/approvalWorkflow.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import {Badge} from "@coreModule/components/ui/badge.tsx";
import Sheet from "@propertyManagementModule/clients/panel/private/approvalWorkflows/center/sheetView/approvalWorkflowSheetView.tsx";
import {STATUS_BADGE_NEUTRAL} from "@propertyManagementModule/components/custom/cards/entityCard.constants.ts";
import {cn} from "@coreModule/components/lib/utils.ts";
import EntityCard from "@coreModule/components/custom/systemCards/entityCard.tsx";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {RefObject} from "react";

function approvalWorkflowEditPath(entity: ApprovalWorkflow) {
    const params = new URLSearchParams();
    params.set("approvalWorkflowId", entity._id);
    if (entity.name) params.set("approvalWorkflowName", entity.name);
    return `/realEstate/approvalWorkflows/edit?${params.toString()}`;
}

type ApprovalWorkflowCardProps = WithLanguageType & {
    entity: ApprovalWorkflow;
    fetchId?: string;
    hideActions?: boolean;
    onDelete?: (deleted?: ApprovalWorkflow, response?: DeletedData) => void;
    onRestore?: () => void;
    sheetOnly?: boolean;
    innerRef?: RefObject<WithAxiosLifecycleRef<ApprovalWorkflow> | null>;
};

function ApprovalWorkflowCard({
    resolveLanguageKey,
    entity,
    fetchId,
    hideActions = false,
    onDelete,
    onRestore,
    sheetOnly = false,
    innerRef,
}: ApprovalWorkflowCardProps) {
    return (
        <EntityCard
            resource="approvalworkflows"
            entity={entity}
            fetchId={fetchId}
            singleUrl="/api/realEstate/approvalWorkflow/single"
            onDelete={onDelete}
            onRestore={onRestore}
            hideActions={hideActions}
            sheetOnly={sheetOnly}
            editPath={approvalWorkflowEditPath}
            Sheet={Sheet}
            sheetEntityProp="entity"
            deleteUrl="/api/realEstate/approvalWorkflow"
            restoreUrl="/api/realEstate/approvalWorkflow/restore"
            failedTitle={String(resolveLanguageKey("failedTitle") || "")}
            failedDescription={String(resolveLanguageKey("failedDescription") || "")}
            titlePath="title"
            innerRef={innerRef}
            sheetProps={() => ({fetchId})}
        >
            {({entity: row}) => (
                <EntityCard.Header
                    titlePath="title"
                    title={row.title}
                    subtitle={row.documentType}
                    subtitlePath="documentType"
                    badges={row.active != null ? (
                        <Badge variant="secondary" className={cn("text-xs", STATUS_BADGE_NEUTRAL)}>{String(row.active)}</Badge>
                    ) : null}
                />
            )}
        </EntityCard>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/approvalWorkflows/center/cardView/approvalWorkflowCard.tsx"),
    withDebug(true, true),
)(ApprovalWorkflowCard);
