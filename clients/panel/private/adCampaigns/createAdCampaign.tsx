import {IconPlus} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/pages/createGenericCreatePage.tsx";
import {createAdCampaignFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/adCampaign/createAdCampaign.form.validator.ts";
import {
    AD_CAMPAIGN_BATCH_SIZE_DEFAULT,
    AD_CAMPAIGN_TYPE_VALUES,
    type AdCampaignType,
} from "armonia/src/modules/propertyManagement/api/realEstate/private/adCampaign/adCampaign.constants.ts";
import type {CreateAdCampaignFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/adCampaign/adCampaign.schema-def.ts";

function campaignTypeFromParams(params: URLSearchParams): AdCampaignType {
    const raw = params.get("campaignType");
    return AD_CAMPAIGN_TYPE_VALUES.includes(raw as AdCampaignType) ? (raw as AdCampaignType) : "offer";
}

export default createGenericCreatePage<CreateAdCampaignFormType>({
    languagePath: "src/modules/propertyManagement/clients/panel/private/adCampaigns/createAdCampaign.tsx",
    model: "adcampaigns",
    apiUrl: "/api/realEstate/adCampaign",
    schema: createAdCampaignFormSchema,
    defaultValues: (params) => ({
        title: "",
        campaignType: campaignTypeFromParams(params),
        template: params.get("templateId") ?? "",
        audienceMode: "selected",
        recipients: [],
        leadRecipients: [],
        includeClientUsers: true,
        includeLeads: false,
        projects: [],
        units: [],
        offerTitle: "",
        ctaUrl: "",
        contentUnit: undefined,
        contentProject: undefined,
        subjectOverride: "",
        bodyHtmlOverride: "",
        batchSize: AD_CAMPAIGN_BATCH_SIZE_DEFAULT,
        fromName: "",
        replyTo: "",
    }),
    successPath: "/tenancy/systemSettings/adCampaigns",
    submitIcon: <IconPlus />,
});
