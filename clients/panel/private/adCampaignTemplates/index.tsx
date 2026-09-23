import {compose} from "redux";
import {IconPlus} from "@tabler/icons-react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage from "@coreModule/components/entityPage/pages/entityListPage.tsx";
import {GRID_TRANSACTIONAL} from "@propertyManagementModule/components/custom/cards/entityCard.constants.ts";
import type {AdCampaignTemplate} from "armonia/src/modules/propertyManagement/api/realEstate/private/adCampaignTemplate/adCampaignTemplate.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import AdCampaignTemplateCard from "@propertyManagementModule/clients/panel/private/adCampaignTemplates/center/cardView/adCampaignTemplateCard.tsx";

function buildEditPath(row: AdCampaignTemplate) {
    const params = new URLSearchParams();
    params.set("adCampaignTemplateId", row._id);
    if (row.name) params.set("adCampaignTemplateName", row.name);
    return `/tenancy/systemSettings/adCampaignTemplates/edit?${params.toString()}`;
}

function AllAdCampaignTemplates({resolveLanguageKey}: WithLanguageType) {
    return (
        <EntityListPage<AdCampaignTemplate>
            apiUrl="/api/realEstate/adCampaignTemplate"
            collectionName="adcampaigntemplates"
            accessModel="adcampaigntemplates"
            tableConfigKey="adcampaigntemplates"
            createPath="/tenancy/systemSettings/adCampaignTemplates/create"
            createIcon={<IconPlus className="h-4 w-4" />}
            createLanguageKey="createAdCampaignTemplate"
            buildEditPath={buildEditPath}
            resolveLanguageKey={resolveLanguageKey}
            sheetLanguagePath="src/modules/propertyManagement/clients/panel/private/adCampaignTemplates/center/sheetView/adCampaignTemplateSheetView.tsx"
            cardViewClassName={GRID_TRANSACTIONAL}
            renderCard={(row, onDelete, onRestore) => (
                <AdCampaignTemplateCard
                    entity={row}
                    onDelete={(r: AdCampaignTemplate | undefined, response?: DeletedData) => onDelete(r, response)}
                    onRestore={() => onRestore(row)}
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/adCampaignTemplates/index.tsx"),
    withDebug(true, true, "adcampaigntemplates"),
)(AllAdCampaignTemplates);
