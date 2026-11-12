import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import type {InspectionChecklistTemplate} from "armonia/src/modules/propertyManagement/api/realEstate/private/inspectionChecklistTemplate/inspectionChecklistTemplate.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import Sheet from "@propertyManagementModule/clients/panel/private/inspectionChecklistTemplates/center/sheetView/inspectionChecklistTemplateSheetView.tsx";
import EntityCard from "@coreModule/components/entityPage/list/card/entityCard.tsx";
import EntityCardRow from "@coreModule/components/entityPage/list/card/entityCardRow.tsx";
import StatusBadge from "@coreModule/components/entityPage/sheet/statusBadge.tsx";
import {IconListCheck, IconTools} from "@tabler/icons-react";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {RefObject} from "react";

function inspectionChecklistTemplateEditPath(entity: InspectionChecklistTemplate) {
    const params = new URLSearchParams();
    params.set("inspectionChecklistTemplateId", entity._id);
    if (entity.name) params.set("inspectionChecklistTemplateName", entity.name);
    return `/tenancy/systemSettings/inspectionChecklistTemplates/edit?${params.toString()}`;
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
            failedTitle={resolveLanguageKey("failedTitle")}
            failedDescription={resolveLanguageKey("failedDescription")}
            titlePath="title"
            innerRef={innerRef}
            sheetProps={() => ({fetchId})}
        >
            {({entity: row}) => {
                const tradeAndStage = [row.trade, row.stage].filter(Boolean).join(" · ");
                return (
                    <>
                        {/* The state in its model tone (UX-02); what the checklist is for and how long it is. */}
                        <EntityCard.Header
                            titlePath="title"
                            title={row.title}
                            subtitle={row.name}
                            subtitlePath="name"
                            badges={
                                <StatusBadge
                                    tableConfigKey="inspectionchecklisttemplates"
                                    field="status"
                                    value={row.status}
                                    label={String(resolveLanguageKey(`statuses.${row.status}`))}
                                />
                            }
                        />
                        <EntityCard.Body>
                            {tradeAndStage ? (
                                <EntityCardRow
                                    icon={IconTools}
                                    label={resolveLanguageKey("tradeAndStage")}
                                    tooltip={resolveLanguageKey("tradeAndStage")}
                                    path="trade"
                                    value={tradeAndStage}
                                />
                            ) : null}
                            {row.items.length > 0 ? (
                                <EntityCardRow
                                    icon={IconListCheck}
                                    label={resolveLanguageKey("itemCount")}
                                    tooltip={resolveLanguageKey("itemCount")}
                                    path="items"
                                    type="number"
                                    value={row.items.length}
                                />
                            ) : null}
                        </EntityCard.Body>
                    </>
                );
            }}
        </EntityCard>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/inspectionChecklistTemplates/center/cardView/inspectionChecklistTemplateCard.tsx"),
    withDebug(true, true, "inspectionchecklisttemplates"),
)(InspectionChecklistTemplateCard);
