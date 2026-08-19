import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {compose} from "redux";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useKeyboardShortcuts} from "@coreModule/helpers/hooks/useKeyboardShortcut.ts";
import {DropdownMenuItem, DropdownMenuShortcut} from "@coreModule/components/ui/dropdown-menu.tsx";
import {DollarSign} from "lucide-react";

type FinanceModificationRequestProps = WithLanguageType & {
    onAction: (action: string) => void;
};

function FinanceModificationRequest({
    onAction,
    resolveLanguageKey,
}: FinanceModificationRequestProps) {

    const actionKey = "finance";
    const shortcut = "3";

    const openDialog = () => onAction(actionKey);
    useKeyboardShortcuts(shortcut, openDialog);

    return (
        <DropdownMenuItem onClick={(e) => { e.preventDefault(); e.stopPropagation(); openDialog(); }}>
            <DollarSign size={16}/>
            {resolveLanguageKey("title")}
            <DropdownMenuShortcut>⌘{shortcut}</DropdownMenuShortcut>
        </DropdownMenuItem>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/modificationRequests/center/actions/finance.tsx"),
    withDebug(true, true, "modificationRequests"),
)(FinanceModificationRequest);
