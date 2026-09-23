import {compose} from "redux";
import {useMemo} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage, {type QuickFilterDef} from "@coreModule/components/entityPage/pages/entityListPage.tsx";
import {buildPageTitle} from "@coreModule/helpers/general/pageTitle.ts";
import {COLUMN_TYPE} from "armonia/src/modules/core/database/filter/typeOperators";
import {
    AD_CAMPAIGN_RECIPIENT_STATUS_VALUES,
    AD_CAMPAIGN_SKIP_REASON_VALUES,
} from "armonia/src/modules/propertyManagement/api/realEstate/private/adCampaign/adCampaign.constants.ts";
import type {AdCampaignRecipient} from "armonia/src/modules/propertyManagement/api/realEstate/private/adCampaignRecipient/adCampaignRecipient.dto.ts";
import {GRID_COLS_MAX_4, GRID_TRANSACTIONAL} from "@propertyManagementModule/components/custom/cards/entityCard.constants.ts";
import {cn} from "@coreModule/components/lib/utils.ts";
import AdCampaignRecipientCard from "@propertyManagementModule/clients/panel/private/adCampaigns/recipients/center/cardView/adCampaignRecipientCard.tsx";

type Props = WithLanguageType & {
    campaignId?: string;
    campaignName?: string;
};

/**
 * Per-recipient delivery results for one campaign.
 *
 * Always scoped to a campaign: an unscoped list of every address the tenant has
 * ever mailed is a privacy liability and tells an operator nothing. Filtering
 * by status is the whole point of the page — "who failed" and "who was
 * suppressed" are the two questions it exists to answer.
 */
function AdCampaignRecipients({resolveLanguageKey, campaignId, campaignName}: Props) {
    const quickFilters = useMemo<QuickFilterDef[]>(() => [
        {
            field: "status",
            label: String(resolveLanguageKey("fields.status")),
            type: COLUMN_TYPE.ENUM,
            enumValues: AD_CAMPAIGN_RECIPIENT_STATUS_VALUES.map((value) => ({
                value,
                label: String(resolveLanguageKey(`fields.!enums.status.${value}`)),
            })),
        },
        {
            field: "skipReason",
            label: String(resolveLanguageKey("fields.skipReason")),
            type: COLUMN_TYPE.ENUM,
            enumValues: AD_CAMPAIGN_SKIP_REASON_VALUES.map((value) => ({
                value,
                label: String(resolveLanguageKey(`fields.!enums.skipReason.${value}`)),
            })),
        },
    ], [resolveLanguageKey]);

    return (
        <EntityListPage<AdCampaignRecipient>
            apiUrl="/api/realEstate/adCampaignRecipient"
            collectionName="adcampaignrecipients"
            accessModel="adcampaignrecipients"
            tableConfigKey="adcampaignrecipients"
            buildEditPath={() => ""}
            headerTitle={buildPageTitle(resolveLanguageKey("title"), [campaignName])}
            quickFilters={quickFilters}
            extraFilters={campaignId ? {campaign: campaignId} : undefined}
            resolveLanguageKey={resolveLanguageKey}
            sheetLanguagePath="src/modules/propertyManagement/clients/panel/private/adCampaigns/recipients/center/sheetView/adCampaignRecipientSheetView.tsx"
            cardViewClassName={cn(GRID_TRANSACTIONAL, GRID_COLS_MAX_4)}
            rowActionMenu={{hideDelete: true, hideRestore: true, hideEdit: true}}
            renderCard={(row) => <AdCampaignRecipientCard entity={row} />}
        />
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/adCampaigns/recipients/index.tsx"),
    withDebug(true, true, "adcampaignrecipients"),
)(AdCampaignRecipients);
