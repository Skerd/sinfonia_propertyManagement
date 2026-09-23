import {Save} from "lucide-react";
import {createGenericEditPage} from "@coreModule/components/entityPage/pages/createGenericEditPage.tsx";
import {editAdCampaignTemplateFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/adCampaignTemplate/editAdCampaignTemplate.form.validator.ts";
import type {AdCampaignTemplate} from "armonia/src/modules/propertyManagement/api/realEstate/private/adCampaignTemplate/adCampaignTemplate.dto.ts";
import type {EditAdCampaignTemplateFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/adCampaignTemplate/adCampaignTemplate.schema-def.ts";

export default createGenericEditPage<AdCampaignTemplate, EditAdCampaignTemplateFormType>({
    languagePath: "src/modules/propertyManagement/clients/panel/private/adCampaignTemplates/editAdCampaignTemplate.tsx",
    model: "adcampaigntemplates",
    apiUrl: "/api/realEstate/adCampaignTemplate",
    schema: editAdCampaignTemplateFormSchema,
    submitIcon: <Save />,
});
