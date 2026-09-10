import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {compose} from "redux";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {DropdownMenuItem} from "@coreModule/components/ui/dropdown-menu.tsx";
import {Scale} from "lucide-react";

export const MARK_NEGOTIATION_LEAD_ACTION = "markNegotiation";

type MarkNegotiationLeadProps = WithLanguageType & {
    onAction: (action: string) => void;
};

function MarkNegotiationLead({onAction, resolveLanguageKey}: MarkNegotiationLeadProps) {
    return (
        <DropdownMenuItem onClick={() => { onAction(MARK_NEGOTIATION_LEAD_ACTION); }}>
            <Scale className="text-primary" size={16} />
            <p>{resolveLanguageKey("title")}</p>
        </DropdownMenuItem>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/leads/center/actions/markNegotiation.tsx"),
    withDebug(true, true, "leads"),
)(MarkNegotiationLead);
