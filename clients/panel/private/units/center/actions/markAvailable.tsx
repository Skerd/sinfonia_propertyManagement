import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {compose} from "redux";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useKeyboardShortcuts} from "@coreModule/helpers/hooks/useKeyboardShortcut.ts";
import {DropdownMenuItem, DropdownMenuShortcut} from "@coreModule/components/ui/dropdown-menu.tsx";
import {CircleCheck} from "lucide-react";

type MarkAvailableProps = WithLanguageType & {
    onAction: (action: string) => void;
};

function MarkAvailable({onAction, resolveLanguageKey}: MarkAvailableProps) {
    const actionKey = "markAvailable";
    const shortcut = "u";

    const openDialog = () => onAction(actionKey);
    useKeyboardShortcuts(shortcut, openDialog);

    return (
        <DropdownMenuItem onClick={() => { openDialog(); }}>
            <CircleCheck size={16}/>
            <p>{resolveLanguageKey("title")}</p>
            <DropdownMenuShortcut>⌘{shortcut}</DropdownMenuShortcut>
        </DropdownMenuItem>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/units/center/actions/markAvailable.tsx"),
    withDebug(true, true, "units"),
)(MarkAvailable);
