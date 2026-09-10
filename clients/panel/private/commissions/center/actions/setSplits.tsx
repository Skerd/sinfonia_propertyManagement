import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {compose} from "redux";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useKeyboardShortcuts} from "@coreModule/helpers/hooks/useKeyboardShortcut.ts";
import {DropdownMenuItem, DropdownMenuShortcut} from "@coreModule/components/ui/dropdown-menu.tsx";
import {Users} from "lucide-react";

export const SET_SPLITS_COMMISSION_ACTION = "setSplits";

type SetSplitsCommissionProps = WithLanguageType & {
    onAction: (action: string) => void;
};

function SetSplitsCommission({onAction, resolveLanguageKey}: SetSplitsCommissionProps) {
    const shortcut = "8";
    const openDialog = () => onAction(SET_SPLITS_COMMISSION_ACTION);
    useKeyboardShortcuts(shortcut, openDialog);

    return (
        <DropdownMenuItem
            onClick={() => { openDialog();}}
        >
            <Users size={16} />
            {resolveLanguageKey("title")}
            <DropdownMenuShortcut>⌘{shortcut}</DropdownMenuShortcut>
        </DropdownMenuItem>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/commissions/center/actions/setSplits.tsx"),
    withDebug(true, true, "commissions"),
)(SetSplitsCommission);
