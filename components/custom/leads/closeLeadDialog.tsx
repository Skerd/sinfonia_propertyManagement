import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {compose} from "redux";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useEffect, useImperativeHandle, useMemo, useState} from "react";
import {LoaderCircle, Scale} from "lucide-react";
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
import {SimpleSelect} from "@coreModule/components/custom/simpleSelect";
import FormMaxLengthControl from "@coreModule/components/custom/formMaxLengthControl.tsx";
import {Lead} from "armonia/src/modules/propertyManagement/api/realEstate/private/lead/lead.dto.ts";
import {
    LEAD_CLOSE_OUTCOMES,
    type CloseLeadForm,
    type LeadCloseOutcome,
} from "armonia/src/modules/propertyManagement/api/realEstate/private/lead/closeLead.form.type.ts";
import {LEAD_LONG_TEXT_MAX} from "armonia/src/modules/propertyManagement/api/realEstate/private/lead/lead.schema-def.ts";

type CloseLeadDialogProps = WithLanguageType &
    WithAxiosType<Lead, CloseLeadForm> & {
        open: boolean;
        onClose: () => void;
        lead: Lead;
        onSuccess?: (updated?: Lead) => void;
    };

function CloseLeadDialog({
    lead,
    open,
    onClose,
    resolveLanguageKey,
    innerRef,
    onFilterChange,
    onSuccess = () => {},
    loading,
}: CloseLeadDialogProps) {
    const [outcome, setOutcome] = useState<LeadCloseOutcome | undefined>(undefined);
    const [notes, setNotes] = useState("");
    const [lostReason, setLostReason] = useState("");

    useImperativeHandle(innerRef, () => ({
        success: (data?: Lead) => {
            setOutcome(undefined);
            setNotes("");
            setLostReason("");
            onClose();
            onSuccess?.(data);
        },
    }));

    useEffect(() => {
        if (!open) {
            setOutcome(undefined);
            setNotes("");
            setLostReason("");
        }
    }, [open]);

    const outcomeOptions = useMemo(
        () =>
            LEAD_CLOSE_OUTCOMES.map((value) => ({
                value,
                label: String(resolveLanguageKey(`outcomes.${value}`)),
            })),
        [resolveLanguageKey],
    );

    const handleOutcomeChange = (v: string | string[]) => {
        const raw = Array.isArray(v) ? v[0] : v;
        const next = raw === "won" || raw === "lost" ? raw : undefined;
        setOutcome(next);
        if (next !== "lost") setLostReason("");
    };

    const lostIncomplete = outcome === "lost" && lostReason.trim() === "";
    const submitDisabled = loading || !outcome || lostIncomplete;

    const handleSubmit = () => {
        if (submitDisabled || !outcome) return;
        onFilterChange({
            _id: lead._id,
            outcome,
            notes: notes.trim() || undefined,
            lostReason: outcome === "lost" ? lostReason.trim() : undefined,
        });
    };

    const handleOpenChange = (next: boolean) => {
        if (!next && !loading) {
            setOutcome(undefined);
            setNotes("");
            setLostReason("");
            onClose();
        }
    };

    const leadName = [lead.firstName, lead.lastName].filter(Boolean).join(" ");

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-md" onClick={(e) => e.stopPropagation()}>
                <DialogHeader>
                    <DialogTitle>
                        {leadName || lead.name
                            ? `${resolveLanguageKey("dialogTitle")} — ${leadName || lead.name}`
                            : resolveLanguageKey("dialogTitle")}
                    </DialogTitle>
                    <DialogDescription>
                        {resolveLanguageKey("dialogDescription")}
                    </DialogDescription>
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
                    {outcome === "lost" && (
                        <div className="flex flex-col gap-y-2">
                            <Label>{resolveLanguageKey("lostReasonLabel")} *</Label>
                            <FormMaxLengthControl maxLength={LEAD_LONG_TEXT_MAX} value={lostReason}>
                                <Textarea
                                    value={lostReason}
                                    onChange={(e) => setLostReason(e.target.value.slice(0, LEAD_LONG_TEXT_MAX))}
                                    placeholder={resolveLanguageKey("lostReasonPlaceholder")}
                                    disabled={loading}
                                    rows={3}
                                    maxLength={LEAD_LONG_TEXT_MAX}
                                    className="resize-none min-h-[100px]"
                                />
                            </FormMaxLengthControl>
                        </div>
                    )}
                    <div className="flex flex-col gap-y-2">
                        <Label>{resolveLanguageKey("notesLabel")}</Label>
                        <FormMaxLengthControl maxLength={LEAD_LONG_TEXT_MAX} value={notes}>
                            <Textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value.slice(0, LEAD_LONG_TEXT_MAX))}
                                placeholder={resolveLanguageKey("notesPlaceholder")}
                                disabled={loading}
                                rows={3}
                                maxLength={LEAD_LONG_TEXT_MAX}
                                className="resize-none max-h-80"
                            />
                        </FormMaxLengthControl>
                    </div>
                </div>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={loading}>
                        {resolveLanguageKey("cancel")}
                    </Button>
                    <Button
                        type="button"
                        variant={outcome === "lost" ? "destructive" : "default"}
                        onClick={handleSubmit}
                        disabled={submitDisabled}
                    >
                        {loading ? <LoaderCircle className="animate-spin h-4 w-4" /> : <Scale className="h-4 w-4" />}
                        {resolveLanguageKey(outcome === "lost" ? "submitLost" : outcome === "won" ? "submitWon" : "submit")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/components/custom/leads/closeLeadDialog.tsx"),
    withAxios(
        {
            method: "POST",
            url:    "/api/realEstate/lead/closeLead",
            data:   {},
            onSuccessMessage: {
                if:        "status",
                condition: "won",
                message:   "won",
            },
        },
        true,
    ),
    withDebug(true, true, "leads"),
)(CloseLeadDialog);
