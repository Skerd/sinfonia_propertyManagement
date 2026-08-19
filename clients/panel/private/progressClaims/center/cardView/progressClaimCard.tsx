import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import type {ProgressClaim} from "armonia/src/modules/propertyManagement/api/realEstate/private/progressClaim/progressClaim.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import {Badge} from "@coreModule/components/ui/badge.tsx";
import Sheet from "@propertyManagementModule/clients/panel/private/progressClaims/center/sheetView/progressClaimSheetView.tsx";
import {STATUS_BADGE_NEUTRAL} from "@propertyManagementModule/components/custom/cards/entityCard.constants.ts";
import {cn} from "@coreModule/components/lib/utils.ts";
import EntityCard from "@coreModule/components/custom/systemCards/entityCard.tsx";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {RefObject} from "react";

function progressClaimEditPath(entity: ProgressClaim) {
    const params = new URLSearchParams();
    params.set("progressClaimId", entity._id);
    if (entity.name) params.set("progressClaimName", entity.name);
    return `/realEstate/progressClaims/edit?${params.toString()}`;
}

type ProgressClaimCardProps = WithLanguageType & {
    entity: ProgressClaim;
    fetchId?: string;
    hideActions?: boolean;
    onDelete?: (deleted?: ProgressClaim, response?: DeletedData) => void;
    onRestore?: () => void;
    sheetOnly?: boolean;
    innerRef?: RefObject<WithAxiosLifecycleRef<ProgressClaim> | null>;
};

function ProgressClaimCard({
    resolveLanguageKey,
    entity,
    fetchId,
    hideActions = false,
    onDelete,
    onRestore,
    sheetOnly = false,
    innerRef,
}: ProgressClaimCardProps) {
    return (
        <EntityCard
            resource="progressclaims"
            entity={entity}
            fetchId={fetchId}
            singleUrl="/api/realEstate/progressClaim/single"
            onDelete={onDelete}
            onRestore={onRestore}
            hideActions={hideActions}
            sheetOnly={sheetOnly}
            editPath={progressClaimEditPath}
            Sheet={Sheet}
            sheetEntityProp="entity"
            deleteUrl="/api/realEstate/progressClaim"
            restoreUrl="/api/realEstate/progressClaim/restore"
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
                    subtitle={row.name}
                    subtitlePath="name"
                    badges={row.status ? (
                        <Badge variant="secondary" className={cn("text-xs", STATUS_BADGE_NEUTRAL)}>{String(resolveLanguageKey(`status.${row.status}`, true) || resolveLanguageKey(`statuses.${row.status}`, true) || row.status)}</Badge>
                    ) : null}
                />
            )}
        </EntityCard>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/progressClaims/center/cardView/progressClaimCard.tsx"),
    withDebug(true, true, "progressclaims"),
)(ProgressClaimCard);
