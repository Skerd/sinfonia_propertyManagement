import {IconPlus} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/pages/createGenericCreatePage.tsx";
import {createAdCampaignTemplateFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/adCampaignTemplate/createAdCampaignTemplate.form.validator.ts";
import type {CreateAdCampaignTemplateFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/adCampaignTemplate/adCampaignTemplate.schema-def.ts";

export default createGenericCreatePage<CreateAdCampaignTemplateFormType>({
    languagePath: "src/modules/propertyManagement/clients/panel/private/adCampaignTemplates/createAdCampaignTemplate.tsx",
    model: "adcampaigntemplates",
    apiUrl: "/api/realEstate/adCampaignTemplate",
    schema: createAdCampaignTemplateFormSchema,
    successPath: "/tenancy/systemSettings/adCampaignTemplates",
    submitIcon: <IconPlus />,
});
