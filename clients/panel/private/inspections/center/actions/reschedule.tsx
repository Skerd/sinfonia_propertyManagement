import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {compose} from "redux";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useKeyboardShortcuts} from "@coreModule/helpers/hooks/useKeyboardShortcut.ts";
import {DropdownMenuItem, DropdownMenuShortcut} from "@coreModule/components/ui/dropdown-menu.tsx";
import {IconCalendarClock} from "@tabler/icons-react";

export const RESCHEDULE_INSPECTION_ACTION = "rescheduleInspection";

type RescheduleInspectionProps = WithLanguageType & {
    onAction: (action: string) => void;
};

function RescheduleInspection({onAction, resolveLanguageKey}: RescheduleInspectionProps) {
    const shortcut = "5";
    const openDialog = () => onAction(RESCHEDULE_INSPECTION_ACTION);
    useKeyboardShortcuts(shortcut, openDialog);

    return (
        <DropdownMenuItem onClick={() => { openDialog(); }}>
            <IconCalendarClock size={16} />
            {resolveLanguageKey("title")}
            <DropdownMenuShortcut>⌘{shortcut}</DropdownMenuShortcut>
        </DropdownMenuItem>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/inspections/center/actions/reschedule.tsx"),
    withDebug(true, true, "inspections"),
)(RescheduleInspection);
