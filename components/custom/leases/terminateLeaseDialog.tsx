import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {compose} from "redux";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useImperativeHandle, useState} from "react";
import {Ban, LoaderCircle} from "lucide-react";
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
import type {Lease} from "armonia/src/modules/propertyManagement/api/realEstate/private/lease/lease.dto.ts";

type TerminateLeasePayload = {
    _id: string;
    terminationReason?: string;
};

type TerminateLeaseDialogProps = WithLanguageType &
    WithAxiosType<Lease, TerminateLeasePayload> & {
        open: boolean;
        onClose: () => void;
        lease: Lease;
        onSuccess?: (updated?: Lease) => void;
    };

function TerminateLeaseDialog({
    lease,
    open,
    onClose,
    resolveLanguageKey,
    innerRef,
    onFilterChange,
    onSuccess = () => {},
    loading,
}: TerminateLeaseDialogProps) {
    const [reason, setReason] = useState("");

    useImperativeHandle(innerRef, () => ({
        success: (data?: Lease) => {
            onClose();
            onSuccess?.(data);
        },
    }));

    const handleOpenChange = (next: boolean) => {
        if (!next && !loading) onClose();
    };

    const handleSubmit = () => {
        onFilterChange({
            _id: lease._id,
            terminationReason: reason.trim() || undefined,
        });
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-md" onClick={(e) => e.stopPropagation()}>
                <DialogHeader>
                    <DialogTitle>
                        {lease.name
                            ? `${resolveLanguageKey("dialogTitle")} — ${lease.name}`
                            : resolveLanguageKey("dialogTitle")}
                    </DialogTitle>
                    <DialogDescription>
                        {resolveLanguageKey("dialogDescription")}
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-2 py-2">
                    <Label htmlFor="terminationReason">{resolveLanguageKey("reasonLabel")}</Label>
                    <Textarea
                        id="terminationReason"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder={resolveLanguageKey("reasonPlaceholder")}
                        disabled={loading}
                    />
                </div>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={loading}>
                        {resolveLanguageKey("cancel")}
                    </Button>
                    <Button type="button" variant="destructive" onClick={handleSubmit} disabled={loading}>
                        {loading ? <LoaderCircle className="animate-spin h-4 w-4" /> : <Ban className="h-4 w-4" />}
                        {resolveLanguageKey("submit")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/components/custom/leases/terminateLeaseDialog.tsx"),
    withAxios(
        {
            method: "POST",
            url:    "/api/realEstate/lease/terminate",
            data:   {},
        },
        true,
    ),
    withDebug(true, true),
)(TerminateLeaseDialog);
