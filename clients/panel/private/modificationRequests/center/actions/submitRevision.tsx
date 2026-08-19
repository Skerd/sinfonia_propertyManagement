import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {compose} from "redux";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useKeyboardShortcuts} from "@coreModule/helpers/hooks/useKeyboardShortcut.ts";
import {DropdownMenuItem, DropdownMenuShortcut} from "@coreModule/components/ui/dropdown-menu.tsx";
import {RotateCcw} from "lucide-react";

type SubmitRevisionProps = WithLanguageType & {
    onAction: (action: string) => void;
};

function SubmitRevision({
    onAction,
    resolveLanguageKey,
}: SubmitRevisionProps) {

    const actionKey = "submitRevision";
    const shortcut = "5";

    const openDialog = () => onAction(actionKey);
    useKeyboardShortcuts(shortcut, openDialog);

    return (
        <DropdownMenuItem onClick={(e) => { e.preventDefault(); e.stopPropagation(); openDialog(); }}>
            <RotateCcw size={16}/>
            {resolveLanguageKey("submitRevisionTitle")}
            <DropdownMenuShortcut>⌘{shortcut}</DropdownMenuShortcut>
        </DropdownMenuItem>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/modificationRequests/center/actions/submitRevision.tsx"),
    withDebug(true, true, "modificationRequests"),
)(SubmitRevision);
