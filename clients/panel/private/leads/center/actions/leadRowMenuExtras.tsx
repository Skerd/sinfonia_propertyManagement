import {useAccess} from "@coreModule/helpers/hooks/useAccess.ts";
import type {Lead} from "armonia/src/modules/propertyManagement/api/realEstate/private/lead/lead.dto.ts";
import AddLeadActivity from "@propertyManagementModule/clients/panel/private/leads/center/actions/addActivity.tsx";
import MarkContactedLead from "@propertyManagementModule/clients/panel/private/leads/center/actions/markContacted.tsx";
import QualifyLead from "@propertyManagementModule/clients/panel/private/leads/center/actions/qualify.tsx";
import MarkProposalLead from "@propertyManagementModule/clients/panel/private/leads/center/actions/markProposal.tsx";
import MarkNegotiationLead from "@propertyManagementModule/clients/panel/private/leads/center/actions/markNegotiation.tsx";
import CloseLead from "@propertyManagementModule/clients/panel/private/leads/center/actions/closeLead.tsx";
import ReopenLead from "@propertyManagementModule/clients/panel/private/leads/center/actions/reopen.tsx";

type LeadRowMenuExtrasProps = {
    lead: Lead;
    onAction: (action: string) => void;
};

const OPEN_RANK: Record<string, number> = {
    new:         0,
    contacted:   1,
    qualified:   2,
    proposal:    3,
    negotiation: 4,
};

export default function LeadRowMenuExtras({lead, onAction}: LeadRowMenuExtrasProps) {
    const {write} = useAccess("leads");
    const isDeleted = lead.deletedAt != null || lead.deletedBy != null;
    const rank = OPEN_RANK[lead.status ?? ""];
    const isOpen = rank != null;

    if (!write || isDeleted) return null;

    return (
        <>
            <AddLeadActivity lead={lead} onAction={onAction} />
            {isOpen && rank < OPEN_RANK.contacted && (
                <MarkContactedLead onAction={onAction} />
            )}
            {isOpen && rank < OPEN_RANK.qualified && (
                <QualifyLead onAction={onAction} />
            )}
            {isOpen && rank >= OPEN_RANK.qualified && rank < OPEN_RANK.proposal && (
                <MarkProposalLead onAction={onAction} />
            )}
            {isOpen && rank >= OPEN_RANK.proposal && rank < OPEN_RANK.negotiation && (
                <MarkNegotiationLead onAction={onAction} />
            )}
            {isOpen && rank >= OPEN_RANK.qualified && (
                <CloseLead onAction={onAction} />
            )}
            {lead.status === "lost" && <ReopenLead onAction={onAction} />}
        </>
    );
}
