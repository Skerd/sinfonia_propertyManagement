import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {compose} from "redux";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useEffect, useImperativeHandle, useState} from "react";
import {Gauge, LoaderCircle} from "lucide-react";
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
import type {ScheduleTask} from "armonia/src/modules/propertyManagement/api/realEstate/private/scheduleTask/scheduleTask.dto.ts";

type UpdateProgressScheduleTaskDialogProps = WithLanguageType &
    WithAxiosType<ScheduleTask, any> & {
        open: boolean;
        onClose: () => void;
        scheduleTask: ScheduleTask;
        onSuccess?: (updated?: ScheduleTask) => void;
    };

function UpdateProgressScheduleTaskDialog({
    scheduleTask,
    open,
    onClose,
    resolveLanguageKey,
    innerRef,
    onFilterChange,
    onSuccess = () => {},
    loading,
}: UpdateProgressScheduleTaskDialogProps) {
    const [percent, setPercent] = useState<string>(String(scheduleTask.percentComplete ?? 0));

    useImperativeHandle(innerRef, () => ({
        success: (data?: ScheduleTask) => {
            onClose();
            onSuccess?.(data);
        },
    }));

    useEffect(() => {
        if (open) setPercent(String(scheduleTask.percentComplete ?? 0));
    }, [open, scheduleTask.percentComplete]);

    const handleOpenChange = (next: boolean) => {
        if (!next && !loading) onClose();
    };

    const parsed = Number(percent);
    const isValid = Number.isFinite(parsed) && parsed >= 0 && parsed <= 100;

    const handleSubmit = () => {
        if (!isValid) return;
        onFilterChange({_id: scheduleTask._id, percentComplete: parsed});
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-md" onClick={(e) => e.stopPropagation()}>
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
                    <Label>{resolveLanguageKey("percentCompleteLabel")}</Label>
                    <Input
                        type="number"
                        min={0}
                        max={100}
                        value={percent}
                        onChange={(e) => setPercent(e.target.value)}
                        placeholder={resolveLanguageKey("percentCompletePlaceholder")}
                        disabled={loading}
                    />
                </div>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={loading}>
                        {resolveLanguageKey("cancel")}
                    </Button>
                    <Button type="button" onClick={handleSubmit} disabled={loading || !isValid}>
                        {loading ? <LoaderCircle className="animate-spin h-4 w-4" /> : <Gauge className="h-4 w-4" />}
                        {resolveLanguageKey("submit")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/components/custom/scheduleTasks/updateProgressScheduleTaskDialog.tsx"),
    withAxios(
        {
            method: "POST",
            url:    "/api/realEstate/scheduleTask/updateProgress",
            data:   {},
        },
        true,
    ),
    withDebug(true, true),
)(UpdateProgressScheduleTaskDialog);
