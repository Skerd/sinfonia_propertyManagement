import {compose} from "redux";
import {InfoRowGroup} from "@coreModule/components/custom/infoRowGroup.tsx";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import HiddenElement from "@coreModule/components/custom/hiddenElement.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import {Badge} from "@coreModule/components/ui/badge.tsx";
import {Avatar, AvatarFallback} from "@coreModule/components/ui/avatar.tsx";
import {Separator} from "@coreModule/components/ui/separator.tsx";
import {IconBuilding, IconCalendar, IconCurrencyDollar, IconDoor, IconPhone, IconUser} from "@tabler/icons-react";
import {cn} from "@coreModule/components/lib/utils.ts";
import {formatCardDecimal} from "@propertyManagementModule/helpers/general/formatCardNumber.ts";
import {Lead} from "armonia/src/modules/propertyManagement/api/realEstate/private/lead/lead.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import {useEntityCard} from "@coreModule/helpers/hooks/useEntityCard.ts";
import InfoRow from "@coreModule/components/custom/infoRow.tsx";
import TooltipDisplayer from "@coreModule/components/custom/tooltipDisplayer.tsx";
import LeadSheetView from "@propertyManagementModule/clients/panel/private/leads/center/sheetView/leadSheetView.tsx";
import DeleteAction from "@coreModule/components/custom/actions/deleteAction.tsx";
import RestoreAction from "@coreModule/components/custom/actions/restoreAction.tsx";
import ActionMenu from "@coreModule/components/custom/actions/menu/actionMenu.tsx";
import AddLeadActivity, {ADD_LEAD_ACTIVITY_ACTION} from "@propertyManagementModule/clients/panel/private/leads/center/actions/addActivity.tsx";
import AddLeadActivityDialog from "@propertyManagementModule/components/custom/leads/addLeadActivityDialog.tsx";
import {EntityCardShell} from "@propertyManagementModule/components/custom/cards/EntityCardShell.tsx";
import {EntityTextCardHeader} from "@propertyManagementModule/components/custom/cards/EntityTextCardHeader.tsx";
import {
    CARD_BODY_CLASS,
    STATUS_BADGE_INFO,
    STATUS_BADGE_NEUTRAL,
} from "@propertyManagementModule/components/custom/cards/entityCard.constants.ts";

function leadEditPath(lead: Lead) {
    const params = new URLSearchParams();
    params.set("leadId", lead._id);
    const fullName = [lead.firstName, lead.lastName].filter(Boolean).join(" ");
    if (fullName) params.set("leadName", fullName);
    return `/realEstate/leads/edit?${params.toString()}`;
}

function getStatusBadgeClass(status?: string): string {
    switch (status) {
        case "new":         return STATUS_BADGE_INFO;
        case "contacted":   return STATUS_BADGE_NEUTRAL;
        case "qualified":   return "border-status-sold/30 bg-status-sold/10 text-status-sold";
        case "proposal":    return "border-primary/30 bg-primary/10 text-primary";
        case "negotiation": return "border-status-reserved/30 bg-status-reserved/10 text-status-reserved";
        case "won":         return "border-status-sold/30 bg-status-sold/10 text-status-sold";
        case "lost":        return "border-status-blocked/30 bg-status-blocked/10 text-status-blocked";
        default:            return STATUS_BADGE_NEUTRAL;
    }
}

function getInitials(lead: Lead): string {
    const f = lead.firstName?.[0] ?? "";
    const l = lead.lastName?.[0] ?? "";
    return (f + l).toUpperCase() || "?";
}

type LeadCardProps = WithLanguageType & {
    lead: Lead;
    hideActions?: boolean;
    onDelete?: (deletedLead?: Lead, response?: DeletedData) => void;
    onRestore?: () => void;
    onActivitySuccess?: (updated?: Lead) => void;
};

