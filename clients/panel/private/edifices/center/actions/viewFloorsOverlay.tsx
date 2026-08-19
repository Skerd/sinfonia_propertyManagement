import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {compose} from "redux";
import {DropdownMenuItem, DropdownMenuShortcut} from "@coreModule/components/ui/dropdown-menu.tsx";
import {LayoutGrid} from "lucide-react";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import {useKeyboardShortcuts} from "@coreModule/helpers/hooks/useKeyboardShortcut.ts";

type ViewFloorsOverlayProps = WithLanguageType & {
    onAction: (action: string) => void
}

function ViewFloorsOverlay({
    onAction,
    resolveLanguageKey,
}: ViewFloorsOverlayProps) {

    const actionKey = "viewFloorOverlay";
    const {read: readFloors} = useAccess("floors");

    const shortcut = "2";
    useKeyboardShortcuts(shortcut, () => {if(!!readFloors ){onAction(actionKey);}});

    if (!readFloors) return null;

    return (
        <DropdownMenuItem onClick={() => {onAction(actionKey)}}>
            <LayoutGrid size={16} />
            {resolveLanguageKey("title")}
            <DropdownMenuShortcut>⌘{shortcut}</DropdownMenuShortcut>
        </DropdownMenuItem>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/edifices/center/actions/viewFloorsOverlay.tsx"),
    withDebug(true, true, "floors")
)(ViewFloorsOverlay);
