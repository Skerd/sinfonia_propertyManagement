import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {compose} from "redux";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useEffect, useImperativeHandle, useRef, useState} from "react";
import {DeliverModificationRequestFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/modificationRequest/deliverMofidicationRequest.form.type.ts";
import {LoaderCircle, Package} from "lucide-react";
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
import FormMaxLengthControl from "@coreModule/components/custom/formMaxLengthControl.tsx";
import {MODIFICATION_REQUEST_LONG_TEXT_MAX} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/modificationRequest/modificationRequest.schema-def.ts";
import {ApiSelect} from "@coreModule/components/custom/apiSelect";
import {Button} from "@coreModule/components/ui/button.tsx";
import SingleFile from "@coreModule/components/custom/files/singleFile.tsx";

type DeliverModificationRequestDialogProps = WithLanguageType & WithAxiosType<any, DeliverModificationRequestFormType> & {
    open: boolean;
    onClose: () => void;
    request: ModificationRequest;
    onSuccess?: (updated?: ModificationRequest) => void;
}

function DeliverModificationRequestDialog({
    open,
    onClose,
    request,
    resolveLanguageKey,
    innerRef,
    onPost,
    onSuccess = () => {},
    loading,
}: DeliverModificationRequestDialogProps) {
    const [notes, setNotes] = useState("");
    const [selectedInspections, setSelectedInspections] = useState<string[]>([]);
    const [mediaFiles, setMediaFiles] = useState<File[]>([]);
    const mediaInputRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(innerRef, () => ({
        success: (data: DeliverModificationRequestFormType) => {
            onSuccess?.(data as unknown as ModificationRequest);
            onClose();
            setNotes("");
            setSelectedInspections([]);
            setMediaFiles([]);
        }
    }));

    useEffect(() => {
        if (!open) {
            setNotes("");
            setSelectedInspections([]);
            setMediaFiles([]);
        }
    }, [open]);

    const handleOpenChange = (next: boolean) => {
        if (!next && !loading) onClose();
    };

    const handleDeliver = () => {
        onPost({
            _id: request._id,
            notes: notes.trim() || undefined,
            inspections: selectedInspections.length > 0 ? selectedInspections : undefined,
            media: mediaFiles.length > 0 ? mediaFiles as unknown as string[] : undefined,
        } as DeliverModificationRequestFormType);
    };

    const handleInspectionSelect = (value: string | string[]) => {
        setSelectedInspections(Array.isArray(value) ? value : value ? [value] : []);
    };

    const handleMediaFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            const remainingSlots = 20 - mediaFiles.length;
            const filesToAdd = files.slice(0, remainingSlots);
            setMediaFiles(prev => [...prev, ...filesToAdd]);
        }
        if (e.target) e.target.value = '';
    };
    const removeMediaFile = (index: number) => {
        setMediaFiles(mediaFiles.filter((_, i) => i !== index));
    };

    return (
        <AlertDialog open={open} onOpenChange={handleOpenChange}>
                <AlertDialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto overflow-x-hidden">
                    <AlertDialogHeader>
                        <AlertDialogTitle>{resolveLanguageKey("deliverConfirmTitle")}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {resolveLanguageKey("deliverConfirmDescription")}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="flex min-w-0 flex-col py-4 gap-y-4">
                        <div>
                            <Label htmlFor="notes" className="mb-2">
                                {resolveLanguageKey("notesLabel")}
                            </Label>
                            <FormMaxLengthControl maxLength={MODIFICATION_REQUEST_LONG_TEXT_MAX} value={notes}>
                                <Textarea
                                    id="notes"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value.slice(0, MODIFICATION_REQUEST_LONG_TEXT_MAX))}
                                    placeholder={resolveLanguageKey("notesPlaceholder")}
                                    disabled={loading}
                                    maxLength={MODIFICATION_REQUEST_LONG_TEXT_MAX}
                                    className="min-h-[100px] max-h-[150px] overflow-y-auto resize-none"
                                />
                            </FormMaxLengthControl>
                        </div>
                        <div className="min-w-0">
                            <Label className="mb-2 block">
                                {resolveLanguageKey("inspectionsLabel")}
                            </Label>
                            <ApiSelect
                                apiUrl="/api/realEstate/unit/inspection/select"
                                multiple
                                showSelectedChips
                                postBody={{
                                    limit: 100,
                                    ...(request.unit?._id
                                        ? {
                                            filters: {
                                                id: "deliver-inspection-unit",
                                                operator: "and",
                                                rules: [{
                                                    id: "unit",
                                                    field: "unit",
                                                    operator: "equals",
                                                    value: request.unit._id,
                                                }],
                                                groups: [],
                                            },
                                        }
                                        : {}),
                                }}
                                value={selectedInspections}
                                onValueChange={handleInspectionSelect}
                                placeholder={resolveLanguageKey("selectInspectionsPlaceholder") || "Select inspection..."}
                                disabled={loading}
                                pageSize={50}
                            />
                        </div>
                        <div>
                            <Label className="mb-2 block">{resolveLanguageKey("mediaLabel")}</Label>
                            <input
                                ref={mediaInputRef}
                                type="file"
                                className="hidden"
                                accept="*/*"
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
                                    {resolveLanguageKey("addFile")}
                                </Button>
                                {mediaFiles.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {mediaFiles.map((file, index) => (
                                            <SingleFile
                                                key={`deliver-media-${index}-${file.name}`}
                                                file={{
                                                    id: `temp-deliver-${index}`,
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
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={loading} onClick={() => {
                            setNotes("");
                            setSelectedInspections([]);
                            setMediaFiles([]);
                        }}>
                            {resolveLanguageKey("cancel")}
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {e.preventDefault(); e.stopPropagation(); handleDeliver();}}
                            disabled={loading}
                            className="hover:text-success-foreground hover:bg-success"
                        >
                            {(loading) ? <LoaderCircle className="animate-spin"/> : <Package />}
                            <p>{resolveLanguageKey("confirmButton")}</p>
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/components/custom/modificationRequests/deliverModificationRequestDialog.tsx"),
    withAxios(
        {
            method: "post",
            url: "/api/realEstate/unit/modificationRequest/deliver",
            data: {}
        },
        true
    ),
    withDebug(true, true, "modificationRequests")
)(DeliverModificationRequestDialog);
