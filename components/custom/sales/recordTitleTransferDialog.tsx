import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {compose} from "redux";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useEffect, useImperativeHandle, useState} from "react";
import {FileSignature, LoaderCircle} from "lucide-react";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@coreModule/components/ui/alert-dialog.tsx";
import {Input} from "@coreModule/components/ui/input.tsx";
import {Label} from "@coreModule/components/ui/label.tsx";
import FormMaxLengthControl from "@coreModule/components/viewEngine/widgets/inputs/formMaxLengthControl.tsx";
import {SALE_SHORT_TEXT_MAX} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/sale/sale.schema-def.ts";
import type {Sale} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/sale/sale.dto.ts";

type RecordTitleTransferDialogProps = WithLanguageType & WithAxiosType<Sale> & {
    open: boolean;
    onClose: () => void;
    sale: Sale;
    onSuccess?: (updated?: Sale) => void;
};

function RecordTitleTransferDialog({
    sale,
    open,
    onClose,
    resolveLanguageKey,
    innerRef,
    onFormDataChange,
    onSuccess = () => {},
    loading,
}: RecordTitleTransferDialogProps) {
    const [titleTransferDate, setTitleTransferDate] = useState("");
    const [deedNumber, setDeedNumber] = useState("");
    const [notaryName, setNotaryName] = useState("");
    const [certificate, setCertificate] = useState<File | null>(null);

    useEffect(() => {
        if (open) {
            setTitleTransferDate("");
            setDeedNumber("");
            setNotaryName("");
            setCertificate(null);
        }
    }, [open]);

    useImperativeHandle(innerRef, () => ({
        success: (data: Sale) => {
            onSuccess?.(data);
            onClose();
        },
    }));

    const handleOpenChange = (next: boolean) => {
        if (!next && !loading) onClose();
    };

    const canSubmit = titleTransferDate.trim() !== "";

    return (
        <AlertDialog open={open} onOpenChange={handleOpenChange}>
            <AlertDialogContent
                className="flex max-h-[85vh] w-[calc(100%-2rem)] flex-col overflow-hidden data-[size=default]:max-w-xl data-[size=default]:sm:max-w-xl"
                onClick={(e) => e.stopPropagation()}
            >
                <AlertDialogHeader className="shrink-0">
                    <AlertDialogTitle>{resolveLanguageKey("title")}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {resolveLanguageKey("description")}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="flex min-h-0 flex-1 flex-col gap-y-4 overflow-y-auto py-2">
                    <div className="flex flex-col gap-y-2">
                        <Label htmlFor="titleTransferDate">{resolveLanguageKey("titleTransferDate")} *</Label>
                        <Input
                            id="titleTransferDate"
                            type="date"
                            value={titleTransferDate}
                            onChange={(e) => setTitleTransferDate(e.target.value)}
                            disabled={loading}
                        />
                    </div>
                    <div className="flex flex-col gap-y-2">
                        <Label htmlFor="deedNumber">{resolveLanguageKey("deedNumber")}</Label>
                        <FormMaxLengthControl maxLength={SALE_SHORT_TEXT_MAX} value={deedNumber}>
                            <Input
                                id="deedNumber"
                                value={deedNumber}
                                onChange={(e) => setDeedNumber(e.target.value.slice(0, SALE_SHORT_TEXT_MAX))}
                                disabled={loading}
                                maxLength={SALE_SHORT_TEXT_MAX}
                            />
                        </FormMaxLengthControl>
                    </div>
                    <div className="flex flex-col gap-y-2">
                        <Label htmlFor="notaryName">{resolveLanguageKey("notaryName")}</Label>
                        <FormMaxLengthControl maxLength={SALE_SHORT_TEXT_MAX} value={notaryName}>
                            <Input
                                id="notaryName"
                                value={notaryName}
                                onChange={(e) => setNotaryName(e.target.value.slice(0, SALE_SHORT_TEXT_MAX))}
                                disabled={loading}
                                maxLength={SALE_SHORT_TEXT_MAX}
                            />
                        </FormMaxLengthControl>
                    </div>
                    <div className="flex flex-col gap-y-2">
                        <Label htmlFor="titleTransferCertificate">{resolveLanguageKey("titleTransferCertificate")}</Label>
                        <Input
                            id="titleTransferCertificate"
                            type="file"
                            accept="application/pdf,image/*"
                            disabled={loading}
                            onChange={(e) => setCertificate(e.target.files?.[0] ?? null)}
                        />
                    </div>
                </div>
                <AlertDialogFooter className="shrink-0">
                    <AlertDialogCancel disabled={loading}>
                        {resolveLanguageKey("cancel")}
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (!canSubmit) return;
                            const formData = new FormData();
                            formData.append("_id", sale._id);
                            formData.append("titleTransferDate", titleTransferDate);
                            if (deedNumber.trim()) formData.append("deedNumber", deedNumber.trim());
                            if (notaryName.trim()) formData.append("notaryName", notaryName.trim());
                            if (certificate) formData.append("titleTransferCertificate", certificate);
                            onFormDataChange(formData);
                        }}
                        disabled={loading || !canSubmit}
                    >
                        {loading ? <LoaderCircle className="animate-spin" /> : <FileSignature />}
                        <p>{resolveLanguageKey("confirm")}</p>
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/components/custom/sales/recordTitleTransferDialog.tsx"),
    withAxios(
        {
            method: "post",
            url: "/api/realEstate/unit/sale/recordTitleTransfer",
            data: {},
        },
        true,
    ),
    withDebug(true, true, "sales"),
)(RecordTitleTransferDialog);
