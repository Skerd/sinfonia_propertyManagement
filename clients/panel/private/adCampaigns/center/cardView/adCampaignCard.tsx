import {compose} from "redux";
import type {RefObject} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {IconCalendarBolt, IconMail, IconBroadcast, IconUsers} from "@tabler/icons-react";
import type {AdCampaign} from "armonia/src/modules/propertyManagement/api/realEstate/private/adCampaign/adCampaign.dto.ts";
import type {AdCampaignStatus} from "armonia/src/modules/propertyManagement/api/realEstate/private/adCampaign/adCampaign.constants.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import {Badge} from "@coreModule/components/ui/badge.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import CopyTooltip from "@coreModule/components/custom/copyTooltip.tsx";
import EntityCard from "@coreModule/components/entityPage/list/card/entityCard.tsx";
import EntityCardRow from "@coreModule/components/entityPage/list/card/entityCardRow.tsx";
import {
    STATUS_BADGE_DANGER,
    STATUS_BADGE_INFO,
    STATUS_BADGE_NEUTRAL,
    STATUS_BADGE_SUCCESS,
    STATUS_BADGE_WARNING,
} from "@propertyManagementModule/components/custom/cards/entityCard.constants.ts";
import AdCampaignSheetView from "@propertyManagementModule/clients/panel/private/adCampaigns/center/sheetView/adCampaignSheetView.tsx";
import AdCampaignRowMenuExtras from "@propertyManagementModule/clients/panel/private/adCampaigns/center/actions/adCampaignRowMenuExtras.tsx";
import AdCampaignWorkflowDialogs from "@propertyManagementModule/clients/panel/private/adCampaigns/center/actions/adCampaignWorkflowDialogs.tsx";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";

const STATUS_BADGE: Record<AdCampaignStatus, string> = {
    draft: STATUS_BADGE_NEUTRAL,
    materializing: STATUS_BADGE_INFO,
    scheduled: STATUS_BADGE_INFO,
    sending: STATUS_BADGE_INFO,
    paused: STATUS_BADGE_WARNING,
    completed: STATUS_BADGE_SUCCESS,
    cancelled: STATUS_BADGE_NEUTRAL,
    failed: STATUS_BADGE_DANGER,
};

function adCampaignEditPath(campaign: AdCampaign) {
    const params = new URLSearchParams();
    params.set("adCampaignId", campaign._id);
    if (campaign.title) params.set("adCampaignName", campaign.title);
    return `/tenancy/systemSettings/adCampaigns/edit?${params.toString()}`;
}

type AdCampaignCardProps = WithLanguageType & {
    campaign: AdCampaign;
    fetchId?: string;
    hideActions?: boolean;
    onDelete?: (deleted?: AdCampaign, response?: DeletedData) => void;
    onRestore?: () => void;
    onWorkflowSuccess?: (updated?: AdCampaign) => void;
    sheetOnly?: boolean;
    innerRef?: RefObject<WithAxiosLifecycleRef<AdCampaign> | null>;
};

function AdCampaignCard({
    campaign,
    resolveLanguageKey,
    fetchId,
    hideActions = false,
    onDelete,
    onRestore,
    onWorkflowSuccess,
    sheetOnly = false,
    innerRef,
}: AdCampaignCardProps) {
    return (
        <EntityCard
            resource="adcampaigns"
            entity={campaign}
            fetchId={fetchId}
            singleUrl="/api/realEstate/adCampaign/single"
            onDelete={onDelete}
            onRestore={onRestore}
            hideActions={hideActions}
            sheetOnly={sheetOnly}
            editPath={adCampaignEditPath}
            Sheet={AdCampaignSheetView}
            sheetEntityProp="campaign"
            deleteUrl="/api/realEstate/adCampaign"
            restoreUrl="/api/realEstate/adCampaign/restore"
            failedTitle={String(resolveLanguageKey("failedTitle") || "")}
            failedDescription={String(resolveLanguageKey("failedDescription") || "")}
            titlePath="title"
            innerRef={innerRef}
            sheetProps={() => ({fetchId})}
            extraDialogs={({action, setAction, entity, setEntity}) => (
                <AdCampaignWorkflowDialogs
                    action={action}
                    campaign={entity}
                    onClose={() => setAction("")}
                    onSuccess={(updated?: AdCampaign) => {
                        if (updated) setEntity(updated);
                        onWorkflowSuccess?.(updated);
                        setAction("");
                    }}
                />
            )}
        >
            {({entity, setAction}) => {
                const stats = entity.stats;
                return (
                    <>
                        <EntityCard.Header
                            titlePath="title"
                            title={
                                <span className="flex min-w-0 items-center gap-1">
                                    <span className="truncate">{entity.title}</span>
                                    {entity.name ? <CopyTooltip text={entity.name} /> : null}
                                </span>
                            }
                            badges={
                                entity.status ? (
                                    <Badge
                                        variant="secondary"
                                        className={cn("text-xs", STATUS_BADGE[entity.status] ?? STATUS_BADGE_NEUTRAL)}
                                    >
                                        {String(resolveLanguageKey(`fields.!enums.status.${entity.status}`))}
                                    </Badge>
                                ) : undefined
                            }
                        >
                            <AdCampaignRowMenuExtras campaign={entity} onAction={setAction} />
                        </EntityCard.Header>
                        <EntityCard.Body>
                            <EntityCardRow
                                icon={IconBroadcast}
                                label={resolveLanguageKey("fields.campaignType")}
                                tooltip={resolveLanguageKey("fields.campaignType")}
                                path="campaignType"
                                value={String(resolveLanguageKey(`fields.!enums.campaignType.${entity.campaignType}`))}
                            />
                            <EntityCardRow
                                icon={IconMail}
                                label={resolveLanguageKey("fields.template")}
                                tooltip={resolveLanguageKey("fields.template")}
                                path="template.name"
                                value={entity.template?.name}
                            />
                            <EntityCardRow
                                icon={IconCalendarBolt}
                                label={resolveLanguageKey("fields.scheduledAt")}
                                tooltip={resolveLanguageKey("fields.scheduledAt")}
                                path="scheduledAt"
                                type="date"
                                value={entity.scheduledAt}
                            />
                            {/* Sent / total is the number an operator actually wants at a
                                glance; the full breakdown lives in the sheet. */}
                            <EntityCardRow
                                icon={IconUsers}
                                label={resolveLanguageKey("fields.progress")}
                                tooltip={resolveLanguageKey("fields.progress")}
                                path="stats"
                                value={stats ? `${stats.sent} / ${stats.total}` : undefined}
                            />
                        </EntityCard.Body>
                    </>
                );
            }}
        </EntityCard>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/adCampaigns/center/cardView/adCampaignCard.tsx"),
    withDebug(true, true, "adcampaigns"),
)(AdCampaignCard);
