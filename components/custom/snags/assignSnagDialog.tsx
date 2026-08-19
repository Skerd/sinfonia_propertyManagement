import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {compose} from "redux";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useEffect, useImperativeHandle, useState} from "react";
import {LoaderCircle, UserPlus} from "lucide-react";
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
import {ApiSelect} from "@coreModule/components/custom/apiSelect";
import type {Snag} from "armonia/src/modules/propertyManagement/api/realEstate/private/snag/snag.dto.ts";

type AssignSnagPayload = {
    _id: string;
    assignedTo: string;
};

type AssignSnagDialogProps = WithLanguageType &
    WithAxiosType<Snag, AssignSnagPayload> & {
        open: boolean;
        onClose: () => void;
        snag: Snag;
        onSuccess?: (updated?: Snag) => void;
    };

function AssignSnagDialog({
    snag,
    open,
    onClose,
    resolveLanguageKey,
    innerRef,
    onFilterChange,
    onSuccess = () => {},
    loading,
}: AssignSnagDialogProps) {
    const [assignedTo, setAssignedTo] = useState<string | undefined>(snag.assignedTo?._id);
    const [forceReload, setForceReload] = useState(0);

    useImperativeHandle(innerRef, () => ({
        success: (data?: Snag) => {
            setAssignedTo(undefined);
            onClose();
            onSuccess?.(data);
        },
    }));

    useEffect(() => {
        if (open) {
            setAssignedTo(snag.assignedTo?._id);
            setForceReload((prev) => prev + 1);
        } else {
            setAssignedTo(undefined);
        }
    }, [open, snag.assignedTo?._id]);

    const handleOpenChange = (next: boolean) => {
        if (!next && !loading) {
            setAssignedTo(undefined);
            onClose();
        }
    };

    const handleSubmit = () => {
        if (!assignedTo) return;
        onFilterChange({
            _id: snag._id,
            assignedTo,
        });
    };

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
                <div className="flex flex-col gap-y-4 py-2">
                    <div className="flex flex-col gap-y-2">
                        <Label>{resolveLanguageKey("assignedToLabel")}</Label>
                        <ApiSelect
                            apiUrl="/api/company/users/select"
                            postBody={{administration: true}}
                            value={assignedTo}
                            onValueChange={(value: string | string[]) =>
                                setAssignedTo(Array.isArray(value) ? value[0] : value || undefined)
                            }
                            placeholder={resolveLanguageKey("assignedToPlaceholder")}
                            disabled={loading}
                            pageSize={50}
                            forceLoad={forceReload}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={loading}>
                        {resolveLanguageKey("cancel")}
                    </Button>
                    <Button type="button" onClick={handleSubmit} disabled={loading || !assignedTo}>
                        {loading ? <LoaderCircle className="animate-spin h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                        {resolveLanguageKey("submit")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/components/custom/snags/assignSnagDialog.tsx"),
    withAxios(
        {
            method: "POST",
            url:    "/api/realEstate/snag/assign",
            data:   {},
        },
        true,
    ),
    withDebug(true, true, "snags"),
)(AssignSnagDialog);
