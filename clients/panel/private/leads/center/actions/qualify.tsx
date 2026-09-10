import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {compose} from "redux";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {DropdownMenuItem} from "@coreModule/components/ui/dropdown-menu.tsx";
import {BadgeCheck} from "lucide-react";

export const QUALIFY_LEAD_ACTION = "qualify";

type QualifyLeadProps = WithLanguageType & {
    onAction: (action: string) => void;
};

function QualifyLead({onAction, resolveLanguageKey}: QualifyLeadProps) {
    return (
        <DropdownMenuItem onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAction(QUALIFY_LEAD_ACTION); }}>
            <BadgeCheck className="text-primary" size={16} />
            <p>{resolveLanguageKey("title")}</p>
        </DropdownMenuItem>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/leads/center/actions/qualify.tsx"),
    withDebug(true, true, "leads"),
)(QualifyLead);
