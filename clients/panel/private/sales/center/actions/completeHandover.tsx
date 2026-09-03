import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {compose} from "redux";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useKeyboardShortcuts} from "@coreModule/helpers/hooks/useKeyboardShortcut.ts";
import {DropdownMenuItem, DropdownMenuShortcut} from "@coreModule/components/ui/dropdown-menu.tsx";
import {CheckCircle2} from "lucide-react";

type CompleteHandoverProps = WithLanguageType & {
    onAction: (action: string) => void;
};

function CompleteHandover({onAction, resolveLanguageKey}: CompleteHandoverProps) {
    const actionKey = "completeHandover";
    const shortcut = "1";

    const openDialog = () => onAction(actionKey);
    useKeyboardShortcuts(shortcut, openDialog);

    return (
        <DropdownMenuItem onClick={(e) => { e.preventDefault(); e.stopPropagation(); openDialog(); }}>
            <CheckCircle2 size={16} />
            {resolveLanguageKey("title")}
            <DropdownMenuShortcut>⌘{shortcut}</DropdownMenuShortcut>
        </DropdownMenuItem>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/sales/center/actions/completeHandover.tsx"),
    withDebug(true, true, "sales"),
)(CompleteHandover);
