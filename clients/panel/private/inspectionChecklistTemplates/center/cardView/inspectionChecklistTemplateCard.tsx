import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import type {InspectionChecklistTemplate} from "armonia/src/modules/propertyManagement/api/realEstate/private/inspectionChecklistTemplate/inspectionChecklistTemplate.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import {Badge} from "@coreModule/components/ui/badge.tsx";
import Sheet from "@propertyManagementModule/clients/panel/private/inspectionChecklistTemplates/center/sheetView/inspectionChecklistTemplateSheetView.tsx";
import {STATUS_BADGE_NEUTRAL} from "@propertyManagementModule/components/custom/cards/entityCard.constants.ts";
import {cn} from "@coreModule/components/lib/utils.ts";
import EntityCard from "@coreModule/components/custom/systemCards/entityCard.tsx";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {RefObject} from "react";

function inspectionChecklistTemplateEditPath(entity: InspectionChecklistTemplate) {
    const params = new URLSearchParams();
    params.set("inspectionChecklistTemplateId", entity._id);
    if (entity.name) params.set("inspectionChecklistTemplateName", entity.name);
    return `/realEstate/inspectionChecklistTemplates/edit?${params.toString()}`;
}

type InspectionChecklistTemplateCardProps = WithLanguageType & {
    entity: InspectionChecklistTemplate;
    fetchId?: string;
    hideActions?: boolean;
    onDelete?: (deleted?: InspectionChecklistTemplate, response?: DeletedData) => void;
    onRestore?: () => void;
    sheetOnly?: boolean;
    innerRef?: RefObject<WithAxiosLifecycleRef<InspectionChecklistTemplate> | null>;
};

function InspectionChecklistTemplateCard({
    resolveLanguageKey,
    entity,
    fetchId,
    hideActions = false,
    onDelete,
    onRestore,
    sheetOnly = false,
    innerRef,
}: InspectionChecklistTemplateCardProps) {
    return (
        <EntityCard
            resource="inspectionchecklisttemplates"
            entity={entity}
            fetchId={fetchId}
            singleUrl="/api/realEstate/inspectionChecklistTemplate/single"
            onDelete={onDelete}
            onRestore={onRestore}
            hideActions={hideActions}
            sheetOnly={sheetOnly}
            editPath={inspectionChecklistTemplateEditPath}
            Sheet={Sheet}
            sheetEntityProp="entity"
            deleteUrl="/api/realEstate/inspectionChecklistTemplate"
            restoreUrl="/api/realEstate/inspectionChecklistTemplate/restore"
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
    withLanguage("src/modules/propertyManagement/clients/panel/private/inspectionChecklistTemplates/center/cardView/inspectionChecklistTemplateCard.tsx"),
    withDebug(true, true, "inspectionchecklisttemplates"),
)(InspectionChecklistTemplateCard);
