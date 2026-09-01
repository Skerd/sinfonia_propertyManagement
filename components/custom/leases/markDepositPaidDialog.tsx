import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {compose} from "redux";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useImperativeHandle} from "react";
import {CircleCheck, LoaderCircle} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@coreModule/components/ui/dialog.tsx";
import {Button} from "@coreModule/components/ui/button.tsx";
import type {SingleForm} from "armonia/src/modules/core/types/shared.types.ts";
import type {Lease} from "armonia/src/modules/propertyManagement/api/realEstate/private/lease/lease.dto.ts";

type MarkDepositPaidDialogProps = WithLanguageType &
    WithAxiosType<Lease, SingleForm> & {
        open: boolean;
        onClose: () => void;
        lease: Lease;
        onSuccess?: (updated?: Lease) => void;
    };

function MarkDepositPaidDialog({
    lease,
    open,
    onClose,
    resolveLanguageKey,
    innerRef,
    onFilterChange,
    onSuccess = () => {},
    loading,
}: MarkDepositPaidDialogProps) {
    useImperativeHandle(innerRef, () => ({
        success: (data?: Lease) => {
            onClose();
            onSuccess?.(data);
        },
    }));

    const handleOpenChange = (next: boolean) => {
        if (!next && !loading) onClose();
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
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={loading}>
                        {resolveLanguageKey("cancel")}
                    </Button>
                    <Button type="button" onClick={() => onFilterChange({_id: lease._id})} disabled={loading}>
                        {loading ? <LoaderCircle className="animate-spin h-4 w-4" /> : <CircleCheck className="h-4 w-4" />}
                        {resolveLanguageKey("submit")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/components/custom/leases/markDepositPaidDialog.tsx"),
    withAxios(
        {
            method: "POST",
            url:    "/api/realEstate/lease/markDepositPaid",
            data:   {},
        },
        true,
    ),
    withDebug(true, true, "leases"),
)(MarkDepositPaidDialog);
