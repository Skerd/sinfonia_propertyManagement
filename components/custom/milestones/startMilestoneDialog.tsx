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
import type {Milestone} from "armonia/src/modules/propertyManagement/api/realEstate/private/milestone/milestone.dto.ts";

type StartMilestonePayload = {
    _id: string;
};

type StartMilestoneDialogProps = WithLanguageType &
    WithAxiosType<Milestone, StartMilestonePayload> & {
        open: boolean;
        onClose: () => void;
        milestone: Milestone;
        onSuccess?: (updated?: Milestone) => void;
    };

function StartMilestoneDialog({
    milestone,
    open,
    onClose,
    resolveLanguageKey,
    innerRef,
    onFilterChange,
    onSuccess = () => {},
    loading,
}: StartMilestoneDialogProps) {
    useImperativeHandle(innerRef, () => ({
        success: (data?: Milestone) => {
            onClose();
            onSuccess?.(data);
        },
    }));

    const handleOpenChange = (next: boolean) => {
        if (!next && !loading) onClose();
    };

    const handleSubmit = () => {
        onFilterChange({_id: milestone._id});
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-md" onClick={(e) => e.stopPropagation()}>
                <DialogHeader>
                    <DialogTitle>
                        {milestone.title
                            ? `${resolveLanguageKey("dialogTitle")} — ${milestone.title}`
                            : resolveLanguageKey("dialogTitle")}
                    </DialogTitle>
                    <DialogDescription>
                        {resolveLanguageKey("dialogDescription")}
                    </DialogDescription>
                </DialogHeader>
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
    withLanguage("src/modules/propertyManagement/components/custom/milestones/startMilestoneDialog.tsx"),
    withAxios(
        {
            method: "POST",
            url:    "/api/realEstate/milestone/start",
            data:   {},
        },
        true,
    ),
    withDebug(true, true),
)(StartMilestoneDialog);
