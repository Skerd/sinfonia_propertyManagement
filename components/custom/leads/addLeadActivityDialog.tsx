import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {compose} from "redux";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useEffect, useImperativeHandle, useMemo, useState} from "react";
import {History, LoaderCircle} from "lucide-react";
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
import {LEAD_ACTIVITY_ACTION_VALUES} from "armonia/src/modules/propertyManagement/api/realEstate/private/lead/leadActivity.constants.ts";
import {LEAD_LONG_TEXT_MAX} from "armonia/src/modules/propertyManagement/api/realEstate/private/lead/lead.schema-def.ts";

type AddLeadActivityPayload = {
    _id: string;
    action: string;
    notes?: string;
};

type AddLeadActivityDialogProps = WithLanguageType &
    WithAxiosType<Lead, AddLeadActivityPayload> & {
        open: boolean;
        onClose: () => void;
        lead: Lead;
        onSuccess?: (updated?: Lead) => void;
    };

function AddLeadActivityDialog({
    lead,
    open,
    onClose,
    resolveLanguageKey,
    innerRef,
    onFilterChange,
    onSuccess = () => {},
    loading,
}: AddLeadActivityDialogProps) {
    const [action, setAction] = useState<string | undefined>(undefined);
    const [notes, setNotes] = useState("");

    const actionOptions = useMemo(
        () =>
            LEAD_ACTIVITY_ACTION_VALUES.map((value) => ({
                value,
                label: String(resolveLanguageKey(`activityActions.${value}`)),
            })),
        [resolveLanguageKey],
    );

    useImperativeHandle(innerRef, () => ({
        success: (data?: Lead) => {
            setAction(undefined);
            setNotes("");
            onClose();
            onSuccess?.(data);
        },
    }));

    useEffect(() => {
        if (!open) {
            setAction(undefined);
            setNotes("");
        }
    }, [open]);

    const handleSubmit = () => {
        if (!action) return;
        onFilterChange({
            _id: lead._id,
            action,
            notes: notes.trim() || undefined,
        });
    };

    const handleOpenChange = (next: boolean) => {
        if (!next && !loading) {
            setAction(undefined);
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
                            ? `${resolveLanguageKey("dialogTitle")} — ${leadName || lead.name}`
                            : resolveLanguageKey("dialogTitle")}
                    </DialogTitle>
                    <DialogDescription>
                        {resolveLanguageKey("dialogDescription")}
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-y-4 py-2">
                    <div className="flex flex-col gap-y-2">
                        <Label>{resolveLanguageKey("actionLabel")}</Label>
                        <SimpleSelect
                            options={actionOptions}
                            value={action}
                            onValueChange={(v: string | string[]) => setAction(Array.isArray(v) ? v[0] : v)}
                            placeholder={resolveLanguageKey("actionPlaceholder")}
                            disabled={loading}
                        />
                    </div>
                    <div className="flex flex-col gap-y-2">
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
                </div>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={loading}>
                        {resolveLanguageKey("cancel")}
                    </Button>
                    <Button type="button" onClick={handleSubmit} disabled={loading || !action}>
                        {loading ? <LoaderCircle className="animate-spin h-4 w-4" /> : <History className="h-4 w-4" />}
                        {resolveLanguageKey("submit")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/components/custom/leads/addLeadActivityDialog.tsx"),
    withAxios(
        {
            method: "POST",
            url:    "/api/realEstate/lead/addActivity",
            data:   {},
        },
        true,
    ),
    withDebug(true, true, "leads"),
)(AddLeadActivityDialog);
