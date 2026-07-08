import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {compose} from "redux";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useKeyboardShortcuts} from "@coreModule/helpers/hooks/useKeyboardShortcut.ts";
import {DropdownMenuItem, DropdownMenuShortcut} from "@coreModule/components/ui/dropdown-menu.tsx";
import {XCircle} from "lucide-react";

type CancelModificationRequestProps = WithLanguageType & {
    onAction: (action: string) => void;
};

function CancelModificationRequest({
    onAction,
    resolveLanguageKey,
}: CancelModificationRequestProps) {

    const actionKey = "cancel";
    const shortcut = "5";

    const openDialog = () => onAction(actionKey);
    useKeyboardShortcuts(shortcut, openDialog);

    return (
        <DropdownMenuItem onClick={(e) => { e.preventDefault(); e.stopPropagation(); openDialog(); }}>
            <XCircle className="text-destructive" size={16}/>
            <p className="text-destructive">
                {resolveLanguageKey("title")}
            </p>
            <DropdownMenuShortcut className="text-destructive">⌘{shortcut}</DropdownMenuShortcut>
        </DropdownMenuItem>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/modificationRequests/center/actions/cancel.tsx"),
    withDebug(true, true),
)(CancelModificationRequest);
