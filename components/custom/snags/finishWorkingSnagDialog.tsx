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
import {Label} from "@coreModule/components/ui/label.tsx";
import {Textarea} from "@coreModule/components/ui/textarea.tsx";
import SingleFile from "@coreModule/components/custom/files/singleFile.tsx";
import type {Snag} from "armonia/src/modules/propertyManagement/api/realEstate/private/snag/snag.dto.ts";

type FinishWorkingSnagDialogProps = WithLanguageType &
    WithAxiosType<Snag, any> & {
        open: boolean;
        onClose: () => void;
        snag: Snag;
        onSuccess?: (updated?: Snag) => void;
    };

function FinishWorkingSnagDialog({
    snag,
    open,
    onClose,
    resolveLanguageKey,
    innerRef,
    onFormDataChange,
    onFilterChange,
    onSuccess = () => {},
    loading,
}: FinishWorkingSnagDialogProps) {
    const [notes, setNotes] = useState("");
    const [mediaFiles, setMediaFiles] = useState<File[]>([]);
    const mediaInputRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(innerRef, () => ({
        success: (data?: Snag) => {
            setNotes("");
            setMediaFiles([]);
            onClose();
            onSuccess?.(data);
        },
    }));

    useEffect(() => {
        if (!open) {
            setNotes("");
            setMediaFiles([]);
        }
    }, [open]);

    const handleOpenChange = (next: boolean) => {
        if (!next && !loading) {
            setNotes("");
            setMediaFiles([]);
            onClose();
        }
    };

    const handleMediaFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            const remainingSlots = 20 - mediaFiles.length;
            setMediaFiles((prev) => [...prev, ...files.slice(0, remainingSlots)]);
        }
        if (e.target) e.target.value = "";
    };

    const removeMediaFile = (index: number) => {
        setMediaFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = () => {
        const payload = {
            _id: snag._id,
            notes: notes.trim() || undefined,
        };

        if (mediaFiles.length === 0) {
            onFilterChange(payload);
            return;
        }

        const formData = new FormData();
        formData.append("data", JSON.stringify(payload));
        mediaFiles.forEach((file) => formData.append("files", file));
        onFormDataChange(formData);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <DialogHeader>
                    <DialogTitle>
                        {snag.title
                            ? `${resolveLanguageKey("dialogTitle")} — ${snag.title}`
                            : resolveLanguageKey("dialogTitle")}
                    </DialogTitle>
                    <DialogDescription>
                        {resolveLanguageKey("dialogDescription")}
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-2">
                    <div className="space-y-2">
                        <Label>{resolveLanguageKey("notesLabel")}</Label>
                        <Textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder={resolveLanguageKey("notesPlaceholder")}
                            disabled={loading}
                            rows={4}
                            className="resize-none max-h-80"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>{resolveLanguageKey("photosLabel")}</Label>
                        <input
                            ref={mediaInputRef}
                            type="file"
                            className="hidden"
                            accept="image/*"
                            multiple
                            onChange={handleMediaFilesChange}
                            disabled={loading || mediaFiles.length >= 20}
                        />
                        <div className="flex flex-col gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => mediaInputRef.current?.click()}
                                disabled={loading || mediaFiles.length >= 20}
                            >
                                {resolveLanguageKey("addPhotos")}
                            </Button>
                            {mediaFiles.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {mediaFiles.map((file, index) => (
                                        <SingleFile
                                            key={`finish-snag-media-${index}-${file.name}`}
                                            file={{
                                                id: `temp-finish-${index}`,
                                                file,
                                                path: URL.createObjectURL(file),
                                                body: undefined,
                                            }}
                                            canDownload={true}
                                            canRemove={true}
                                            isBig={false}
                                            onRemove={() => removeMediaFile(index)}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={loading}>
                        {resolveLanguageKey("cancel")}
                    </Button>
                    <Button type="button" onClick={handleSubmit} disabled={loading}>
                        {loading ? <LoaderCircle className="animate-spin h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                        {resolveLanguageKey("submit")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/components/custom/snags/finishWorkingSnagDialog.tsx"),
    withAxios(
        {
            method: "POST",
            url:    "/api/realEstate/snag/finishWorking",
            data:   {},
        },
        true,
    ),
    withDebug(true, true),
)(FinishWorkingSnagDialog);
