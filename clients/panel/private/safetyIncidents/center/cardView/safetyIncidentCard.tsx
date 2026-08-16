import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import type {SafetyIncident} from "armonia/src/modules/propertyManagement/api/realEstate/private/safetyIncident/safetyIncident.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import {Badge} from "@coreModule/components/ui/badge.tsx";
import Sheet from "@propertyManagementModule/clients/panel/private/safetyIncidents/center/sheetView/safetyIncidentSheetView.tsx";
import {STATUS_BADGE_NEUTRAL} from "@propertyManagementModule/components/custom/cards/entityCard.constants.ts";
import {cn} from "@coreModule/components/lib/utils.ts";
import EntityCard from "@coreModule/components/custom/systemCards/entityCard.tsx";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {RefObject} from "react";

function safetyIncidentEditPath(entity: SafetyIncident) {
    const params = new URLSearchParams();
    params.set("safetyIncidentId", entity._id);
    if (entity.name) params.set("safetyIncidentName", entity.name);
    return `/realEstate/safetyIncidents/edit?${params.toString()}`;
}

type SafetyIncidentCardProps = WithLanguageType & {
    entity: SafetyIncident;
    fetchId?: string;
    hideActions?: boolean;
    onDelete?: (deleted?: SafetyIncident, response?: DeletedData) => void;
    onRestore?: () => void;
    sheetOnly?: boolean;
    innerRef?: RefObject<WithAxiosLifecycleRef<SafetyIncident> | null>;
};

function SafetyIncidentCard({
    resolveLanguageKey,
    entity,
    fetchId,
    hideActions = false,
    onDelete,
    onRestore,
    sheetOnly = false,
    innerRef,
}: SafetyIncidentCardProps) {
    return (
        <EntityCard
            resource="safetyincidents"
            entity={entity}
            fetchId={fetchId}
            singleUrl="/api/realEstate/safetyIncident/single"
            onDelete={onDelete}
            onRestore={onRestore}
            hideActions={hideActions}
            sheetOnly={sheetOnly}
            editPath={safetyIncidentEditPath}
            Sheet={Sheet}
            sheetEntityProp="entity"
            deleteUrl="/api/realEstate/safetyIncident"
            restoreUrl="/api/realEstate/safetyIncident/restore"
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
    withLanguage("src/modules/propertyManagement/clients/panel/private/safetyIncidents/center/cardView/safetyIncidentCard.tsx"),
    withDebug(true, true),
)(SafetyIncidentCard);
