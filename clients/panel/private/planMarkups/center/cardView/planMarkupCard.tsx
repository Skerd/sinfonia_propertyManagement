import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import type {PlanMarkup} from "armonia/src/modules/propertyManagement/api/realEstate/private/planMarkup/planMarkup.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import {Badge} from "@coreModule/components/ui/badge.tsx";
import Sheet from "@propertyManagementModule/clients/panel/private/planMarkups/center/sheetView/planMarkupSheetView.tsx";
import {STATUS_BADGE_NEUTRAL} from "@propertyManagementModule/components/custom/cards/entityCard.constants.ts";
import {cn} from "@coreModule/components/lib/utils.ts";
import EntityCard from "@coreModule/components/custom/systemCards/entityCard.tsx";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {RefObject} from "react";

function planMarkupEditPath(entity: PlanMarkup) {
    const params = new URLSearchParams();
    params.set("planMarkupId", entity._id);
    if (entity.name) params.set("planMarkupName", entity.name);
    return `/realEstate/planMarkups/edit?${params.toString()}`;
}

type PlanMarkupCardProps = WithLanguageType & {
    entity: PlanMarkup;
    fetchId?: string;
    hideActions?: boolean;
    onDelete?: (deleted?: PlanMarkup, response?: DeletedData) => void;
    onRestore?: () => void;
    sheetOnly?: boolean;
    innerRef?: RefObject<WithAxiosLifecycleRef<PlanMarkup> | null>;
};

function PlanMarkupCard({
    resolveLanguageKey,
    entity,
    fetchId,
    hideActions = false,
    onDelete,
    onRestore,
    sheetOnly = false,
    innerRef,
}: PlanMarkupCardProps) {
    return (
        <EntityCard
            resource="planmarkups"
            entity={entity}
            fetchId={fetchId}
            singleUrl="/api/realEstate/planMarkup/single"
            onDelete={onDelete}
            onRestore={onRestore}
            hideActions={hideActions}
            sheetOnly={sheetOnly}
            editPath={planMarkupEditPath}
            Sheet={Sheet}
            sheetEntityProp="entity"
            deleteUrl="/api/realEstate/planMarkup"
            restoreUrl="/api/realEstate/planMarkup/restore"
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
                    subtitle={row.markerType}
                    subtitlePath="markerType"
                    badges={row.status ? (
                        <Badge variant="secondary" className={cn("text-xs", STATUS_BADGE_NEUTRAL)}>{String(resolveLanguageKey(`status.${row.status}`, true) || resolveLanguageKey(`statuses.${row.status}`, true) || row.status)}</Badge>
                    ) : null}
                />
            )}
        </EntityCard>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/planMarkups/center/cardView/planMarkupCard.tsx"),
    withDebug(true, true),
)(PlanMarkupCard);
