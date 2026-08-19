import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import type {ApprovalRequest} from "armonia/src/modules/propertyManagement/api/realEstate/private/approvalRequest/approvalRequest.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import {Badge} from "@coreModule/components/ui/badge.tsx";
import Sheet from "@propertyManagementModule/clients/panel/private/approvalRequests/center/sheetView/approvalRequestSheetView.tsx";
import {STATUS_BADGE_NEUTRAL} from "@propertyManagementModule/components/custom/cards/entityCard.constants.ts";
import {cn} from "@coreModule/components/lib/utils.ts";
import EntityCard from "@coreModule/components/custom/systemCards/entityCard.tsx";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {RefObject} from "react";

function approvalRequestEditPath(entity: ApprovalRequest) {
    const params = new URLSearchParams();
    params.set("approvalRequestId", entity._id);
    if (entity.name) params.set("approvalRequestName", entity.name);
    return `/realEstate/approvalRequests/edit?${params.toString()}`;
}

type ApprovalRequestCardProps = WithLanguageType & {
    entity: ApprovalRequest;
    fetchId?: string;
    hideActions?: boolean;
    onDelete?: (deleted?: ApprovalRequest, response?: DeletedData) => void;
    onRestore?: () => void;
    sheetOnly?: boolean;
    innerRef?: RefObject<WithAxiosLifecycleRef<ApprovalRequest> | null>;
};

function ApprovalRequestCard({
    resolveLanguageKey,
    entity,
    fetchId,
    hideActions = false,
    onDelete,
    onRestore,
    sheetOnly = false,
    innerRef,
}: ApprovalRequestCardProps) {
    return (
        <EntityCard
            resource="approvalrequests"
            entity={entity}
            fetchId={fetchId}
            singleUrl="/api/realEstate/approvalRequest/single"
            onDelete={onDelete}
            onRestore={onRestore}
            hideActions={hideActions}
            sheetOnly={sheetOnly}
            editPath={approvalRequestEditPath}
            Sheet={Sheet}
            sheetEntityProp="entity"
            deleteUrl="/api/realEstate/approvalRequest"
            restoreUrl="/api/realEstate/approvalRequest/restore"
            failedTitle={String(resolveLanguageKey("failedTitle") || "")}
            failedDescription={String(resolveLanguageKey("failedDescription") || "")}
            titlePath="name"
            innerRef={innerRef}
            sheetProps={() => ({fetchId})}
        >
            {({entity: row}) => (
                <EntityCard.Header
                    titlePath="name"
                    title={row.name}
                    subtitle={row.targetType}
                    subtitlePath="targetType"
                    badges={row.status ? (
                        <Badge variant="secondary" className={cn("text-xs", STATUS_BADGE_NEUTRAL)}>{String(resolveLanguageKey(`status.${row.status}`, true) || resolveLanguageKey(`statuses.${row.status}`, true) || row.status)}</Badge>
                    ) : null}
                />
            )}
        </EntityCard>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/approvalRequests/center/cardView/approvalRequestCard.tsx"),
    withDebug(true, true, "approvalrequests"),
)(ApprovalRequestCard);
