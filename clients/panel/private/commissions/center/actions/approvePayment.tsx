import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {compose} from "redux";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useKeyboardShortcuts} from "@coreModule/helpers/hooks/useKeyboardShortcut.ts";
import {DropdownMenuItem, DropdownMenuShortcut} from "@coreModule/components/ui/dropdown-menu.tsx";
import {Scale} from "lucide-react";

export const APPROVE_PAYMENT_COMMISSION_ACTION = "approvePayment";

type ApprovePaymentCommissionProps = WithLanguageType & {
    onAction: (action: string) => void;
};

function ApprovePaymentCommission({onAction, resolveLanguageKey}: ApprovePaymentCommissionProps) {
    const shortcut = "7";
    const openDialog = () => onAction(APPROVE_PAYMENT_COMMISSION_ACTION);
    useKeyboardShortcuts(shortcut, openDialog);

    return (
        <DropdownMenuItem
            onClick={() => { openDialog();}}
        >
            <Scale size={16} />
            {resolveLanguageKey("title")}
            <DropdownMenuShortcut>⌘{shortcut}</DropdownMenuShortcut>
        </DropdownMenuItem>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/commissions/center/actions/approvePayment.tsx"),
    withDebug(true, true, "commissions"),
)(ApprovePaymentCommission);
