import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {compose} from "redux";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useEffect, useImperativeHandle, useRef, useState} from "react";
import {ApproveModificationRequestForm} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/modificationRequest/approveModificationRequest.form.type.ts";
import {LoaderCircle, CheckCircle2, XCircle, Building2, Ruler, BriefcaseBusiness, Plus, X} from "lucide-react";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "@coreModule/components/ui/alert-dialog.tsx";
import {ModificationRequest} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/modificationRequest/modificationRequest.dto.ts";
import {Media} from "armonia/src/modules/core/types";
import {Textarea} from "@coreModule/components/ui/textarea.tsx";
import {Label} from "@coreModule/components/ui/label.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import {SimpleSelect} from "@coreModule/components/custom/simpleSelect";
import {Button} from "@coreModule/components/ui/button.tsx";
import SingleFile from "@coreModule/components/custom/files/singleFile.tsx";
import {Badge} from "@coreModule/components/ui/badge.tsx";

type MaterialPlanRow = { item: string; quantity?: number; unit?: string; notes?: string };

function mapMaterialsFromPlan(plan: unknown): MaterialPlanRow[] {
    if (!Array.isArray(plan)) return [];
    return plan.map((m: any) => ({
        item: m.item || "",
        quantity: m.quantity,
        unit: m.unit,
        notes: m.notes,
    }));
}

function getStageApproval(request: ModificationRequest, stage: "architect" | "engineer" | "ceo") {
    if (stage === "architect") return request.architectApproval;
    if (stage === "engineer") return request.engineerApproval;
    return request.ceoApproval;
}

function mediaIdsFromStageApproval(approval: {media?: Media[]} | undefined): string[] {
    const list = approval?.media;
    if (!Array.isArray(list)) return [];
    return list.map((m) => m._id).filter(Boolean);
}

type ApproveModificationRequestDialogProps = WithLanguageType & WithAxiosType<any, ApproveModificationRequestForm> & {
    open: boolean;
    onClose: () => void;
    request: ModificationRequest;
    onSuccess?: (updated?: ModificationRequest) => void;
}

