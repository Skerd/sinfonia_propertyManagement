import {useState, useEffect, useImperativeHandle, useRef} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {compose} from "redux";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@coreModule/components/ui/dialog.tsx";
import {Button} from "@coreModule/components/ui/button.tsx";
import {Alert, AlertDescription} from "@coreModule/components/ui/alert.tsx";
import {Checkbox} from "@coreModule/components/ui/checkbox.tsx";
import {Label} from "@coreModule/components/ui/label.tsx";
import {AlertTriangle, LoaderCircle, Upload} from "lucide-react";
import {toast} from "sonner";
import SingleFile from "@coreModule/components/viewEngine/widgets/media/singleFile.tsx";

const MAX_PDF_BYTES = 200 * 1024 * 1024;

type GenerateFloorsUnitsDialogProps = WithLanguageType & WithAxiosType<any, any> & {
    open: boolean;
    onClose: () => void;
    edificeId: string;
}

function GenerateFloorsUnitsDialog({
    open,
    onClose,
    edificeId,
    resolveLanguageKey,
    innerRef,
    onFormDataChange,
    loading
}: GenerateFloorsUnitsDialogProps) {
    const [selectedFile, setSelectedFile] = useState<File | undefined>(undefined);
    const [oldPdf, setOldPdf] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(innerRef, () => ({
        success: () => {
            onClose();
            setSelectedFile(undefined);
            setOldPdf(false);
        },
    }));

    useEffect(() => {
        if (!open) {
            setSelectedFile(undefined);
            setOldPdf(false);
        }
    }, [open]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (e.target) e.target.value = "";
        if (!file) return;

        if (file.type !== "application/pdf") {
            toast.error(resolveLanguageKey("invalidFileType"));
            return;
        }
        if (file.size > MAX_PDF_BYTES) {
            toast.error(resolveLanguageKey("fileTooLarge"));
            return;
        }
        setSelectedFile(file);
    };

    const handleGenerate = () => {
        if (!selectedFile) {
            toast.error(resolveLanguageKey("noFileSelected"));
            return;
        }
        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("_id", edificeId);
        formData.append("oldPdf", String(oldPdf));
        onFormDataChange(formData);
    };

    const handleClose = () => {
        if (loading) {
            return;
        }
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={(isOpen) => {if (!isOpen && !loading) {handleClose();}}}>
            <DialogContent
                className="sm:max-w-md"
                showCloseButton={!loading}
                onInteractOutside={(e) => {if (loading) {e.preventDefault();}}}
                onEscapeKeyDown={(e) => {if (loading) {e.preventDefault();}}}
            >
                <DialogHeader>
                    <DialogTitle>{resolveLanguageKey("dialogTitle")}</DialogTitle>
                    <DialogDescription>
                        {resolveLanguageKey("dialogDescription")}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-y-4 min-w-0">
                    <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                            {resolveLanguageKey("warningMessage")}
                        </AlertDescription>
                    </Alert>

                    <div className="flex flex-col gap-y-2 min-w-0">
                        <Label>{resolveLanguageKey("fileLabel")}</Label>
                        <input
                            ref={fileInputRef}
                            type="file"
                            className="hidden"
                            accept="application/pdf,.pdf"
                            onChange={handleFileChange}
                            disabled={loading}
                        />
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={loading}
                        >
                            {resolveLanguageKey("addFile")}
                        </Button>
                        {selectedFile && (
                            <SingleFile
                                file={{
                                    id: "temp-generate-floors-pdf",
                                    file: selectedFile,
                                    path: URL.createObjectURL(selectedFile),
                                    body: undefined,
                                }}
                                canDownload={true}
                                canRemove={!loading}
                                isBig={false}
                                onRemove={() => setSelectedFile(undefined)}
                            />
                        )}
                    </div>

                    <div className="flex items-start gap-x-2">
                        <Checkbox
                            id="generate-floors-old-pdf"
                            checked={oldPdf}
                            disabled={loading}
                            onCheckedChange={(value) => setOldPdf(!!value)}
                        />
                        <Label htmlFor="generate-floors-old-pdf" className="text-sm font-normal cursor-pointer leading-5">
                            {resolveLanguageKey("oldPdfLabel")}
                        </Label>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={handleClose} disabled={loading}>
                        {resolveLanguageKey("cancel")}
                    </Button>
                    <Button onClick={handleGenerate} disabled={loading || !selectedFile}>
                        {(loading) ? <LoaderCircle className="animate-spin" /> : <Upload />}
                        {resolveLanguageKey( loading ? "processing" : "generate" )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/components/custom/edifices/generateFloorsUnitsDialog.tsx"),
    withAxios(
        {
            method: "POST",
            url: "/api/realEstate/edifice/generateFloorsUnits",
            data: {}
        },
        true
    ),
    withDebug(true, true, "edifices")
)(GenerateFloorsUnitsDialog);
