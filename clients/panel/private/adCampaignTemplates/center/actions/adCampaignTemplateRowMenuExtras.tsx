import {compose} from "redux";
import {CircleDot, CircleOff} from "lucide-react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {DropdownMenuItem, DropdownMenuSeparator} from "@coreModule/components/ui/dropdown-menu.tsx";
import {useAccess} from "@coreModule/helpers/hooks/useAccess.ts";
import type {AdCampaignTemplate} from "armonia/src/modules/propertyManagement/api/realEstate/private/adCampaignTemplate/adCampaignTemplate.dto.ts";

export const ACTIVATE_AD_CAMPAIGN_TEMPLATE_ACTION = "activateAdCampaignTemplate";
export const DEACTIVATE_AD_CAMPAIGN_TEMPLATE_ACTION = "deactivateAdCampaignTemplate";

type AdCampaignTemplateRowMenuExtrasProps = WithLanguageType & {
    template: AdCampaignTemplate;
    onAction: (action: string) => void;
};

/**
 * Only the side that would change anything is offered, so the menu states the
 * current condition rather than making someone read a switch to find out.
 */
function AdCampaignTemplateRowMenuExtras({
    template,
    onAction,
    resolveLanguageKey,
}: AdCampaignTemplateRowMenuExtrasProps) {
    const {write} = useAccess("adcampaigntemplates");

    const isDeleted = template.deletedAt != null || template.deletedBy != null;
    if (isDeleted || !template._id) return null;

    const canManage = write === true || (typeof write === "object" && write !== null);
    if (!canManage) return null;

    // Rows written before `active` existed have it undefined, which the sender
    // treats as live — so anything but an explicit `false` is active here too.
    const isActive = template.active !== false;

    return (
        <>
            <DropdownMenuSeparator />
            {isActive ? (
                <DropdownMenuItem onClick={() => onAction(DEACTIVATE_AD_CAMPAIGN_TEMPLATE_ACTION)}>
                    <CircleOff className="h-4 w-4" />
                    <span>{resolveLanguageKey("deactivate")}</span>
                </DropdownMenuItem>
            ) : (
                <DropdownMenuItem onClick={() => onAction(ACTIVATE_AD_CAMPAIGN_TEMPLATE_ACTION)}>
                    <CircleDot className="h-4 w-4 text-primary" />
                    <span>{resolveLanguageKey("activate")}</span>
                </DropdownMenuItem>
            )}
        </>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/adCampaignTemplates/center/actions/adCampaignTemplateRowMenuExtras.tsx"),
    withDebug(true, true, "adcampaigntemplates"),
)(AdCampaignTemplateRowMenuExtras);
