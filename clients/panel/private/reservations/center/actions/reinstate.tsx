import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {compose} from "redux";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useKeyboardShortcuts} from "@coreModule/helpers/hooks/useKeyboardShortcut.ts";
import {DropdownMenuItem, DropdownMenuShortcut} from "@coreModule/components/ui/dropdown-menu.tsx";
import {RotateCcw} from "lucide-react";

type ReinstateReservationProps = WithLanguageType & {
    onAction: (action: string) => void;
};

function ReinstateReservation({onAction, resolveLanguageKey}: ReinstateReservationProps) {
    const actionKey = "reinstate";
    const shortcut = "1";

    const openDialog = () => onAction(actionKey);
    useKeyboardShortcuts(shortcut, openDialog);

    return (
        <DropdownMenuItem onClick={(e) => { e.preventDefault(); e.stopPropagation(); openDialog(); }}>
            <RotateCcw size={16}/>
            <p>{resolveLanguageKey("title")}</p>
            <DropdownMenuShortcut>⌘{shortcut}</DropdownMenuShortcut>
        </DropdownMenuItem>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/reservations/center/actions/reinstate.tsx"),
    withDebug(true, true),
)(ReinstateReservation);
