import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {compose} from "redux";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useEffect, useImperativeHandle, useState} from "react";
import {LoaderCircle, XCircle} from "lucide-react";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "@coreModule/components/ui/alert-dialog.tsx";
import {Inspection} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/inspection/inspection.dto.ts";
import {Textarea} from "@coreModule/components/ui/textarea.tsx";
import FormMaxLengthControl from "@coreModule/components/custom/formMaxLengthControl.tsx";
import {
    EditInspectionFormType,
    INSPECTION_LONG_TEXT_MAX,
} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/inspection/inspection.schema-def.ts";

type CancelInspectionDialogProps = WithLanguageType & WithAxiosType<Inspection, EditInspectionFormType> & {
    open: boolean;
    onClose: () => void;
    inspection: Inspection;
    onSuccess?: (updatedInspection?: Inspection) => void;
};

function CancelInspectionDialog({
    inspection,
    open,
    onClose,
    resolveLanguageKey,
    innerRef,
    onFilterChange,
    onSuccess = () => {},
    loading,
}: CancelInspectionDialogProps) {

    const [cancellationReason, setCancellationReason] = useState("");

    useImperativeHandle(innerRef, () => ({
        success: (data?: Inspection) => {
            setCancellationReason("");
            onClose();
            onSuccess?.(data);
        },
    }));

    useEffect(() => {
        if (!open) {
            setCancellationReason("");
        }
    }, [open]);

    const handleCancelInspection = () => {
        onFilterChange({
            _id: inspection._id,
            status: "cancelled",
            cancellationReason: cancellationReason.trim() || undefined,
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
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{resolveLanguageKey("cancelConfirmTitle")}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {resolveLanguageKey("cancelConfirmDescription")}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="py-4">
                    <label className="text-sm font-medium mb-2 block">
                        {resolveLanguageKey("cancellationReasonLabel")}
                    </label>
                    <FormMaxLengthControl maxLength={INSPECTION_LONG_TEXT_MAX} value={cancellationReason}>
                        <Textarea
                            placeholder={resolveLanguageKey("cancellationReasonPlaceholder")}
                            value={cancellationReason}
                            onChange={(e) => setCancellationReason(e.target.value.slice(0, INSPECTION_LONG_TEXT_MAX))}
                            disabled={loading}
                            rows={3}
                            maxLength={INSPECTION_LONG_TEXT_MAX}
                            className="resize-none"
                        />
                    </FormMaxLengthControl>
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={loading} onClick={() => setCancellationReason("")}>
                        {resolveLanguageKey("cancel")}
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {e.preventDefault(); e.stopPropagation(); handleCancelInspection()}}
                        disabled={loading}
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
    withLanguage("src/modules/propertyManagement/components/custom/inspections/cancelInspectionDialog.tsx"),
    withAxios(
        {
            method: "POST",
            url: "/api/realEstate/unit/inspection/cancelScheduled",
            data: {},
        },
        true,
    ),
    withDebug(true, true, "inspections"),
)(CancelInspectionDialog);
