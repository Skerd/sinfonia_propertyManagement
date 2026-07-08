import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {compose} from "redux";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useImperativeHandle, useMemo, useState} from "react";
import {DropdownMenuItem, DropdownMenuSeparator, DropdownMenuShortcut} from "@coreModule/components/ui/dropdown-menu.tsx";
import {LoaderCircle, Mail} from "lucide-react";
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
import {Sale} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/sale/sale.dto.ts";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import type {ManualSaleClientEmailForm} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/sale/manualSaleClientEmail.form.type.ts";

type ManualSaleClientEmailsProps = WithLanguageType &
    WithAxiosType<{ ok: true }, ManualSaleClientEmailForm> & {
        sale: Sale;
    };

function saleConfirmationVisible(s: Sale): boolean {
    const deleted = s.deletedAt != null || s.deletedBy != null;
    const buyerId = s.buyer?._id;
    if (deleted || !buyerId) {
        return false;
    }
    return true;
}

function ManualSaleClientEmails({
    sale,
    resolveLanguageKey,
    innerRef,
    onFilterChange,
    loading,
}: ManualSaleClientEmailsProps) {
    const [open, setOpen] = useState(false);
    const [pending, setPending] = useState<ManualSaleClientEmailForm["action"] | null>(null);

    const {read} = useAccess("sales");
    const readFields = (typeof read === "object" && read !== null ? read : {}) as Record<string, unknown>;
    const canReadBuyer = readFields.buyer !== undefined;

    const sendConfirmationOk = useMemo(() => saleConfirmationVisible(sale), [sale]);

    useImperativeHandle(innerRef, () => ({
        success: () => {
            setOpen(false);
            setPending(null);
        },
    }));

    if (!canReadBuyer) {
        return null;
    }

    const openDialog = (action: ManualSaleClientEmailForm["action"]) => {
        setPending(action);
        setOpen(true);
    };

    const handleConfirm = () => {
        if (!pending) {
            return;
        }
        onFilterChange({_id: sale._id, action: pending});
    };

    if (!sendConfirmationOk) {
        return null;
    }

    const pendingConfirmKey = pending ? `confirmDescriptions.${pending}` : "";

    return (
        <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    openDialog("send_sale_confirmation");
                }}
            >
                <Mail className="h-4 w-4" />
                <span>{resolveLanguageKey("actionLabels.send_sale_confirmation")}</span>
                <DropdownMenuShortcut className="opacity-0 w-0 p-0 m-0 border-0" aria-hidden />
            </DropdownMenuItem>
            <AlertDialog
                open={open}
                onOpenChange={(v) => {
                    setOpen(v);
                    if (!v) {
                        setPending(null);
                    }
                }}
            >
                <AlertDialogContent className="max-w-md" onClick={(e) => e.stopPropagation()}>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {pending ? resolveLanguageKey(`confirmTitles.${pending}`) : ""}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {pending ? resolveLanguageKey(pendingConfirmKey) : ""}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel
                            disabled={loading}
                            onClick={() => {
                                setPending(null);
                            }}
                        >
                            {resolveLanguageKey("cancel")}
                        </AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirm} disabled={loading || !pending}>
                            {loading ? <LoaderCircle className="animate-spin h-4 w-4" /> : null}
                            {resolveLanguageKey("confirmSend")}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/sales/center/actions/manualSaleClientEmails.tsx"),
    withAxios(
        {
            method: "POST",
            url: "/api/realEstate/unit/sale/manualClientEmail",
            data: {},
        },
        true,
    ),
    withDebug(true, true),
)(ManualSaleClientEmails);
