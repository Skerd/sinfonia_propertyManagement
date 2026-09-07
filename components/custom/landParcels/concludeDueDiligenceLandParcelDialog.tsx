import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {compose} from "redux";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useEffect, useImperativeHandle, useMemo, useState} from "react";
import {BadgeCheck, LoaderCircle} from "lucide-react";
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
import {SimpleSelect} from "@coreModule/components/custom/simpleSelect";
import MultiLocalFilePicker from "@coreModule/components/custom/files/multiLocalFilePicker.tsx";
import type {LandParcel} from "armonia/src/modules/propertyManagement/api/realEstate/private/landParcel/landParcel.dto.ts";
import {
    LAND_PARCEL_DUE_DILIGENCE_STEP_MAX_FILES,
    LAND_PARCEL_LONG_TEXT_MAX,
    LAND_PARCEL_SHORT_TEXT_MAX,
    landParcelConcludeDueDiligenceOutcomes,
} from "armonia/src/modules/propertyManagement/api/realEstate/private/landParcel/landParcel.schema-def.ts";

type Props = WithLanguageType &
    WithAxiosType<LandParcel, any> & {
        open: boolean;
        onClose: () => void;
        landParcel: LandParcel;
        onSuccess?: (updated?: LandParcel) => void;
    };

function ConcludeDueDiligenceLandParcelDialog({
    landParcel,
    open,
    onClose,
    resolveLanguageKey,
    innerRef,
    onFilterChange,
    onFormDataChange,
    onSuccess = () => {},
    loading,
}: Props) {
    const [outcome, setOutcome] = useState<string | undefined>(undefined);
    const [cadastralReference, setCadastralReference] = useState("");
    const [acquisitionNotes, setAcquisitionNotes] = useState("");
    const [dueDiligenceStatus, setDueDiligenceStatus] = useState("");
    const [dueDiligenceNotes, setDueDiligenceNotes] = useState("");
    const [mediaFiles, setMediaFiles] = useState<File[]>([]);

    useImperativeHandle(innerRef, () => ({
        success: (data?: LandParcel) => {
            onClose();
            onSuccess?.(data);
        },
    }));

    useEffect(() => {
        if (open) {
            setOutcome(undefined);
            setCadastralReference(landParcel.cadastralReference ?? "");
            setAcquisitionNotes("");
            setDueDiligenceStatus("");
            setDueDiligenceNotes("");
            setMediaFiles([]);
        }
    }, [open, landParcel.cadastralReference]);

    const handleOpenChange = (next: boolean) => {
        if (!next && !loading) onClose();
    };

    const outcomeOptions = useMemo(
        () =>
            landParcelConcludeDueDiligenceOutcomes.map((value) => ({
                value,
                label: String(resolveLanguageKey(`outcomes.${value}`)),
            })),
        [resolveLanguageKey],
    );

    const handleOutcomeChange = (v: string | string[]) => {
        const raw = Array.isArray(v) ? v[0] : v;
        const next = raw === "approved" || raw === "declined" ? raw : undefined;
        setOutcome(next);
        if (next !== "declined") setMediaFiles([]);
    };

    const approvedIncomplete = outcome === "approved" && cadastralReference.trim() === "";
    const declinedIncomplete = outcome === "declined" && dueDiligenceStatus.trim() === "";
    const submitDisabled = loading || !outcome || approvedIncomplete || declinedIncomplete;

    const handleSubmit = () => {
        if (submitDisabled || !outcome) return;
        if (outcome === "approved") {
            onFilterChange({
                _id: landParcel._id,
                outcome,
                cadastralReference: cadastralReference.trim(),
                acquisitionNotes: acquisitionNotes.trim() ? acquisitionNotes.trim() : undefined,
            });
            return;
        }
        const payload = {
            _id: landParcel._id,
            outcome,
            dueDiligenceStatus: dueDiligenceStatus.trim(),
            dueDiligenceNotes: dueDiligenceNotes.trim() ? dueDiligenceNotes.trim() : undefined,
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
                        <Label>{resolveLanguageKey("outcomeLabel")}</Label>
                        <SimpleSelect
                            options={outcomeOptions}
                            value={outcome}
                            onValueChange={handleOutcomeChange}
                            placeholder={resolveLanguageKey("outcomePlaceholder")}
                            disabled={loading}
                        />
                    </div>
                    {outcome === "approved" && (
                        <>
                            <div className="flex flex-col gap-y-2">
                                <Label>{resolveLanguageKey("cadastralReferenceLabel")}</Label>
                                <Input
                                    value={cadastralReference}
                                    onChange={(e) => setCadastralReference(e.target.value)}
                                    placeholder={resolveLanguageKey("cadastralReferencePlaceholder") as string}
                                    maxLength={LAND_PARCEL_SHORT_TEXT_MAX}
                                    disabled={loading}
                                />
                            </div>
                            <div className="flex flex-col gap-y-2">
                                <Label>{resolveLanguageKey("acquisitionNotesLabel")}</Label>
                                <Textarea
                                    value={acquisitionNotes}
                                    onChange={(e) => setAcquisitionNotes(e.target.value)}
                                    placeholder={resolveLanguageKey("acquisitionNotesPlaceholder") as string}
                                    disabled={loading}
                                    rows={4}
                                    maxLength={LAND_PARCEL_LONG_TEXT_MAX}
                                    className="resize-none max-h-80"
                                />
                            </div>
                        </>
                    )}
                    {outcome === "declined" && (
                        <>
                            <div className="flex flex-col gap-y-2">
                                <Label>{resolveLanguageKey("dueDiligenceStatusLabel")}</Label>
                                <Input
                                    value={dueDiligenceStatus}
                                    onChange={(e) => setDueDiligenceStatus(e.target.value)}
                                    placeholder={resolveLanguageKey("dueDiligenceStatusPlaceholder") as string}
                                    maxLength={LAND_PARCEL_SHORT_TEXT_MAX}
                                    disabled={loading}
                                />
                            </div>
                            <div className="flex flex-col gap-y-2">
                                <Label>{resolveLanguageKey("dueDiligenceNotesLabel")}</Label>
                                <Textarea
                                    value={dueDiligenceNotes}
                                    onChange={(e) => setDueDiligenceNotes(e.target.value)}
                                    placeholder={resolveLanguageKey("dueDiligenceNotesPlaceholder") as string}
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
                        </>
                    )}
                </div>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={loading}>
                        {resolveLanguageKey("cancel") as string}
                    </Button>
                    <Button type="button" variant={outcome === "declined" ? "destructive" : "default"} onClick={handleSubmit} disabled={submitDisabled}>
                        {loading ? <LoaderCircle className="animate-spin h-4 w-4" /> : <BadgeCheck className="h-4 w-4" />}
                        {resolveLanguageKey("submit") as string}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/components/custom/landParcels/concludeDueDiligenceLandParcelDialog.tsx"),
    withAxios(
        {
            method: "POST",
            url: "/api/realEstate/landParcel/concludeDueDiligence",
            data: {},
        },
        true,
    ),
    withDebug(true, true, "landparcels"),
)(ConcludeDueDiligenceLandParcelDialog);
