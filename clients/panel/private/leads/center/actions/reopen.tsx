import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {compose} from "redux";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {DropdownMenuItem} from "@coreModule/components/ui/dropdown-menu.tsx";
import {RotateCcw} from "lucide-react";

export const REOPEN_LEAD_ACTION = "reopen";

type ReopenLeadProps = WithLanguageType & {
    onAction: (action: string) => void;
};

function ReopenLead({onAction, resolveLanguageKey}: ReopenLeadProps) {
    return (
        <DropdownMenuItem onClick={() => { onAction(REOPEN_LEAD_ACTION); }}>
            <RotateCcw className="text-primary" size={16} />
            <p>{resolveLanguageKey("title")}</p>
        </DropdownMenuItem>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/leads/center/actions/reopen.tsx"),
    withDebug(true, true, "leads"),
)(ReopenLead);
