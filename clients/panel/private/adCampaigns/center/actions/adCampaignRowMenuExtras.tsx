import {compose} from "redux";
import {Ban, Pause, Play, Send, Users} from "lucide-react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useNavigate} from "react-router-dom";
import {DropdownMenuItem, DropdownMenuSeparator} from "@coreModule/components/ui/dropdown-menu.tsx";
import {useAccess} from "@coreModule/helpers/hooks/useAccess.ts";
import type {AdCampaign} from "armonia/src/modules/propertyManagement/api/realEstate/private/adCampaign/adCampaign.dto.ts";

export const SEND_AD_CAMPAIGN_ACTION = "sendAdCampaignNow";
export const PAUSE_AD_CAMPAIGN_ACTION = "pauseAdCampaign";
export const RESUME_AD_CAMPAIGN_ACTION = "resumeAdCampaign";
export const CANCEL_AD_CAMPAIGN_ACTION = "cancelAdCampaign";

/** Statuses a campaign can still be queued from — mirrors `adCampaignService.isEditable`. */
const SENDABLE = new Set(["draft", "scheduled", "paused", "failed"]);

type AdCampaignRowMenuExtrasProps = WithLanguageType & {
    campaign: AdCampaign;
    onAction: (action: string) => void;
};

function AdCampaignRowMenuExtras({campaign, onAction, resolveLanguageKey}: AdCampaignRowMenuExtrasProps) {
    const navigate = useNavigate();
    const {write, create} = useAccess("adcampaigns");

    const isDeleted = campaign.deletedAt != null || campaign.deletedBy != null;
    if (isDeleted || !campaign._id) return null;

    // Same gate as the server action: sending is bound to *create*, not write,
    // so "may edit a draft" does not imply "may email thousands of clients".
    const canSend = create === true;
    const canManage = write === true || (typeof write === "object" && write !== null);

    const status = campaign.status;
    const recipientsParams = new URLSearchParams();
    recipientsParams.set("adCampaignId", campaign._id);
    if (campaign.title) recipientsParams.set("adCampaignName", campaign.title);

    return (
        <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    navigate(`/tenancy/systemSettings/adCampaigns/recipients?${recipientsParams.toString()}`);
                }}
            >
                <Users className="h-4 w-4" />
                <span>{resolveLanguageKey("viewRecipients")}</span>
            </DropdownMenuItem>

            {canSend && SENDABLE.has(status) ? (
                <DropdownMenuItem onClick={() => onAction(SEND_AD_CAMPAIGN_ACTION)}>
                    <Send className="h-4 w-4 text-primary" />
                    <span>{resolveLanguageKey(status === "paused" ? "resend" : "sendNow")}</span>
                </DropdownMenuItem>
            ) : null}

            {canManage && (status === "sending" || status === "scheduled") ? (
                <DropdownMenuItem onClick={() => onAction(PAUSE_AD_CAMPAIGN_ACTION)}>
                    <Pause className="h-4 w-4" />
                    <span>{resolveLanguageKey("pause")}</span>
                </DropdownMenuItem>
            ) : null}

            {canSend && status === "paused" ? (
                <DropdownMenuItem onClick={() => onAction(RESUME_AD_CAMPAIGN_ACTION)}>
                    <Play className="h-4 w-4" />
                    <span>{resolveLanguageKey("resume")}</span>
                </DropdownMenuItem>
            ) : null}

            {canManage && status !== "completed" && status !== "cancelled" ? (
                <DropdownMenuItem
                    variant="destructive"
                    onClick={() => onAction(CANCEL_AD_CAMPAIGN_ACTION)}
                >
                    <Ban className="h-4 w-4" />
                    <span>{resolveLanguageKey("cancelCampaign")}</span>
                </DropdownMenuItem>
            ) : null}
        </>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/adCampaigns/center/actions/adCampaignRowMenuExtras.tsx"),
    withDebug(true, true, "adcampaigns"),
)(AdCampaignRowMenuExtras);
