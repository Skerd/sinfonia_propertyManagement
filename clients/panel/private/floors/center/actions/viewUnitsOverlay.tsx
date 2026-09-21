import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {compose} from "redux";
import {DropdownMenuItem, DropdownMenuShortcut} from "@coreModule/components/ui/dropdown-menu.tsx";
import {LayoutGrid} from "lucide-react";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hooks/useAccess.ts";
import {useKeyboardShortcuts} from "@coreModule/helpers/hooks/useKeyboardShortcut.ts";

type ViewUnitsOverlayProps = WithLanguageType & {
    onAction: (action: string) => void;
};

function ViewUnitsOverlay({onAction, resolveLanguageKey}: ViewUnitsOverlayProps) {
    const {read: readFloors} = useAccess("floors");
    const {read: readUnits} = useAccess("units");

    const actionKey = "viewUnitsOverlay";
    const shortcut = "2";
    useKeyboardShortcuts(shortcut, () => onAction(actionKey), {enabled: !!readFloors?.mainImage && !!readUnits});

    if (!readFloors?.mainImage || !readUnits) return null;

    return (
        <DropdownMenuItem onClick={() => { onAction(actionKey); }}>
            <LayoutGrid size={16} />
            {resolveLanguageKey("title")}
            <DropdownMenuShortcut>⌘{shortcut}</DropdownMenuShortcut>
        </DropdownMenuItem>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/floors/center/actions/viewUnitsOverlay.tsx"),
    withDebug(true, true, ["floors", "units"])
)(ViewUnitsOverlay);
