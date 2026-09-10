import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {compose} from "redux";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {DropdownMenuItem} from "@coreModule/components/ui/dropdown-menu.tsx";
import {Phone} from "lucide-react";

export const MARK_CONTACTED_LEAD_ACTION = "markContacted";

type MarkContactedLeadProps = WithLanguageType & {
    onAction: (action: string) => void;
};

function MarkContactedLead({onAction, resolveLanguageKey}: MarkContactedLeadProps) {
    return (
        <DropdownMenuItem onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAction(MARK_CONTACTED_LEAD_ACTION); }}>
            <Phone className="text-primary" size={16} />
            <p>{resolveLanguageKey("title")}</p>
        </DropdownMenuItem>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/leads/center/actions/markContacted.tsx"),
    withDebug(true, true, "leads"),
)(MarkContactedLead);
