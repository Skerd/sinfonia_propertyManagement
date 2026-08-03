import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {compose} from "redux";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useKeyboardShortcuts} from "@coreModule/helpers/hooks/useKeyboardShortcut.ts";
import {DropdownMenuItem, DropdownMenuShortcut} from "@coreModule/components/ui/dropdown-menu.tsx";
import {XCircle} from "lucide-react";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";

type CancelInspectionProps = WithLanguageType & {
    onAction: (action: string) => void;
};

function CancelInspection({
    onAction,
    resolveLanguageKey,
}: CancelInspectionProps) {

    const actionKey = "cancelInspection";
    const {write} = useAccess("inspections");

    const shortcut = "2";
    const openDialog = () => {
        if (!write) return;
        onAction(actionKey);
    };

    useKeyboardShortcuts(shortcut, openDialog);

    if (!write) {
        return <></>;
    }

    return (
        <DropdownMenuItem onClick={(e) => { e.preventDefault(); e.stopPropagation(); openDialog(); }}>
            <XCircle className="text-warning" size={16}/>
            <p className="text-warning">
                {resolveLanguageKey("title")}
            </p>
            <DropdownMenuShortcut className="text-warning">⌘{shortcut}</DropdownMenuShortcut>
        </DropdownMenuItem>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/inspections/center/actions/cancel.tsx"),
    withDebug(true, true),
)(CancelInspection);
