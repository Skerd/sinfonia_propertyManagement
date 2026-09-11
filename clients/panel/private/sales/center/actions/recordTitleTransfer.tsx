import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {compose} from "redux";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useKeyboardShortcuts} from "@coreModule/helpers/hooks/useKeyboardShortcut.ts";
import {DropdownMenuItem, DropdownMenuShortcut} from "@coreModule/components/ui/dropdown-menu.tsx";
import {FileSignature} from "lucide-react";

type RecordTitleTransferProps = WithLanguageType & {
    onAction: (action: string) => void;
};

function RecordTitleTransfer({onAction, resolveLanguageKey}: RecordTitleTransferProps) {
    const actionKey = "recordTitleTransfer";
    const shortcut = "2";

    const openDialog = () => onAction(actionKey);
    useKeyboardShortcuts(shortcut, openDialog);

    return (
        <DropdownMenuItem onClick={() => { openDialog(); }}>
            <FileSignature size={16} />
            {resolveLanguageKey("title")}
            <DropdownMenuShortcut>⌘{shortcut}</DropdownMenuShortcut>
        </DropdownMenuItem>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/sales/center/actions/recordTitleTransfer.tsx"),
    withDebug(true, true, "sales"),
)(RecordTitleTransfer);
