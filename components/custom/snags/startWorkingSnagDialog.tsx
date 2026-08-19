import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {compose} from "redux";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useImperativeHandle} from "react";
import {LoaderCircle, Play} from "lucide-react";
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
import type {Snag} from "armonia/src/modules/propertyManagement/api/realEstate/private/snag/snag.dto.ts";

type StartWorkingSnagPayload = {
    _id: string;
};

type StartWorkingSnagDialogProps = WithLanguageType &
    WithAxiosType<Snag, StartWorkingSnagPayload> & {
        open: boolean;
        onClose: () => void;
        snag: Snag;
        onSuccess?: (updated?: Snag) => void;
    };

function StartWorkingSnagDialog({
    snag,
    open,
    onClose,
    resolveLanguageKey,
    innerRef,
    onFilterChange,
    onSuccess = () => {},
    loading,
}: StartWorkingSnagDialogProps) {
    useImperativeHandle(innerRef, () => ({
        success: (data?: Snag) => {
            onClose();
            onSuccess?.(data);
        },
    }));

    const handleOpenChange = (next: boolean) => {
        if (!next && !loading) onClose();
    };

    const handleSubmit = () => {
        onFilterChange({_id: snag._id});
    };

    const assigneeName = [snag.assignedTo?.name, snag.assignedTo?.surname]
        .filter(Boolean)
        .join(" ")
        || resolveLanguageKey("unknownAssignee");

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-md" onClick={(e) => e.stopPropagation()}>
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
                <div className="flex flex-col gap-y-2 py-2">
                    <Label>{resolveLanguageKey("assignedToLabel")}</Label>
                    <p className="text-sm font-medium">{assigneeName}</p>
                </div>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={loading}>
                        {resolveLanguageKey("cancel")}
                    </Button>
                    <Button type="button" onClick={handleSubmit} disabled={loading}>
                        {loading ? <LoaderCircle className="animate-spin h-4 w-4" /> : <Play className="h-4 w-4" />}
                        {resolveLanguageKey("submit")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/components/custom/snags/startWorkingSnagDialog.tsx"),
    withAxios(
        {
            method: "POST",
            url:    "/api/realEstate/snag/startWorking",
            data:   {},
        },
        true,
    ),
    withDebug(true, true, "snags"),
)(StartWorkingSnagDialog);
