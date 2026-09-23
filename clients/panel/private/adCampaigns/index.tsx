import {compose} from "redux";
import {useMemo} from "react";
import {IconPlus} from "@tabler/icons-react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage, {type QuickFilterDef} from "@coreModule/components/entityPage/pages/entityListPage.tsx";
import {COLUMN_TYPE} from "armonia/src/modules/core/database/filter/typeOperators";
import {
    AD_CAMPAIGN_STATUS_VALUES,
    AD_CAMPAIGN_TYPE_VALUES,
} from "armonia/src/modules/propertyManagement/api/realEstate/private/adCampaign/adCampaign.constants.ts";
import type {AdCampaign} from "armonia/src/modules/propertyManagement/api/realEstate/private/adCampaign/adCampaign.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import {GRID_TRANSACTIONAL} from "@propertyManagementModule/components/custom/cards/entityCard.constants.ts";
import AdCampaignCard from "@propertyManagementModule/clients/panel/private/adCampaigns/center/cardView/adCampaignCard.tsx";

function buildEditPath(row: AdCampaign) {
    const params = new URLSearchParams();
    params.set("adCampaignId", row._id);
    if (row.title) params.set("adCampaignName", row.title);
    return `/tenancy/systemSettings/adCampaigns/edit?${params.toString()}`;
}

function AllAdCampaigns({resolveLanguageKey}: WithLanguageType) {
    // Built from the shared enums so a new campaign type or status cannot be
    // added on the server and quietly go missing from the filter bar.
    const quickFilters = useMemo<QuickFilterDef[]>(() => [
        {
            field: "campaignType",
            label: String(resolveLanguageKey("fields.campaignType")),
            type: COLUMN_TYPE.ENUM,
            enumValues: AD_CAMPAIGN_TYPE_VALUES.map((value) => ({
                value,
                label: String(resolveLanguageKey(`fields.!enums.campaignType.${value}`)),
            })),
        },
        {
            field: "status",
            label: String(resolveLanguageKey("fields.status")),
            type: COLUMN_TYPE.ENUM,
            enumValues: AD_CAMPAIGN_STATUS_VALUES.map((value) => ({
                value,
                label: String(resolveLanguageKey(`fields.!enums.status.${value}`)),
            })),
        },
    ], [resolveLanguageKey]);

    return (
        <EntityListPage<AdCampaign>
            apiUrl="/api/realEstate/adCampaign"
            collectionName="adcampaigns"
            accessModel="adcampaigns"
            tableConfigKey="adcampaigns"
            createPath="/tenancy/systemSettings/adCampaigns/create"
            createIcon={<IconPlus className="h-4 w-4" />}
            createLanguageKey="createAdCampaign"
            buildEditPath={buildEditPath}
            quickFilters={quickFilters}
            resolveLanguageKey={resolveLanguageKey}
            sheetLanguagePath="src/modules/propertyManagement/clients/panel/private/adCampaigns/center/sheetView/adCampaignSheetView.tsx"
            cardViewClassName={GRID_TRANSACTIONAL}
            renderCard={(row, onDelete, onRestore) => (
                <AdCampaignCard
                    campaign={row}
                    onDelete={(r: AdCampaign | undefined, response?: DeletedData) => onDelete(r, response)}
                    onRestore={() => onRestore(row)}
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/adCampaigns/index.tsx"),
    withDebug(true, true, "adcampaigns"),
)(AllAdCampaigns);
