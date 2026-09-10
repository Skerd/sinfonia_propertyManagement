import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {compose} from "redux";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useKeyboardShortcuts} from "@coreModule/helpers/hooks/useKeyboardShortcut.ts";
import {DropdownMenuItem, DropdownMenuShortcut} from "@coreModule/components/ui/dropdown-menu.tsx";
import {Send} from "lucide-react";

export const REQUEST_APPROVAL_COMMISSION_ACTION = "requestApproval";

type RequestApprovalCommissionProps = WithLanguageType & {
    onAction: (action: string) => void;
};

function RequestApprovalCommission({onAction, resolveLanguageKey}: RequestApprovalCommissionProps) {
    const shortcut = "6";
    const openDialog = () => onAction(REQUEST_APPROVAL_COMMISSION_ACTION);
    useKeyboardShortcuts(shortcut, openDialog);

    return (
        <DropdownMenuItem
            onClick={() => { openDialog();}}
        >
            <Send size={16} />
            {resolveLanguageKey("title")}
            <DropdownMenuShortcut>⌘{shortcut}</DropdownMenuShortcut>
        </DropdownMenuItem>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/commissions/center/actions/requestApproval.tsx"),
    withDebug(true, true, "commissions"),
)(RequestApprovalCommission);
