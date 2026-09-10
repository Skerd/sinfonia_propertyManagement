import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {compose} from "redux";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useEffect, useImperativeHandle, useState} from "react";
import {LoaderCircle} from "lucide-react";
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
import FormMaxLengthControl from "@coreModule/components/custom/formMaxLengthControl.tsx";
import {Lead} from "armonia/src/modules/propertyManagement/api/realEstate/private/lead/lead.dto.ts";
import type {LeadTransitionForm} from "armonia/src/modules/propertyManagement/api/realEstate/private/lead/leadTransition.form.type.ts";
import {LEAD_LONG_TEXT_MAX} from "armonia/src/modules/propertyManagement/api/realEstate/private/lead/lead.schema-def.ts";

type LeadTransitionMethod = "markContacted" | "qualify" | "markProposal" | "markNegotiation" | "reopen";

const TRANSITION_SUCCESS_STATUS: Record<LeadTransitionMethod, string> = {
    markContacted:   "contacted",
    qualify:         "qualified",
    markProposal:    "proposal",
    markNegotiation: "negotiation",
    reopen:          "contacted",
};

type LeadTransitionDialogOwnProps = {
    open: boolean;
    onClose: () => void;
    lead: Lead;
    methodName: LeadTransitionMethod;
    onSuccess?: (updated?: Lead) => void;
};

type LeadTransitionDialogProps = WithLanguageType &
    WithAxiosType<Lead, LeadTransitionForm> &
    LeadTransitionDialogOwnProps;

function LeadTransitionDialog({
    lead,
    open,
    onClose,
    methodName,
    resolveLanguageKey,
    innerRef,
    onFilterChange,
    onSuccess = () => {},
    loading,
}: LeadTransitionDialogProps) {
    const [notes, setNotes] = useState("");

    useImperativeHandle(innerRef, () => ({
        success: (data?: Lead) => {
            setNotes("");
            onClose();
            onSuccess?.(data);
        },
    }));

    useEffect(() => {
        if (!open) setNotes("");
    }, [open]);

    const handleSubmit = () => {
        onFilterChange({
            _id: lead._id,
            notes: notes.trim() || undefined,
        });
    };

    const handleOpenChange = (next: boolean) => {
        if (!next && !loading) {
            setNotes("");
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
                            ? `${resolveLanguageKey(`titles.${methodName}`)} — ${leadName || lead.name}`
                            : resolveLanguageKey(`titles.${methodName}`)}
                    </DialogTitle>
                    <DialogDescription>
                        {resolveLanguageKey(`descriptions.${methodName}`)}
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-y-2 py-2">
                    <Label>{resolveLanguageKey("notesLabel")}</Label>
                    <FormMaxLengthControl maxLength={LEAD_LONG_TEXT_MAX} value={notes}>
                        <Textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value.slice(0, LEAD_LONG_TEXT_MAX))}
                            placeholder={resolveLanguageKey("notesPlaceholder")}
                            disabled={loading}
                            rows={4}
                            maxLength={LEAD_LONG_TEXT_MAX}
                            className="resize-none max-h-80"
                        />
                    </FormMaxLengthControl>
                </div>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={loading}>
                        {resolveLanguageKey("cancel")}
                    </Button>
                    <Button type="button" onClick={handleSubmit} disabled={loading}>
                        {loading ? <LoaderCircle className="animate-spin h-4 w-4" /> : null}
                        {resolveLanguageKey(`submit.${methodName}`)}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

const LANGUAGE_PATH = "src/modules/propertyManagement/components/custom/leads/leadTransitionDialog.tsx";

function composeTransitionDialog(methodName: LeadTransitionMethod) {
    function DialogWithMethod(props: Omit<LeadTransitionDialogProps, "methodName">) {
        return <LeadTransitionDialog {...props} methodName={methodName} />;
    }

    return compose(
        withLanguage(LANGUAGE_PATH),
        withAxios(
            {
                method: "POST",
                url:    `/api/realEstate/lead/${methodName}`,
                data:   {},
                onSuccessMessage: {
                    if:        "status",
                    condition: TRANSITION_SUCCESS_STATUS[methodName],
                    message:   methodName,
                },
            },
            true,
        ),
        withDebug(true, true, "leads"),
    )(DialogWithMethod);
}

export const MarkContactedLeadDialog = composeTransitionDialog("markContacted");
export const QualifyLeadDialog = composeTransitionDialog("qualify");
export const MarkProposalLeadDialog = composeTransitionDialog("markProposal");
export const MarkNegotiationLeadDialog = composeTransitionDialog("markNegotiation");
export const ReopenLeadDialog = composeTransitionDialog("reopen");
