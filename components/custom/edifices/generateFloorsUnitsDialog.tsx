import {useState, useEffect, useImperativeHandle} from "react";
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
import {AlertTriangle, LoaderCircle, Upload, FileText} from "lucide-react";
import {toast} from "sonner";
import {
    FileInput,
    FileUploader,
    FileUploaderContent,
    FileUploaderItem
} from "@coreModule/components/custom/files/fileUpload.tsx";

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
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

    useImperativeHandle(innerRef, () => ({
        success: () => {
            onClose();
            setSelectedFiles([]);
        },
    }));

    // Reset files when dialog closes
    useEffect(() => {
        if (!open) {
            setSelectedFiles([]);
        }
    }, [open]);

    const handleFileChange = (files: File[] | null) => {
        if (!files) {
            setSelectedFiles([]);
            return;
        }

        // Validate PDF files
        const pdfFiles = files.filter(file => {
            if (file.type !== 'application/pdf') {
                toast.error(resolveLanguageKey("invalidFileType"));
                return false;
            }
            return true;
        });

        setSelectedFiles(pdfFiles);
    };

    const handleGenerate = () => {
        if (selectedFiles.length === 0) {
            toast.error(resolveLanguageKey("noFileSelected"));
            return;
        }
        const formData = new FormData();
        formData.append('file', selectedFiles[0]);
        formData.append('_id', edificeId);
        // Call the axios handler
        onFormDataChange(formData);
    };

    const handleClose = () => {
        if (loading) {
            return; // Prevent closing during processing
        }
        onClose();
    };

    const selectedFile = selectedFiles.length > 0 ? selectedFiles[0] : null;

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
                
                <div className="flex flex-col gap-y-4 ">
                    <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                            {resolveLanguageKey("warningMessage")}
                        </AlertDescription>
                    </Alert>

                    <div className="flex flex-col gap-y-2">
                        <p className="text-sm font-medium">
                            {resolveLanguageKey("fileLabel")}
                        </p>
                        <div>
                            <FileUploader
                                value={selectedFiles}
                                onValueChange={handleFileChange}
                                dropzoneOptions={{
                                    accept: {
                                        "application/pdf": [".pdf"]
                                    },
                                    maxFiles: 1,
                                    maxSize: 50 * 1024 * 1024, // 50MB
                                    multiple: false
                                }}
                                className="w-full"
                            >
                                <FileUploaderContent>
                                    <FileInput className="border-2 border-dashed p-6 rounded-lg">
                                        <div className="flex flex-col items-center justify-center gap-2 text-center">
                                            <FileText className="h-8 w-8 text-muted-foreground" />
                                            <div className="text-sm">
                                            <span className="font-medium text-primary">
                                                Click to upload
                                            </span>{" "}
                                                or drag and drop
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                PDF file (max 50MB)
                                            </div>
                                        </div>
                                    </FileInput>
                                    {selectedFiles.length > 0 && (
                                        <FileUploaderItem index={0}>
                                            <div className="flex items-center gap-2 w-full">
                                                <FileText className="h-4 w-4" />
                                                <span className="truncate flex-1">
                                                {selectedFile?.name}
                                            </span>
                                                <span className="text-xs text-muted-foreground">
                                                ({(selectedFile ? (selectedFile.size / 1024 / 1024).toFixed(2) : 0)} MB)
                                            </span>
                                            </div>
                                        </FileUploaderItem>
                                    )}
                                </FileUploaderContent>
                            </FileUploader>
                        </div>
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
