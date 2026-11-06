import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {compose} from "redux";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useKeyboardShortcuts} from "@coreModule/helpers/hooks/useKeyboardShortcut.ts";
import {DropdownMenuItem, DropdownMenuShortcut} from "@coreModule/components/ui/dropdown-menu.tsx";
import {IconCircleCheck} from "@tabler/icons-react";

export const MARK_PAID_COMMISSION_ACTION = "markPaid";

type MarkPaidCommissionProps = WithLanguageType & {
    onAction: (action: string) => void;
};

function MarkPaidCommission({onAction, resolveLanguageKey}: MarkPaidCommissionProps) {
    const shortcut = "4";
    const openDialog = () => onAction(MARK_PAID_COMMISSION_ACTION);
    useKeyboardShortcuts(shortcut, openDialog);

    return (
        <DropdownMenuItem
            onClick={() => { openDialog();}}
        >
            <IconCircleCheck size={16} />
            {resolveLanguageKey("title")}
            <DropdownMenuShortcut>⌘{shortcut}</DropdownMenuShortcut>
        </DropdownMenuItem>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/commissions/center/actions/markPaid.tsx"),
    withDebug(true, true, "commissions"),
)(MarkPaidCommission);