function ApproveModificationRequestDialog({
    open,
    onClose,
    request,
    resolveLanguageKey,
    innerRef,
    onPost,
    onSuccess = () => {},
    loading,
}: ApproveModificationRequestDialogProps) {
    const [decision, setDecision] = useState<"approved" | "rejected">("approved");
    const [notes, setNotes] = useState("");
    const [rejectReasonCode, setRejectReasonCode] = useState<"design" | "technical" | "budget" | "other" | undefined>(undefined);
    const [mediaFiles, setMediaFiles] = useState<File[]>([]);
    const [retainedMediaIds, setRetainedMediaIds] = useState<string[]>([]);
    const [materials, setMaterials] = useState<MaterialPlanRow[]>(() =>
        mapMaterialsFromPlan((request.engineerApproval as any)?.materialsPlan),
    );
    const mediaInputRef = useRef<HTMLInputElement>(null);

    // Determine the current stage based on status
    const getCurrentStage = (): "architect" | "engineer" | "ceo" | null => {
        const status = request.status;
        if (status === "pending_architect" || status === "pending_architect_revision") return "architect";
        if (status === "pending_engineer" || status === "pending_engineer_revision") return "engineer";
        if (status === "pending_ceo") return "ceo";
        return null;
    };

    const currentStage = getCurrentStage();

    const handleOpenChange = (next: boolean) => {
        if (!next && !loading) onClose();
    };

    /** When re-approving the same step (e.g. after revision), restore prior notes/decision/materials from the entity. */
    useEffect(() => {
        if (!open || !currentStage) return;
        const approval = getStageApproval(request, currentStage);
        const dec = approval?.decision;
        setDecision(dec === "approved" || dec === "rejected" ? dec : "approved");
        setNotes(typeof approval?.notes === "string" ? approval.notes : "");
        setRejectReasonCode(undefined);
        setMediaFiles([]);
        setRetainedMediaIds(mediaIdsFromStageApproval(approval));
        if (currentStage === "engineer") {
            setMaterials(mapMaterialsFromPlan((approval as any)?.materialsPlan));
        } else {
            setMaterials([]);
        }
    }, [
        open,
        currentStage,
        request._id,
        request.status,
        request.architectApproval?.decision,
        request.architectApproval?.notes,
        request.engineerApproval?.decision,
        request.engineerApproval?.notes,
        (request.engineerApproval as any)?.materialsPlan,
        request.ceoApproval?.decision,
        request.ceoApproval?.notes,
        request.architectApproval?.media,
        request.engineerApproval?.media,
        request.ceoApproval?.media,
    ]);

    useImperativeHandle(innerRef, () => ({
        success: (data: ApproveModificationRequestForm) => {
            onSuccess?.(data as unknown as ModificationRequest);
            onClose();
            setDecision("approved");
            setNotes("");
            setRejectReasonCode(undefined);
            setMediaFiles([]);
            setRetainedMediaIds([]);
            setMaterials([]);
        }
    }));

    const handleApprove = () => {
        if (!currentStage) return;
        const mergedMedia = [...retainedMediaIds, ...mediaFiles];
        onPost({
            _id: request._id,
            stage: currentStage,
            decision,
            notes: notes.trim() || undefined,
            rejectReasonCode: decision === "rejected" ? rejectReasonCode : undefined,
            media: mergedMedia.length > 0 ? mergedMedia as unknown as string[] : undefined,
            materialsPlan: currentStage === "engineer"
                ? materials
                    .filter((m) => m.item?.trim())
                    .map((m) => ({item: m.item.trim(), quantity: m.quantity, unit: m.unit, notes: m.notes}))
                : undefined,
        });
    };
    const handleMediaFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            const cap = Math.max(0, 20 - mediaFiles.length - retainedMediaIds.length);
            const filesToAdd = files.slice(0, cap);
            setMediaFiles(prev => [...prev, ...filesToAdd]);
        }
        if (e.target) e.target.value = "";
    };
    const removeMediaFile = (index: number) => setMediaFiles(mediaFiles.filter((_, i) => i !== index));
    const removeRetainedMedia = (id: string) => setRetainedMediaIds((prev) => prev.filter((x) => x !== id));
    const addMaterial = () => {
        setMaterials((prev) => [...prev, {item: "", quantity: undefined, unit: undefined, notes: undefined}]);
    };
    const removeMaterial = (index: number) => setMaterials(materials.filter((_, i) => i !== index));
    const updateMaterial = (index: number, field: keyof MaterialPlanRow, value: string | number | undefined) => {
        const updated = [...materials];
        updated[index] = {...updated[index], [field]: value};
        setMaterials(updated);
    };

    if (!currentStage) return null;

    const getStageLabel = () => {
        switch (currentStage) {
            case "architect": return resolveLanguageKey("architectStage");
            case "engineer": return resolveLanguageKey("engineerStage");
            case "ceo": return resolveLanguageKey("ceoStage");
            default: return currentStage;
        }
    };
    const stageIcon = currentStage === "architect" ? Building2 : currentStage === "engineer" ? Ruler : BriefcaseBusiness;
    const StageIcon = stageIcon;

    const stageApprovalForMedia = currentStage ? getStageApproval(request, currentStage) : undefined;
    const retainedMediaItems: Media[] = retainedMediaIds
        .map((id) => stageApprovalForMedia?.media?.find((m) => m._id === id))
        .filter((m): m is Media => m != null);
    const mediaSlotCount = retainedMediaIds.length + mediaFiles.length;

    return (
        <AlertDialog open={open} onOpenChange={handleOpenChange}>
                <AlertDialogContent className="max-h-[85vh] min-w-[40vw] max-w-[100vw] overflow-y-auto overflow-x-hidden">
                    <AlertDialogHeader>
                        <AlertDialogTitle>{resolveLanguageKey("approveConfirmTitle")}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {resolveLanguageKey("approveConfirmDescription").replace("{stage}", getStageLabel())}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="flex flex-col gap-y-4">

                        <div className="rounded-md border p-3 bg-muted/40">
                            <p className="text-xs text-muted-foreground mb-2">{resolveLanguageKey("stageLabel")}</p>
                            <div className="flex items-center gap-2">
                                <StageIcon className="h-4 w-4" />
                                <p className="text-base font-semibold">{getStageLabel()}</p>
                                <Badge variant="outline" className="ml-1">{currentStage}</Badge>
                            </div>
                        </div>

                        {currentStage === "engineer" && (
                            <div className="rounded-md border p-3 bg-muted/20">
                                <p className="text-sm font-medium mb-2">{resolveLanguageKey("materialsPlanLabel")}</p>
                                <div className="mb-2">
                                    <Button type="button" onClick={addMaterial} disabled={loading} size="sm" variant="outline">
                                        <Plus className="h-4 w-4" />
                                        <span className="ml-2">{resolveLanguageKey("materialsPlanAddPlaceholder")}</span>
                                    </Button>
                                </div>
                                {materials.length === 0 ? (
                                    <p className="text-xs text-muted-foreground">{resolveLanguageKey("materialsPlanEmptyHint")}</p>
                                ) : (
                                    <div className="flex flex-col gap-y-2 max-h-64 overflow-y-auto pr-1">
                                        {materials.map((material, idx) => (
                                            <div key={`material-${idx}`} className="grid grid-cols-1 md:grid-cols-12 gap-2 rounded-md border p-2">
                                                <input
                                                    value={material.item}
                                                    onChange={(e) => updateMaterial(idx, "item", e.target.value)}
                                                    placeholder="Item"
                                                    className="h-9 md:col-span-4 rounded-md border bg-background px-3 text-sm"
                                                    disabled={loading}
                                                />
                                                <input
                                                    type="number"
                                                    value={material.quantity ?? ""}
                                                    onChange={(e) => updateMaterial(idx, "quantity", e.target.value ? Number(e.target.value) : undefined)}
                                                    placeholder="Qty"
                                                    className="h-9 md:col-span-2 rounded-md border bg-background px-3 text-sm"
                                                    disabled={loading}
                                                />
                                                <input
                                                    value={material.unit ?? ""}
                                                    onChange={(e) => updateMaterial(idx, "unit", e.target.value || undefined)}
                                                    placeholder="Unit"
                                                    className="h-9 md:col-span-2 rounded-md border bg-background px-3 text-sm"
                                                    disabled={loading}
                                                />
                                                <input
                                                    value={material.notes ?? ""}
                                                    onChange={(e) => updateMaterial(idx, "notes", e.target.value || undefined)}
                                                    placeholder="Notes"
                                                    className="h-9 md:col-span-3 rounded-md border bg-background px-3 text-sm"
                                                    disabled={loading}
                                                />
                                                <Button type="button" variant="ghost" size="icon" className="md:col-span-1" onClick={() => removeMaterial(idx)} disabled={loading}>
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        <div>
                            <Label className="mb-2 block">{resolveLanguageKey("decisionLabel")}</Label>
                            <SimpleSelect
                                options={[
                                    {value: "approved", label: resolveLanguageKey("approve")},
                                    {value: "rejected", label: resolveLanguageKey("reject")},
                                ]}
                                value={decision}
                                onValueChange={(value: string) => setDecision(value as "approved" | "rejected")}
                                placeholder={resolveLanguageKey("decisionPlaceholder")}
                                disabled={loading}
                            />
                        </div>
                        {decision === "rejected" && (
                            <div>
                                <Label className="mb-2 block">{resolveLanguageKey("rejectReasonLabel")}</Label>
                                <SimpleSelect
                                    options={[
                                        {value: "design", label: resolveLanguageKey("rejectReasonDesign")},
                                        {value: "technical", label: resolveLanguageKey("rejectReasonTechnical")},
                                        {value: "budget", label: resolveLanguageKey("rejectReasonBudget")},
                                        {value: "other", label: resolveLanguageKey("rejectReasonOther")},
                                    ]}
                                    value={rejectReasonCode}
                                    onValueChange={(value: string) => setRejectReasonCode(value as any)}
                                    placeholder={resolveLanguageKey("rejectReasonPlaceholder")}
                                    disabled={loading}
                                />
                            </div>
                        )}
                        <div>
                            <Label htmlFor="notes" className="mb-2 block">
                                {resolveLanguageKey("notesLabel")}
                            </Label>
                            <Textarea
                                id="notes"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder={resolveLanguageKey("notesPlaceholder")}
                                disabled={loading}
                                className="min-h-[100px] max-h-[150px] overflow-y-auto resize-none"
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
                                disabled={loading || mediaSlotCount >= 20}
                            />
                            <Button type="button" variant="outline" size="sm" onClick={() => mediaInputRef.current?.click()} disabled={loading || mediaSlotCount >= 20}>
                                {resolveLanguageKey("addFile")}
                            </Button>
                            {(retainedMediaItems.length > 0 || mediaFiles.length > 0) && (
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {retainedMediaItems.map((m) => (
                                        <SingleFile
                                            key={`approve-media-existing-${m._id}`}
                                            file={{id: m._id, file: m, path: `/api/auxiliary/media/${m._id}`, body: undefined}}
                                            canDownload={true}
                                            canRemove={true}
                                            isBig={false}
                                            onRemove={() => removeRetainedMedia(m._id)}
                                        />
                                    ))}
                                    {mediaFiles.map((file, index) => (
                                        <SingleFile
                                            key={`approve-media-${index}-${file.name}`}
                                            file={{id: `temp-approve-${index}`, file, path: URL.createObjectURL(file), body: undefined}}
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
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={loading} onClick={() => {
                            if (!currentStage) {
                                setDecision("approved");
                                setNotes("");
                                setRejectReasonCode(undefined);
                                setMediaFiles([]);
                                setRetainedMediaIds([]);
                                setMaterials([]);
                                return;
                            }
                            const approval = getStageApproval(request, currentStage);
                            const dec = approval?.decision;
                            setDecision(dec === "approved" || dec === "rejected" ? dec : "approved");
                            setNotes(typeof approval?.notes === "string" ? approval.notes : "");
                            setRejectReasonCode(undefined);
                            setMediaFiles([]);
                            setRetainedMediaIds(mediaIdsFromStageApproval(approval));
                            if (currentStage === "engineer") {
                                setMaterials(mapMaterialsFromPlan((approval as any)?.materialsPlan));
                            } else {
                                setMaterials([]);
                            }
                        }}>
                            {resolveLanguageKey("cancel")}
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleApprove(); }}
                            disabled={loading}
                            className={cn({"hover:bg-success hover:text-success-foreground": decision === "approved", "text-destructive-foreground hover:bg-destructive/90": decision === "rejected"})}
                        >
                            {(loading) ? <LoaderCircle className="animate-spin"/> : (decision === "approved" ? <CheckCircle2 /> : <XCircle />)}
                            <p>{resolveLanguageKey("confirmButton")}</p>
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/components/custom/modificationRequests/approveModificationRequestDialog.tsx"),
    withAxios(
        {
            method: "post",
            url: "/api/realEstate/unit/modificationRequest/approve",
            data: {}
        },
        true
    ),
    withDebug(true, true, "modificationRequests")
)(ApproveModificationRequestDialog);
