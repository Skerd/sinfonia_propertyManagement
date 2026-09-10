import type {Lead} from "armonia/src/modules/propertyManagement/api/realEstate/private/lead/lead.dto.ts";
import AddLeadActivityDialog from "@propertyManagementModule/components/custom/leads/addLeadActivityDialog.tsx";
import CloseLeadDialog from "@propertyManagementModule/components/custom/leads/closeLeadDialog.tsx";
import {
    MarkContactedLeadDialog,
    MarkNegotiationLeadDialog,
    MarkProposalLeadDialog,
    QualifyLeadDialog,
    ReopenLeadDialog,
} from "@propertyManagementModule/components/custom/leads/leadTransitionDialog.tsx";
import {ADD_LEAD_ACTIVITY_ACTION} from "@propertyManagementModule/clients/panel/private/leads/center/actions/addActivity.tsx";
import {MARK_CONTACTED_LEAD_ACTION} from "@propertyManagementModule/clients/panel/private/leads/center/actions/markContacted.tsx";
import {QUALIFY_LEAD_ACTION} from "@propertyManagementModule/clients/panel/private/leads/center/actions/qualify.tsx";
import {MARK_PROPOSAL_LEAD_ACTION} from "@propertyManagementModule/clients/panel/private/leads/center/actions/markProposal.tsx";
import {MARK_NEGOTIATION_LEAD_ACTION} from "@propertyManagementModule/clients/panel/private/leads/center/actions/markNegotiation.tsx";
import {CLOSE_LEAD_ACTION} from "@propertyManagementModule/clients/panel/private/leads/center/actions/closeLead.tsx";
import {REOPEN_LEAD_ACTION} from "@propertyManagementModule/clients/panel/private/leads/center/actions/reopen.tsx";

type LeadWorkflowDialogsProps = {
    action: string;
    lead?: Lead | null;
    onClose: () => void;
    onSuccess: (updated?: Lead) => void;
};

export default function LeadWorkflowDialogs({action, lead, onClose, onSuccess}: LeadWorkflowDialogsProps) {
    if (!lead || !action) return null;
    if (action === ADD_LEAD_ACTIVITY_ACTION) {
        return <AddLeadActivityDialog open onClose={onClose} lead={lead} onSuccess={onSuccess} />;
    }
    if (action === MARK_CONTACTED_LEAD_ACTION) {
        return <MarkContactedLeadDialog open onClose={onClose} lead={lead} onSuccess={onSuccess} />;
    }
    if (action === QUALIFY_LEAD_ACTION) {
        return <QualifyLeadDialog open onClose={onClose} lead={lead} onSuccess={onSuccess} />;
    }
    if (action === MARK_PROPOSAL_LEAD_ACTION) {
        return <MarkProposalLeadDialog open onClose={onClose} lead={lead} onSuccess={onSuccess} />;
    }
    if (action === MARK_NEGOTIATION_LEAD_ACTION) {
        return <MarkNegotiationLeadDialog open onClose={onClose} lead={lead} onSuccess={onSuccess} />;
    }
    if (action === CLOSE_LEAD_ACTION) {
        return <CloseLeadDialog open onClose={onClose} lead={lead} onSuccess={onSuccess} />;
    }
    if (action === REOPEN_LEAD_ACTION) {
        return <ReopenLeadDialog open onClose={onClose} lead={lead} onSuccess={onSuccess} />;
    }
    return null;
}