function LeadCard({
    lead: leadProp,
    resolveLanguageKey,
    hideActions = false,
    onDelete: onDeleteProp,
    onRestore: onRestoreProp,
    onActivitySuccess,
}: LeadCardProps) {
    const {action, setAction, entity: lead, hideAfterDeletion, onDelete, onRestore} = useEntityCard({
        entityProp: leadProp,
        onDeleteProp,
        onRestoreProp,
    });

    const {read, restore, write} = useAccess("leads");

    if (hideAfterDeletion || !restore) return <></>;
    if (!read || !Object.keys(read).length) return <HiddenElement />;

    const fullName = [lead.firstName, lead.lastName].filter(Boolean).join(" ");
    const budget = lead.budget != null
        ? `${lead.budgetCurrency?.symbol ?? lead.budgetCurrency?.abbreviation ?? ""} ${formatCardDecimal(lead.budget)}`.trim()
        : null;

    return (
        <>
            <EntityCardShell onClick={() => setAction("view")}>
                <EntityTextCardHeader
                    title={(fullName || lead.name)}
                    badges={<>
                            {!!read?.status && lead.status && (
                                <TooltipDisplayer tooltip={resolveLanguageKey("statusLabel") as string}>
                                    <Badge variant="outline" className={cn("text-xs", getStatusBadgeClass(lead.status))}>
                                        {resolveLanguageKey(`status.${lead.status}`)}
                                    </Badge>
                                </TooltipDisplayer>
                            )}
                            {!!read?.source && lead.source && (
                                <TooltipDisplayer tooltip={resolveLanguageKey("sourceLabel") as string}>
                                    <Badge variant="outline" className="text-xs text-muted-foreground">
                                        {resolveLanguageKey(`source.${lead.source}`)}
                                    </Badge>
                                </TooltipDisplayer>
                            )}
                            {!!read?.interest && lead.interest && (
                                <TooltipDisplayer tooltip={resolveLanguageKey("interestLabel") as string}>
                                    <Badge variant="outline" className="text-xs text-muted-foreground">
                                        {resolveLanguageKey(`interest.${lead.interest}`)}
                                    </Badge>
                                </TooltipDisplayer>
                            )}
                        </>
                    }
                    showTitle={!!read?.firstName}
                    showBadges={!!(read?.status || read?.source || read?.interest)}
                    hideActions={hideActions}
                    actionMenu={
                        <ActionMenu
                            accessModel="leads"
                            deletedData={lead}
                            onAction={(a: string) => setAction(a)}
                            editPath={leadEditPath(lead)}
                            allowMenuForCustomChildren={!!write && !lead.deletedAt}
                        >
                            <AddLeadActivity lead={lead} onAction={(a: string) => setAction(a)} />
                        </ActionMenu>
                    }
                />
                <Separator />
                <div className={CARD_BODY_CLASS}>
                    <InfoRowGroup>
                        <InfoRow
                            icon={IconPhone}
                            label={resolveLanguageKey("phone")}
                            show={!!read?.phone}
                            value={lead.phone ? (
                                <a
                                    href={`tel:${lead.phone}`}
                                    className="text-xs text-muted-foreground hover:underline"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {lead.phone}
                                </a>
                            ) : null}
                        />
                        <InfoRow
                            icon={IconBuilding}
                            label={resolveLanguageKey("projectInterest")}
                            show={!!read?.projectInterest}
                            value={lead.projectInterest?.name ? (
                                <span className="text-xs text-muted-foreground">{lead.projectInterest.name}</span>
                            ) : null}
                        />
                        <InfoRow
                            icon={IconDoor}
                            label={resolveLanguageKey("unitInterest")}
                            show={!!read?.unitInterest}
                            value={lead.unitInterest ? (
                                <span className="text-xs text-muted-foreground">
                                    {lead.unitInterest.name ?? lead.unitInterest.unitNumber}
                                </span>
                            ) : null}
                        />
                        <InfoRow
                            icon={IconCurrencyDollar}
                            label={resolveLanguageKey("budget")}
                            show={!!read?.budget}
                            value={budget ? (
                                <span className="text-xs font-medium text-status-sold">{budget}</span>
                            ) : null}
                        />
                    </InfoRowGroup>
                    <Separator />
                    <InfoRowGroup>
                        <InfoRow
                            icon={IconUser}
                            label={resolveLanguageKey("assignedTo")}
                            show={!!read?.assignedTo}
                            value={lead.assignedTo ? (
                                <span className="text-xs text-muted-foreground">
                                    {[lead.assignedTo.name, lead.assignedTo.surname].filter(Boolean).join(" ")}
                                </span>
                            ) : null}
                        />
                        <InfoRow
                            icon={IconCalendar}
                            label={resolveLanguageKey("followUpDate")}
                            show={!!read?.followUpDate}
                            value={lead.followUpDate ? (
                                <span className="text-xs text-muted-foreground">{lead.followUpDate}</span>
                            ) : null}
                        />
                    </InfoRowGroup>
                </div>
            </EntityCardShell>

            {!!action && (
                <>
                    {action === "view" && (
                        <LeadSheetView
                            open={action === "view"}
                            onOpenChange={() => setAction("")}
                            lead={lead}
                            onDelete={onDelete}
                            onRestore={onRestore}
                        />
                    )}
                    {action === "delete" && (
                        <DeleteAction
                            accessModel="leads"
                            deleteId={lead._id}
                            openAlert={action === "delete"}
                            name={fullName || lead.name}
                            confirmName={fullName || lead.name}
                            onSuccess={onDelete}
                            onCancel={() => setAction("")}
                            url="/api/realEstate/lead"
                        />
                    )}
                    {action === "restore" && (
                        <RestoreAction
                            accessModel="leads"
                            deleteId={lead._id}
                            openAlert={action === "restore"}
                            name={fullName || lead.name}
                            confirmName={fullName || lead.name}
                            onSuccess={onRestore}
                            onCancel={() => setAction("")}
                            url="/api/realEstate/lead/restore"
                        />
                    )}
                    {action === ADD_LEAD_ACTIVITY_ACTION && (
                        <AddLeadActivityDialog
                            open
                            onClose={() => setAction("")}
                            lead={lead}
                            onSuccess={(updated?: Lead) => {
                                onActivitySuccess?.(updated);
                                setAction("");
                            }}
                        />
                    )}
                </>
            )}
        </>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/leads/center/cardView/leadCard.tsx"),
    withDebug(true, true)
)(LeadCard);
