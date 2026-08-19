import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {compose} from "redux";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useKeyboardShortcuts} from "@coreModule/helpers/hooks/useKeyboardShortcut.ts";
import {DropdownMenuItem, DropdownMenuShortcut} from "@coreModule/components/ui/dropdown-menu.tsx";
import {Package} from "lucide-react";

type DeliverModificationRequestProps = WithLanguageType & {
    onAction: (action: string) => void;
};

function DeliverModificationRequest({
    onAction,
    resolveLanguageKey,
}: DeliverModificationRequestProps) {

    const actionKey = "deliver";
    const shortcut = "4";

    const openDialog = () => onAction(actionKey);
    useKeyboardShortcuts(shortcut, openDialog);

    return (
        <DropdownMenuItem onClick={(e) => { e.preventDefault(); e.stopPropagation(); openDialog(); }}>
            <Package size={16}/>
            {resolveLanguageKey("title")}
            <DropdownMenuShortcut>⌘{shortcut}</DropdownMenuShortcut>
        </DropdownMenuItem>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/modificationRequests/center/actions/deliver.tsx"),
    withDebug(true, true, "modificationRequests"),
)(DeliverModificationRequest);
