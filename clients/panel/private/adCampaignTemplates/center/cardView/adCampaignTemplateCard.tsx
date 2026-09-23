import {compose} from "redux";
import type {RefObject} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import type {AdCampaignTemplate} from "armonia/src/modules/propertyManagement/api/realEstate/private/adCampaignTemplate/adCampaignTemplate.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import {IconLanguage, IconMail, IconBroadcast} from "@tabler/icons-react";
import {Badge} from "@coreModule/components/ui/badge.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import DisplayValue from "@coreModule/components/viewEngine/widgets/display/displayValue.tsx";
import {
    STATUS_BADGE_NEUTRAL,
    STATUS_BADGE_SUCCESS,
} from "@propertyManagementModule/components/custom/cards/entityCard.constants.ts";
import EntityCard from "@coreModule/components/entityPage/list/card/entityCard.tsx";
import EntityCardRow from "@coreModule/components/entityPage/list/card/entityCardRow.tsx";
import Sheet from "@propertyManagementModule/clients/panel/private/adCampaignTemplates/center/sheetView/adCampaignTemplateSheetView.tsx";
import AdCampaignTemplateRowMenuExtras from "@propertyManagementModule/clients/panel/private/adCampaignTemplates/center/actions/adCampaignTemplateRowMenuExtras.tsx";
import AdCampaignTemplateWorkflowDialogs from "@propertyManagementModule/clients/panel/private/adCampaignTemplates/center/actions/adCampaignTemplateWorkflowDialogs.tsx";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";

function adCampaignTemplateEditPath(entity: AdCampaignTemplate) {
    const params = new URLSearchParams();
    params.set("adCampaignTemplateId", entity._id);
    if (entity.name) params.set("adCampaignTemplateName", entity.name);
    return `/tenancy/systemSettings/adCampaignTemplates/edit?${params.toString()}`;
}

type AdCampaignTemplateCardProps = WithLanguageType & {
    entity: AdCampaignTemplate;
    fetchId?: string;
    hideActions?: boolean;
    onDelete?: (deleted?: AdCampaignTemplate, response?: DeletedData) => void;
    onRestore?: () => void;
    onWorkflowSuccess?: (updated?: AdCampaignTemplate) => void;
    sheetOnly?: boolean;
    innerRef?: RefObject<WithAxiosLifecycleRef<AdCampaignTemplate> | null>;
};

function AdCampaignTemplateCard({
    resolveLanguageKey,
    entity,
    fetchId,
    hideActions = false,
    onDelete,
    onRestore,
    onWorkflowSuccess,
    sheetOnly = false,
    innerRef,
}: AdCampaignTemplateCardProps) {
    return (
        <EntityCard
            resource="adcampaigntemplates"
            entity={entity}
            fetchId={fetchId}
            singleUrl="/api/realEstate/adCampaignTemplate/single"
            onDelete={onDelete}
            onRestore={onRestore}
            hideActions={hideActions}
            sheetOnly={sheetOnly}
            editPath={adCampaignTemplateEditPath}
            Sheet={Sheet}
            sheetEntityProp="entity"
            deleteUrl="/api/realEstate/adCampaignTemplate"
            restoreUrl="/api/realEstate/adCampaignTemplate/restore"
            failedTitle={String(resolveLanguageKey("failedTitle") || "")}
            failedDescription={String(resolveLanguageKey("failedDescription") || "")}
            titlePath="name"
            innerRef={innerRef}
            sheetProps={() => ({fetchId})}
            extraDialogs={({action, setAction, entity: dialogEntity, setEntity}) => (
                <AdCampaignTemplateWorkflowDialogs
                    action={action}
                    template={dialogEntity}
                    onClose={() => setAction("")}
                    onSuccess={(updated?: AdCampaignTemplate) => {
                        if (updated) setEntity(updated);
                        onWorkflowSuccess?.(updated);
                        setAction("");
                    }}
                />
            )}
        >
            {({entity: row, setAction}) => (
                <>
                    <EntityCard.Header
                        titlePath="name"
                        title={row.name}
                        subtitle={row.subject}
                        subtitlePath="subject"
                        badges={
                            /* Always shown, both ways round: a card with no badge
                               reads as "no state" rather than "active", and the
                               menu offers the opposite action, so the two have to
                               agree on what this template currently is. */
                            <DisplayValue path="active" value={row.active}>
                                {() => {
                                    const isActive = row.active !== false;
                                    return (
                                        <Badge
                                            variant="outline"
                                            className={cn("text-xs", isActive ? STATUS_BADGE_SUCCESS : STATUS_BADGE_NEUTRAL)}
                                        >
                                            {String(resolveLanguageKey(isActive ? "fields.active" : "fields.inactive"))}
                                        </Badge>
                                    );
                                }}
                            </DisplayValue>
                        }
                    >
                        <AdCampaignTemplateRowMenuExtras template={row} onAction={setAction} />
                    </EntityCard.Header>
                    <EntityCard.Body>
                        <EntityCardRow
                            icon={IconBroadcast}
                            label={resolveLanguageKey("fields.campaignType")}
                            tooltip={resolveLanguageKey("fields.campaignType")}
                            path="campaignType"
                            value={String(resolveLanguageKey(`fields.!enums.campaignType.${row.campaignType}`))}
                        />
                        <EntityCardRow
                            icon={IconLanguage}
                            label={resolveLanguageKey("fields.locale")}
                            tooltip={resolveLanguageKey("fields.locale")}
                            path="locale"
                            value={row.locale}
                        />
                        <EntityCardRow
                            icon={IconMail}
                            label={resolveLanguageKey("fields.previewText")}
                            tooltip={resolveLanguageKey("fields.previewText")}
                            path="previewText"
                            value={row.previewText}
                        />
                    </EntityCard.Body>
                </>
            )}
        </EntityCard>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/adCampaignTemplates/center/cardView/adCampaignTemplateCard.tsx"),
    withDebug(true, true, "adcampaigntemplates"),
)(AdCampaignTemplateCard);
