import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {compose} from "redux";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useKeyboardShortcuts} from "@coreModule/helpers/hooks/useKeyboardShortcut.ts";
import {DropdownMenuItem, DropdownMenuShortcut} from "@coreModule/components/ui/dropdown-menu.tsx";
import {IconPlayerPlay} from "@tabler/icons-react";

export const START_INSPECTION_ACTION = "startInspection";

type StartInspectionProps = WithLanguageType & {
    onAction: (action: string) => void;
};

function StartInspection({onAction, resolveLanguageKey}: StartInspectionProps) {
    const shortcut = "3";
    const openDialog = () => onAction(START_INSPECTION_ACTION);
    useKeyboardShortcuts(shortcut, openDialog);

    return (
        <DropdownMenuItem onClick={() => { openDialog(); }}>
            <IconPlayerPlay size={16} />
            {resolveLanguageKey("title")}
            <DropdownMenuShortcut>⌘{shortcut}</DropdownMenuShortcut>
        </DropdownMenuItem>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/inspections/center/actions/start.tsx"),
    withDebug(true, true, "inspections"),
)(StartInspection);
