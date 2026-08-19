import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {compose} from "redux";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useImperativeHandle, useState} from "react";
import {useKeyboardShortcuts} from "@coreModule/helpers/hooks/useKeyboardShortcut.ts";
import type {SingleForm} from "armonia/src/modules/core/types/shared.types.ts";
import {Commission} from "armonia/src/modules/propertyManagement/api/realEstate/private/commission/commission.dto.ts";
import {DropdownMenuItem, DropdownMenuShortcut} from "@coreModule/components/ui/dropdown-menu.tsx";
import {LoaderCircle, CheckCircle2} from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "@coreModule/components/ui/alert-dialog.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";

type MarkPaidCommissionProps = WithLanguageType &
    WithAxiosType<Commission, SingleForm> & {
        commission: Commission;
        onSuccess?: (updated?: Commission) => void;
    };

function MarkPaidCommission({
    commission,
    resolveLanguageKey,
    innerRef,
    onFilterChange,
    onSuccess = () => {},
    loading
}: MarkPaidCommissionProps) {
    const [open, setOpen] = useState(false);

    useImperativeHandle(innerRef, () => ({
        success: (body: Commission) => {
            onSuccess?.(body);
            setOpen(false);
        }
    }));

    const {write} = useAccess("commissions");
    const canStatus = Boolean(write && (write as Record<string, unknown>)["status"]);

    if (!canStatus) {
        return <></>;
    }

    const handleMarkPaid = () => {
        onFilterChange({
            _id: commission._id
        });
    };
    const shortcut = "4";
    const openDialog = () => setOpen(true);
    useKeyboardShortcuts(shortcut, openDialog);

    return (
        <>
            <DropdownMenuItem
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    openDialog();
                }}
            >
                <CheckCircle2 size={16} />
                {resolveLanguageKey("title")}
                <DropdownMenuShortcut>⌘{shortcut}</DropdownMenuShortcut>
            </DropdownMenuItem>
            <AlertDialog open={open} onOpenChange={setOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{resolveLanguageKey("paidConfirmTitle")}</AlertDialogTitle>
                        <AlertDialogDescription>{resolveLanguageKey("paidConfirmDescription")}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={loading}>{resolveLanguageKey("cancel")}</AlertDialogCancel>
                        <AlertDialogAction onClick={handleMarkPaid} disabled={loading}>
                            {loading ? <LoaderCircle className="animate-spin" /> : <CheckCircle2 />}
                            <p>{resolveLanguageKey("confirmPaid")}</p>
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/commissions/center/actions/markPaid.tsx"),
    withAxios(
        {
            method: "patch",
            url: "/api/realEstate/commission/markPaid",
            data: {}
        },
        true
    ),
    withDebug(true, true, "commissions")
)(MarkPaidCommission);
