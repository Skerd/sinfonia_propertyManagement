import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {compose} from "redux";
import {DropdownMenuItem, DropdownMenuShortcut} from "@coreModule/components/ui/dropdown-menu.tsx";
import {LayoutGrid} from "lucide-react";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import {useKeyboardShortcuts} from "@coreModule/helpers/hooks/useKeyboardShortcut.ts";

type ViewEdificesOverlayProps = WithLanguageType & {
    onAction: (action: string) => void;
};

function ViewEdificesOverlay({
    onAction,
    resolveLanguageKey,
}: ViewEdificesOverlayProps) {
    const {read: readEdifices} = useAccess("edifices");

    const actionKey = "viewEdificesOverlay";
    const shortcut = "2";
    useKeyboardShortcuts(shortcut, () => {
        if (!!readEdifices) {
            onAction(actionKey);
        }
    });

    if (!readEdifices) return null;

    return (
        <DropdownMenuItem onClick={() => { onAction(actionKey); }}>
            <LayoutGrid size={16} />
            {resolveLanguageKey("title")}
            <DropdownMenuShortcut>⌘{shortcut}</DropdownMenuShortcut>
        </DropdownMenuItem>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/projects/center/actions/viewEdificesOverlay.tsx"),
    withDebug(true, true, "edifices")
)(ViewEdificesOverlay);
