import {IconPlus} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/pages/createGenericCreatePage.tsx";
import {createAdCampaignTemplateFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/adCampaignTemplate/createAdCampaignTemplate.form.validator.ts";
import type {CreateAdCampaignTemplateFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/adCampaignTemplate/adCampaignTemplate.schema-def.ts";

export default createGenericCreatePage<CreateAdCampaignTemplateFormType>({
    languagePath: "src/modules/propertyManagement/clients/panel/private/adCampaignTemplates/createAdCampaignTemplate.tsx",
    model: "adcampaigntemplates",
    apiUrl: "/api/realEstate/adCampaignTemplate",
    schema: createAdCampaignTemplateFormSchema,
    defaultValues: () => ({
        name: "",
        subject: "",
        previewText: "",
        bodyHtml: "",
        // The editor's live preview needs both before it can render anything,
        // so the form opens on a type and locale rather than two empty selects.
        campaignType: "offer",
        locale: "en-US",
        active: true,
    } as any),
    successPath: "/tenancy/systemSettings/adCampaignTemplates",
    submitIcon: <IconPlus />,
});
