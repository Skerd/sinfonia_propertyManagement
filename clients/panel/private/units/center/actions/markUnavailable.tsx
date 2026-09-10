import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {compose} from "redux";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useKeyboardShortcuts} from "@coreModule/helpers/hooks/useKeyboardShortcut.ts";
import {DropdownMenuItem, DropdownMenuShortcut} from "@coreModule/components/ui/dropdown-menu.tsx";
import {Ban} from "lucide-react";

type MarkUnavailableProps = WithLanguageType & {
    onAction: (action: string) => void;
};

function MarkUnavailable({onAction, resolveLanguageKey}: MarkUnavailableProps) {
    const actionKey = "markUnavailable";
    const shortcut = "u";

    const openDialog = () => onAction(actionKey);
    useKeyboardShortcuts(shortcut, openDialog);

    return (
        <DropdownMenuItem onClick={() => { openDialog(); }}>
            <Ban className="text-destructive" size={16}/>
            <p className="text-destructive">
                {resolveLanguageKey("title")}
            </p>
            <DropdownMenuShortcut className="text-destructive">⌘{shortcut}</DropdownMenuShortcut>
        </DropdownMenuItem>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/units/center/actions/markUnavailable.tsx"),
    withDebug(true, true, "units"),
)(MarkUnavailable);
