import {IconPlus} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/pages/createGenericCreatePage.tsx";
import {createAdCampaignFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/adCampaign/createAdCampaign.form.validator.ts";
import {AD_CAMPAIGN_BATCH_SIZE_DEFAULT} from "armonia/src/modules/propertyManagement/api/realEstate/private/adCampaign/adCampaign.constants.ts";
import type {CreateAdCampaignFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/adCampaign/adCampaign.schema-def.ts";

export default createGenericCreatePage<CreateAdCampaignFormType>({
    languagePath: "src/modules/propertyManagement/clients/panel/private/adCampaigns/createAdCampaign.tsx",
    model: "adcampaigns",
    apiUrl: "/api/realEstate/adCampaign",
    schema: createAdCampaignFormSchema,
    defaultValues: () => ({
        title: "",
        campaignType: "offer",
        // `selected` by default: an accidental submit then reaches the people
        // that were deliberately picked, not the entire client base.
        audienceMode: "selected",
        recipients: [],
        leadRecipients: [],
        includeClientUsers: true,
        includeLeads: false,
        projects: [],
        units: [],
        subjectOverride: "",
        bodyHtmlOverride: "",
        batchSize: AD_CAMPAIGN_BATCH_SIZE_DEFAULT,
        fromName: "",
        replyTo: "",
    } as any),
    successPath: "/tenancy/systemSettings/adCampaigns",
    submitIcon: <IconPlus />,
});
