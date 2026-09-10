import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {compose} from "redux";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {DropdownMenuItem} from "@coreModule/components/ui/dropdown-menu.tsx";
import {Scale} from "lucide-react";

export const CLOSE_LEAD_ACTION = "closeLead";

type CloseLeadProps = WithLanguageType & {
    onAction: (action: string) => void;
};

function CloseLead({onAction, resolveLanguageKey}: CloseLeadProps) {
    return (
        <DropdownMenuItem onClick={() => { onAction(CLOSE_LEAD_ACTION); }}>
            <Scale className="text-primary" size={16} />
            <p>{resolveLanguageKey("title")}</p>
        </DropdownMenuItem>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/leads/center/actions/closeLead.tsx"),
    withDebug(true, true, "leads"),
)(CloseLead);
