import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {compose} from "redux";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useKeyboardShortcuts} from "@coreModule/helpers/hooks/useKeyboardShortcut.ts";
import {DropdownMenuItem, DropdownMenuShortcut} from "@coreModule/components/ui/dropdown-menu.tsx";
import {Undo2} from "lucide-react";

export const MARK_PENDING_COMMISSION_ACTION = "markPending";

type MarkPendingCommissionProps = WithLanguageType & {
    onAction: (action: string) => void;
};

function MarkPendingCommission({onAction, resolveLanguageKey}: MarkPendingCommissionProps) {
    const shortcut = "5";
    const openDialog = () => onAction(MARK_PENDING_COMMISSION_ACTION);
    useKeyboardShortcuts(shortcut, openDialog);

    return (
        <DropdownMenuItem
            onClick={() => {openDialog();}}
        >
            <Undo2 size={16} />
            {resolveLanguageKey("title")}
            <DropdownMenuShortcut>⌘{shortcut}</DropdownMenuShortcut>
        </DropdownMenuItem>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/commissions/center/actions/markPending.tsx"),
    withDebug(true, true, "commissions"),
)(MarkPendingCommission);
