import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {compose} from "redux";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useKeyboardShortcuts} from "@coreModule/helpers/hooks/useKeyboardShortcut.ts";
import {DropdownMenuItem, DropdownMenuShortcut} from "@coreModule/components/ui/dropdown-menu.tsx";
import {IconCircleCheck} from "@tabler/icons-react";

export const COMPLETE_INSPECTION_ACTION = "completeInspection";

type CompleteInspectionProps = WithLanguageType & {
    onAction: (action: string) => void;
};

function CompleteInspection({onAction, resolveLanguageKey}: CompleteInspectionProps) {
    const shortcut = "4";
    const openDialog = () => onAction(COMPLETE_INSPECTION_ACTION);
    useKeyboardShortcuts(shortcut, openDialog);

    return (
        <DropdownMenuItem onClick={() => { openDialog(); }}>
            <IconCircleCheck size={16} />
            {resolveLanguageKey("title")}
            <DropdownMenuShortcut>⌘{shortcut}</DropdownMenuShortcut>
        </DropdownMenuItem>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/inspections/center/actions/complete.tsx"),
    withDebug(true, true, "inspections"),
)(CompleteInspection);
