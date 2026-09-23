import type {AdCampaignTemplate} from "armonia/src/modules/propertyManagement/api/realEstate/private/adCampaignTemplate/adCampaignTemplate.dto.ts";
import {
    ActivateAdCampaignTemplateDialog,
    DeactivateAdCampaignTemplateDialog,
} from "@propertyManagementModule/components/custom/adCampaignTemplate/adCampaignTemplateActionDialog.tsx";
import {
    ACTIVATE_AD_CAMPAIGN_TEMPLATE_ACTION,
    DEACTIVATE_AD_CAMPAIGN_TEMPLATE_ACTION,
} from "@propertyManagementModule/clients/panel/private/adCampaignTemplates/center/actions/adCampaignTemplateRowMenuExtras.tsx";

type AdCampaignTemplateWorkflowDialogsProps = {
    action: string;
    template?: AdCampaignTemplate | null;
    onClose: () => void;
    onSuccess: (updated?: AdCampaignTemplate) => void;
};

export default function AdCampaignTemplateWorkflowDialogs({
    action,
    template,
    onClose,
    onSuccess,
}: AdCampaignTemplateWorkflowDialogsProps) {
    if (!template || !action) return null;
    if (action === ACTIVATE_AD_CAMPAIGN_TEMPLATE_ACTION) {
        return <ActivateAdCampaignTemplateDialog open onClose={onClose} template={template} onSuccess={onSuccess} />;
    }
    if (action === DEACTIVATE_AD_CAMPAIGN_TEMPLATE_ACTION) {
        return <DeactivateAdCampaignTemplateDialog open onClose={onClose} template={template} onSuccess={onSuccess} />;
    }
    return null;
}
