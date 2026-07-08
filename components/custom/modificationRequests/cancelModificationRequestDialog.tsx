import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {compose} from "redux";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useEffect, useImperativeHandle, useState} from "react";
import {EditModificationRequestFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/modificationRequest/modificationRequest.schema-def.ts";
import {LoaderCircle, XCircle} from "lucide-react";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "@coreModule/components/ui/alert-dialog.tsx";
import {ModificationRequest} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/modificationRequest/modificationRequest.dto.ts";
import {Textarea} from "@coreModule/components/ui/textarea.tsx";
import {Label} from "@coreModule/components/ui/label.tsx";

type CancelModificationRequestDialogProps = WithLanguageType & WithAxiosType<any, EditModificationRequestFormType> & {
    open: boolean;
    onClose: () => void;
    request: ModificationRequest;
    onSuccess?: (updated?: ModificationRequest) => void;
};

function CancelModificationRequestDialog({
    request,
    open,
    onClose,
    resolveLanguageKey,
    innerRef,
    onFilterChange,
    onSuccess = () => {},
    loading,
}: CancelModificationRequestDialogProps) {

    const [cancellationReason, setCancellationReason] = useState("");

    useImperativeHandle(innerRef, () => ({
        success: (data: EditModificationRequestFormType) => {
            onSuccess?.(data as unknown as ModificationRequest);
            setCancellationReason("");
            onClose();
        },
    }));

    useEffect(() => {
        if (!open) setCancellationReason("");
    }, [open]);

    const handleCancel = () => {
        onFilterChange({
            _id: request._id,
            cancellationReason: cancellationReason.trim(),
        });
    };

    const handleOpenChange = (next: boolean) => {
        if (!next && !loading) {
            setCancellationReason("");
            onClose();
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={handleOpenChange}>
            <AlertDialogContent className="max-w-xl min-w-lg max-h-[50vh] overflow-y-auto overflow-x-hidden">
                <AlertDialogHeader>
                    <AlertDialogTitle>{resolveLanguageKey("cancelConfirmTitle")}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {resolveLanguageKey("cancelConfirmDescription")}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="py-4">
                    <Label htmlFor="cancellationReason" className="mb-2">
                        {resolveLanguageKey("cancellationReasonLabel")} *
                    </Label>
                    <Textarea
                        id="cancellationReason"
                        value={cancellationReason}
                        onChange={(e) => setCancellationReason(e.target.value)}
                        placeholder={resolveLanguageKey("cancellationReasonPlaceholder")}
                        disabled={loading}
                        className="min-h-[100px] max-h-[150px] overflow-y-auto resize-none"
                    />
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={loading} onClick={() => setCancellationReason("")}>
                        {resolveLanguageKey("cancel")}
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleCancel();
                        }}
                        disabled={loading || !cancellationReason.trim()}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        {(loading) ? <LoaderCircle className="animate-spin"/> : <XCircle />}
                        <p>{resolveLanguageKey("confirmCancel")}</p>
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/components/custom/modificationRequests/cancelModificationRequestDialog.tsx"),
    withAxios(
        {
            method: "patch",
            url: "/api/realEstate/unit/modificationRequest",
            data: {},
        },
        true,
    ),
    withDebug(true, true),
)(CancelModificationRequestDialog);
