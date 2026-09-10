import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {compose} from "redux";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {DropdownMenuItem} from "@coreModule/components/ui/dropdown-menu.tsx";
import {FileText} from "lucide-react";

export const MARK_PROPOSAL_LEAD_ACTION = "markProposal";

type MarkProposalLeadProps = WithLanguageType & {
    onAction: (action: string) => void;
};

function MarkProposalLead({onAction, resolveLanguageKey}: MarkProposalLeadProps) {
    return (
        <DropdownMenuItem onClick={() => { onAction(MARK_PROPOSAL_LEAD_ACTION); }}>
            <FileText className="text-primary" size={16} />
            <p>{resolveLanguageKey("title")}</p>
        </DropdownMenuItem>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/leads/center/actions/markProposal.tsx"),
    withDebug(true, true, "leads"),
)(MarkProposalLead);
