import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {compose} from "redux";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useEffect, useImperativeHandle, useState} from "react";
import {ListPlus, LoaderCircle} from "lucide-react";
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
import {Input} from "@coreModule/components/ui/input.tsx";
import {Textarea} from "@coreModule/components/ui/textarea.tsx";
import MultiLocalFilePicker from "@coreModule/components/custom/files/multiLocalFilePicker.tsx";
import type {LandParcel} from "armonia/src/modules/propertyManagement/api/realEstate/private/landParcel/landParcel.dto.ts";
import {
    LAND_PARCEL_DUE_DILIGENCE_STEP_MAX_FILES,
    LAND_PARCEL_LONG_TEXT_MAX,
    LAND_PARCEL_SHORT_TEXT_MAX,
} from "armonia/src/modules/propertyManagement/api/realEstate/private/landParcel/landParcel.schema-def.ts";

type Props = WithLanguageType &
    WithAxiosType<LandParcel, any> & {
        open: boolean;
        onClose: () => void;
        landParcel: LandParcel;
        onSuccess?: (updated?: LandParcel) => void;
    };

function AddDueDiligenceStepLandParcelDialog({
    landParcel,
    open,
    onClose,
    resolveLanguageKey,
    innerRef,
    onFormDataChange,
    onSuccess = () => {},
    loading,
}: Props) {
    const [title, setTitle] = useState("");
    const [notes, setNotes] = useState("");
    const [mediaFiles, setMediaFiles] = useState<File[]>([]);

    useImperativeHandle(innerRef, () => ({
        success: (data?: LandParcel) => {
            onClose();
            onSuccess?.(data);
        },
    }));

    useEffect(() => {
        if (!open) {
            setTitle("");
            setNotes("");
            setMediaFiles([]);
        }
    }, [open]);

    const handleOpenChange = (next: boolean) => {
        if (!next && !loading) onClose();
    };

    const titleMissing = title.trim() === "";

    const handleSubmit = () => {
        if (loading || titleMissing) return;
        const payload = {
            _id: landParcel._id,
            title: title.trim(),
            notes: notes.trim() ? notes.trim() : undefined,
        };
        if (mediaFiles.length === 0) {
            onFormDataChange(payload);
            return;
        }
        const formData = new FormData();
        formData.append("data", JSON.stringify(payload));
        mediaFiles.forEach((file) => formData.append("files", file));
        onFormDataChange(formData);
    };

    const dialogTitle = landParcel.title
        ? `${resolveLanguageKey("dialogTitle")} — ${landParcel.title}`
        : (resolveLanguageKey("dialogTitle") as string);

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <DialogHeader>
                    <DialogTitle>{dialogTitle as string}</DialogTitle>
                    <DialogDescription>{resolveLanguageKey("dialogDescription") as string}</DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-y-4 py-2">
                    <div className="flex flex-col gap-y-2">
                        <Label>{resolveLanguageKey("titleLabel")}</Label>
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder={resolveLanguageKey("titlePlaceholder") as string}
                            maxLength={LAND_PARCEL_SHORT_TEXT_MAX}
                            disabled={loading}
                        />
                    </div>
                    <div className="flex flex-col gap-y-2">
                        <Label>{resolveLanguageKey("notesLabel")}</Label>
                        <Textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder={resolveLanguageKey("notesPlaceholder") as string}
                            disabled={loading}
                            rows={4}
                            maxLength={LAND_PARCEL_LONG_TEXT_MAX}
                            className="resize-none max-h-80"
                        />
                    </div>
                    <div className="flex flex-col gap-y-2">
                        <Label>{resolveLanguageKey("mediaLabel")}</Label>
                        <MultiLocalFilePicker
                            files={mediaFiles}
                            onFilesChange={setMediaFiles}
                            resolveLanguageKey={resolveLanguageKey}
                            disabled={loading}
                            maxFiles={LAND_PARCEL_DUE_DILIGENCE_STEP_MAX_FILES}
                            accept="application/pdf,image/*"
                            addFileKey="addFiles"
                            filesSelectedKey="filesSelected"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={loading}>
                        {resolveLanguageKey("cancel") as string}
                    </Button>
                    <Button type="button" onClick={handleSubmit} disabled={loading || titleMissing}>
                        {loading ? <LoaderCircle className="animate-spin h-4 w-4" /> : <ListPlus className="h-4 w-4" />}
                        {resolveLanguageKey("submit") as string}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/components/custom/landParcels/addDueDiligenceStepLandParcelDialog.tsx"),
    withAxios(
        {
            method: "POST",
            url: "/api/realEstate/landParcel/addDueDiligenceStep",
            data: {},
        },
        true,
    ),
    withDebug(true, true, "landparcels"),
)(AddDueDiligenceStepLandParcelDialog);
