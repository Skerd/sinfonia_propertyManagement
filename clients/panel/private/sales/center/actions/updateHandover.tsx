import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {compose} from "redux";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useKeyboardShortcuts} from "@coreModule/helpers/hooks/useKeyboardShortcut.ts";
import {DropdownMenuItem, DropdownMenuShortcut} from "@coreModule/components/ui/dropdown-menu.tsx";
import {ClipboardCheck} from "lucide-react";

type UpdateHandoverProps = WithLanguageType & {
    onAction: (action: string) => void;
};

function UpdateHandover({onAction, resolveLanguageKey}: UpdateHandoverProps) {
    const actionKey = "updateHandover";
    const shortcut = "1";

    const openDialog = () => onAction(actionKey);
    useKeyboardShortcuts(shortcut, openDialog);

    return (
        <DropdownMenuItem onClick={() => { openDialog(); }}>
            <ClipboardCheck size={16} />
            {resolveLanguageKey("title")}
            <DropdownMenuShortcut>⌘{shortcut}</DropdownMenuShortcut>
        </DropdownMenuItem>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/sales/center/actions/updateHandover.tsx"),
    withDebug(true, true, "sales"),
)(UpdateHandover);
