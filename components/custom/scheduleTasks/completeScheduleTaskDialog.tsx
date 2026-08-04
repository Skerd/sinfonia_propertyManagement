import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {compose} from "redux";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useEffect, useImperativeHandle, useState} from "react";
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
import type {ScheduleTask} from "armonia/src/modules/propertyManagement/api/realEstate/private/scheduleTask/scheduleTask.dto.ts";

type CompleteScheduleTaskDialogProps = WithLanguageType &
    WithAxiosType<ScheduleTask, any> & {
        open: boolean;
        onClose: () => void;
        scheduleTask: ScheduleTask;
        onSuccess?: (updated?: ScheduleTask) => void;
    };

function CompleteScheduleTaskDialog({
    scheduleTask,
    open,
    onClose,
    resolveLanguageKey,
    innerRef,
    onFilterChange,
    onSuccess = () => {},
    loading,
}: CompleteScheduleTaskDialogProps) {
    const [notes, setNotes] = useState("");

    useImperativeHandle(innerRef, () => ({
        success: (data?: ScheduleTask) => {
            setNotes("");
            onClose();
            onSuccess?.(data);
        },
    }));

    useEffect(() => {
        if (!open) setNotes("");
    }, [open]);

    const handleOpenChange = (next: boolean) => {
        if (!next && !loading) {
            setNotes("");
            onClose();
        }
    };

    const handleSubmit = () => {
        onFilterChange({_id: scheduleTask._id, notes: notes.trim() || undefined});
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-lg" onClick={(e) => e.stopPropagation()}>
                <DialogHeader>
                    <DialogTitle>
                        {scheduleTask.title
                            ? `${resolveLanguageKey("dialogTitle")} — ${scheduleTask.title}`
                            : resolveLanguageKey("dialogTitle")}
                    </DialogTitle>
                    <DialogDescription>
                        {resolveLanguageKey("dialogDescription")}
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-y-2 py-2">
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
    withLanguage("src/modules/propertyManagement/components/custom/scheduleTasks/completeScheduleTaskDialog.tsx"),
    withAxios(
        {
            method: "POST",
            url:    "/api/realEstate/scheduleTask/complete",
            data:   {},
        },
        true,
    ),
    withDebug(true, true),
)(CompleteScheduleTaskDialog);
