import type {AdCampaign} from "armonia/src/modules/propertyManagement/api/realEstate/private/adCampaign/adCampaign.dto.ts";
import {
    CancelAdCampaignDialog,
    PauseAdCampaignDialog,
    ResumeAdCampaignDialog,
    SendAdCampaignNowDialog,
} from "@propertyManagementModule/components/custom/adCampaign/adCampaignActionDialog.tsx";
import {
    CANCEL_AD_CAMPAIGN_ACTION,
    PAUSE_AD_CAMPAIGN_ACTION,
    RESUME_AD_CAMPAIGN_ACTION,
    SEND_AD_CAMPAIGN_ACTION,
} from "@propertyManagementModule/clients/panel/private/adCampaigns/center/actions/adCampaignRowMenuExtras.tsx";

type AdCampaignWorkflowDialogsProps = {
    action: string;
    campaign?: AdCampaign | null;
    onClose: () => void;
    onSuccess: (updated?: AdCampaign) => void;
};

export default function AdCampaignWorkflowDialogs({
    action,
    campaign,
    onClose,
    onSuccess,
}: AdCampaignWorkflowDialogsProps) {
    if (!campaign || !action) return null;
    if (action === SEND_AD_CAMPAIGN_ACTION) {
        return <SendAdCampaignNowDialog open onClose={onClose} campaign={campaign} onSuccess={onSuccess} />;
    }
    if (action === PAUSE_AD_CAMPAIGN_ACTION) {
        return <PauseAdCampaignDialog open onClose={onClose} campaign={campaign} onSuccess={onSuccess} />;
    }
    if (action === RESUME_AD_CAMPAIGN_ACTION) {
        return <ResumeAdCampaignDialog open onClose={onClose} campaign={campaign} onSuccess={onSuccess} />;
    }
    if (action === CANCEL_AD_CAMPAIGN_ACTION) {
        return <CancelAdCampaignDialog open onClose={onClose} campaign={campaign} onSuccess={onSuccess} />;
    }
    return null;
}
