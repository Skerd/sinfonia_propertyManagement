import {compose} from "redux";
import type {RefObject} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {IconCalendarBolt, IconBan, IconRefresh, IconUser} from "@tabler/icons-react";
import type {AdCampaignRecipient} from "armonia/src/modules/propertyManagement/api/realEstate/private/adCampaignRecipient/adCampaignRecipient.dto.ts";
import type {AdCampaignRecipientStatus} from "armonia/src/modules/propertyManagement/api/realEstate/private/adCampaign/adCampaign.constants.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import {Badge} from "@coreModule/components/ui/badge.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import EntityCard from "@coreModule/components/entityPage/list/card/entityCard.tsx";
import EntityCardRow from "@coreModule/components/entityPage/list/card/entityCardRow.tsx";
import {
    STATUS_BADGE_DANGER,
    STATUS_BADGE_INFO,
    STATUS_BADGE_NEUTRAL,
    STATUS_BADGE_SUCCESS,
    STATUS_BADGE_WARNING,
} from "@propertyManagementModule/components/custom/cards/entityCard.constants.ts";
import Sheet from "@propertyManagementModule/clients/panel/private/adCampaigns/recipients/center/sheetView/adCampaignRecipientSheetView.tsx";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";

const STATUS_BADGE: Record<AdCampaignRecipientStatus, string> = {
    pending: STATUS_BADGE_NEUTRAL,
    queued: STATUS_BADGE_INFO,
    sent: STATUS_BADGE_SUCCESS,
    failed: STATUS_BADGE_DANGER,
    skipped: STATUS_BADGE_WARNING,
    suppressed: STATUS_BADGE_WARNING,
};

type AdCampaignRecipientCardProps = WithLanguageType & {
    entity: AdCampaignRecipient;
    fetchId?: string;
    hideActions?: boolean;
    onDelete?: (deleted?: AdCampaignRecipient, response?: DeletedData) => void;
    onRestore?: () => void;
    sheetOnly?: boolean;
    innerRef?: RefObject<WithAxiosLifecycleRef<AdCampaignRecipient> | null>;
};

function AdCampaignRecipientCard({
    resolveLanguageKey,
    entity,
    fetchId,
    onDelete,
    onRestore,
    sheetOnly = false,
    innerRef,
}: AdCampaignRecipientCardProps) {
    return (
        <EntityCard
            resource="adcampaignrecipients"
            entity={entity}
            fetchId={fetchId}
            singleUrl="/api/realEstate/adCampaignRecipient/single"
            onDelete={onDelete}
            onRestore={onRestore}
            // Machine-written rows: view only. `hideActions` is what stops the
            // menu rendering; the three props below are required by the type but
            // unreachable, and the server refuses the writes regardless — every
            // field on this model carries `SYSTEM_WRITE`.
            hideActions
            editPath={() => ""}
            deleteUrl="/api/realEstate/adCampaignRecipient"
            restoreUrl="/api/realEstate/adCampaignRecipient/restore"
            sheetOnly={sheetOnly}
            Sheet={Sheet}
            sheetEntityProp="entity"
            failedTitle={String(resolveLanguageKey("failedTitle") || "")}
            failedDescription={String(resolveLanguageKey("failedDescription") || "")}
            titlePath="email"
            innerRef={innerRef}
            sheetProps={() => ({fetchId})}
        >
            {({entity: row}) => (
                <>
                    <EntityCard.Header
                        titlePath="email"
                        title={row.email}
                        subtitle={row.fullName}
                        subtitlePath="fullName"
                        badges={
                            row.status ? (
                                <Badge
                                    variant="secondary"
                                    className={cn("text-xs", STATUS_BADGE[row.status] ?? STATUS_BADGE_NEUTRAL)}
                                >
                                    {String(resolveLanguageKey(`fields.!enums.status.${row.status}`))}
                                </Badge>
                            ) : undefined
                        }
                    />
                    <EntityCard.Body>
                        <EntityCardRow
                            icon={IconUser}
                            label={resolveLanguageKey("fields.audienceKind")}
                            tooltip={resolveLanguageKey("fields.audienceKind")}
                            path="audienceKind"
                            value={String(resolveLanguageKey(`fields.!enums.audienceKind.${row.audienceKind}`))}
                        />
                        <EntityCardRow
                            icon={IconBan}
                            label={resolveLanguageKey("fields.skipReason")}
                            tooltip={resolveLanguageKey("fields.skipReason")}
                            path="skipReason"
                            value={row.skipReason
                                ? String(resolveLanguageKey(`fields.!enums.skipReason.${row.skipReason}`))
                                : undefined}
                        />
                        <EntityCardRow
                            icon={IconRefresh}
                            label={resolveLanguageKey("fields.attempts")}
                            tooltip={resolveLanguageKey("fields.attempts")}
                            path="attempts"
                            type="number"
                            value={row.attempts}
                        />
                        <EntityCardRow
                            icon={IconCalendarBolt}
                            label={resolveLanguageKey("fields.sentAt")}
                            tooltip={resolveLanguageKey("fields.sentAt")}
                            path="sentAt"
                            type="date"
                            value={row.sentAt}
                        />
                    </EntityCard.Body>
                </>
            )}
        </EntityCard>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/adCampaigns/recipients/center/cardView/adCampaignRecipientCard.tsx"),
    withDebug(true, true, "adcampaignrecipients"),
)(AdCampaignRecipientCard);
