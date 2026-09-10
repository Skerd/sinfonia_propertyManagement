import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {compose} from "redux";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useEffect, useImperativeHandle, useRef, useState} from "react";
import {CheckCircle2, LoaderCircle} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@coreModule/components/ui/dialog.tsx";
import {Button} from "@coreModule/components/ui/button.tsx";
import {Input} from "@coreModule/components/ui/input.tsx";
import {Label} from "@coreModule/components/ui/label.tsx";
import FormMaxLengthControl from "@coreModule/components/custom/formMaxLengthControl.tsx";
import SingleFile from "@coreModule/components/custom/files/singleFile.tsx";
import {Commission} from "armonia/src/modules/propertyManagement/api/realEstate/private/commission/commission.dto.ts";
import type {MarkCommissionPaidForm} from "armonia/src/modules/propertyManagement/api/realEstate/private/commission/markCommissionPaid.form.type.ts";
import {COMMISSION_LONG_TEXT_MAX} from "armonia/src/modules/propertyManagement/api/realEstate/private/commission/commission.schema-def.ts";
import {uploadFilesForSubmit} from "@coreModule/helpers/media/uploadFilesForSubmit.ts";

type MarkPaidCommissionDialogProps = WithLanguageType &
    WithAxiosType<Commission, MarkCommissionPaidForm> & {
        open: boolean;
        onClose: () => void;
        commission: Commission;
        onSuccess?: (updated?: Commission) => void;
    };

function MarkPaidCommissionDialog({
    commission,
    open,
    onClose,
    resolveLanguageKey,
    innerRef,
    onFilterChange,
    onSuccess = () => {},
    loading,
}: MarkPaidCommissionDialogProps) {
    const [paymentReference, setPaymentReference] = useState("");
    const [receiptFile, setReceiptFile] = useState<File | undefined>(undefined);
    const [uploading, setUploading] = useState(false);
    const mediaInputRef = useRef<HTMLInputElement>(null);
    const busy = loading || uploading;

    useImperativeHandle(innerRef, () => ({
        success: (data: Commission) => {
            setPaymentReference("");
            setReceiptFile(undefined);
            onSuccess?.(data);
            onClose();
        },
    }));

    useEffect(() => {
        if (!open) {
            setPaymentReference("");
            setReceiptFile(undefined);
        }
    }, [open]);

    const handleOpenChange = (next: boolean) => {
        if (!next && !busy) {
            setPaymentReference("");
            setReceiptFile(undefined);
            onClose();
        }
    };

    const handleSubmit = async () => {
        const payload: MarkCommissionPaidForm = {
            _id: commission._id,
        };
        const reference = paymentReference.trim();
        if (reference) payload.paymentReference = reference;
        setUploading(true);
        try {
            if (receiptFile) {
                const [mediaId] = await uploadFilesForSubmit([receiptFile]);
                payload.paymentReceiptMediaId = mediaId;
            }
            onFilterChange(payload);
        } finally {
            setUploading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-md" onClick={(e) => e.stopPropagation()}>
                <DialogHeader>
                    <DialogTitle>{resolveLanguageKey("dialogTitle")}</DialogTitle>
                    <DialogDescription>{resolveLanguageKey("dialogDescription")}</DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-y-4 py-2">
                    <div className="flex flex-col gap-y-2">
                        <Label htmlFor="commissionPaymentReference">{resolveLanguageKey("paymentReferenceLabel")}</Label>
                        <FormMaxLengthControl maxLength={COMMISSION_LONG_TEXT_MAX} value={paymentReference}>
                            <Input
                                id="commissionPaymentReference"
                                value={paymentReference}
                                onChange={(e) => setPaymentReference(e.target.value.slice(0, COMMISSION_LONG_TEXT_MAX))}
                                placeholder={resolveLanguageKey("paymentReferencePlaceholder")}
                                disabled={busy}
                                maxLength={COMMISSION_LONG_TEXT_MAX}
                            />
                        </FormMaxLengthControl>
                    </div>
                    <div className="flex flex-col gap-y-2">
                        <Label>{resolveLanguageKey("receiptLabel")}</Label>
                        <input
                            ref={mediaInputRef}
                            type="file"
                            className="hidden"
                            accept="image/*,application/pdf"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                setReceiptFile(file);
                                if (e.target) e.target.value = "";
                            }}
                            disabled={busy}
                        />
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => mediaInputRef.current?.click()}
                            disabled={busy}
                        >
                            {resolveLanguageKey("addReceipt")}
                        </Button>
                        {receiptFile && (
                            <SingleFile
                                file={{
                                    id: "temp-commission-receipt",
                                    file: receiptFile,
                                    path: URL.createObjectURL(receiptFile),
                                    body: undefined,
                                }}
                                canDownload={true}
                                canRemove={true}
                                isBig={false}
                                onRemove={() => setReceiptFile(undefined)}
                            />
                        )}
                    </div>
                </div>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={busy}>
                        {resolveLanguageKey("cancel")}
                    </Button>
                    <Button type="button" onClick={handleSubmit} disabled={busy}>
                        {busy ? <LoaderCircle className="animate-spin h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                        {resolveLanguageKey("confirmPaid")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/components/custom/commissions/markPaidCommissionDialog.tsx"),
    withAxios(
        {
            method: "post",
            url: "/api/realEstate/commission/markPaid",
            data: {},
        },
        true,
    ),
    withDebug(true, true, "commissions"),
)(MarkPaidCommissionDialog);
