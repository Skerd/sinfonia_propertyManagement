import {useImperativeHandle, useState, type RefObject} from "react";
import {BellRing, LoaderCircle} from "lucide-react";
import {DropdownMenuItem, DropdownMenuSeparator, DropdownMenuShortcut} from "@coreModule/components/ui/dropdown-menu.tsx";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@coreModule/components/ui/alert-dialog.tsx";
import type {ResolveLanguageKey} from "@coreModule/helpers/hocs/withLanguage.tsx";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";

type ResendStaffNotificationsMenuItemProps = {
    resolveLanguageKey: ResolveLanguageKey;
    loading?: boolean;
    innerRef?: RefObject<WithAxiosLifecycleRef<unknown> | null>;
    onConfirm: () => void;
    /** Optional extra line under the description (e.g. when recipients were last notified). */
    detail?: string;
};

/**
 * Card / row menu item + confirm dialog that re-sends the Sales & handover staff alert
 * (in-app + email). The wrapping action supplies the endpoint and its dictionary keys:
 * `actionLabel`, `confirmTitle`, `confirmDescription`, `cancel`, `confirmSend`.
 */
export default function ResendStaffNotificationsMenuItem({
    resolveLanguageKey,
    loading,
    innerRef,
    onConfirm,
    detail,
}: ResendStaffNotificationsMenuItemProps) {
    const [open, setOpen] = useState(false);

    useImperativeHandle(innerRef, () => ({
        success: () => setOpen(false),
    }));

    return (
        <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setOpen(true);
                }}
            >
                <BellRing className="h-4 w-4" />
                <span>{resolveLanguageKey("actionLabel")}</span>
                <DropdownMenuShortcut className="opacity-0 w-0 p-0 m-0 border-0" aria-hidden />
            </DropdownMenuItem>
            <AlertDialog open={open} onOpenChange={setOpen}>
                <AlertDialogContent className="max-w-md" onClick={(e) => e.stopPropagation()}>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{resolveLanguageKey("confirmTitle")}</AlertDialogTitle>
                        <AlertDialogDescription>{resolveLanguageKey("confirmDescription")}</AlertDialogDescription>
                        {detail ? <p className="text-xs text-muted-foreground">{detail}</p> : null}
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={loading}>{resolveLanguageKey("cancel")}</AlertDialogCancel>
                        <AlertDialogAction onClick={onConfirm} disabled={loading}>
                            {loading ? <LoaderCircle className="animate-spin h-4 w-4" /> : null}
                            {resolveLanguageKey("confirmSend")}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
