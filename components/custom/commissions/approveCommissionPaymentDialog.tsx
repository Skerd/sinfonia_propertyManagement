import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {compose} from "redux";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useEffect, useImperativeHandle, useState} from "react";
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
import FormMaxLengthControl from "@coreModule/components/viewEngine/widgets/inputs/formMaxLengthControl.tsx";
import {SimpleSelect} from "@coreModule/components/viewEngine/widgets/inputs/simpleSelect.tsx";
import {Commission} from "armonia/src/modules/propertyManagement/api/realEstate/private/commission/commission.dto.ts";
import type {
    ApproveCommissionPaymentDecision,
    ApproveCommissionPaymentForm,
} from "armonia/src/modules/propertyManagement/api/realEstate/private/commission/approveCommissionPayment.form.type.ts";
import {COMMISSION_LONG_TEXT_MAX} from "armonia/src/modules/propertyManagement/api/realEstate/private/commission/commission.schema-def.ts";

type ApproveCommissionPaymentDialogProps = WithLanguageType &
    WithAxiosType<Commission, ApproveCommissionPaymentForm> & {
        open: boolean;
        onClose: () => void;
        commission: Commission;
        onSuccess?: (updated?: Commission) => void;
    };

function ApproveCommissionPaymentDialog({
    commission,
    open,
    onClose,
    resolveLanguageKey,
    innerRef,
    onFilterChange,
    onSuccess = () => {},
    loading,
}: ApproveCommissionPaymentDialogProps) {
    const [decision, setDecision] = useState<ApproveCommissionPaymentDecision>("approved");
    const [notes, setNotes] = useState("");

    useImperativeHandle(innerRef, () => ({
        success: (data: Commission) => {
            setDecision("approved");
            setNotes("");
            onSuccess?.(data);
            onClose();
        },
    }));

    useEffect(() => {
        if (open) {
            setDecision("approved");
            setNotes("");
        }
    }, [open]);

    const handleOpenChange = (next: boolean) => {
        if (!next && !loading) {
            setDecision("approved");
            setNotes("");
            onClose();
        }
    };

    const handleSubmit = () => {
        onFilterChange({
            _id: commission._id,
            decision,
            notes: notes.trim() || undefined,
        });
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-md" onClick={(e) => e.stopPropagation()}>
                <DialogHeader>
                    <DialogTitle>{resolveLanguageKey("dialogTitle")}</DialogTitle>
                    <DialogDescription>
                        {decision === "rejected"
                            ? resolveLanguageKey("rejectDescription")
                            : resolveLanguageKey("approveDescription")}
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-y-4 py-2">
                    <div className="flex flex-col gap-y-2">
                        <Label>{resolveLanguageKey("decisionLabel")}</Label>
                        <SimpleSelect
                            options={[
                                {value: "approved", label: resolveLanguageKey("decisionApproved")},
                                {value: "rejected", label: resolveLanguageKey("decisionRejected")},
                            ]}
                            value={decision}
                            onValueChange={(value: string | string[]) => {
                                const next = Array.isArray(value) ? value[0] : value;
                                if (next === "approved" || next === "rejected") setDecision(next);
                            }}
                            placeholder={resolveLanguageKey("decisionPlaceholder")}
                            disabled={loading}
                        />
                    </div>
                    <div className="flex flex-col gap-y-2">
                        <Label htmlFor="commissionApprovalNotes">{resolveLanguageKey("notesLabel")}</Label>
                        <FormMaxLengthControl maxLength={COMMISSION_LONG_TEXT_MAX} value={notes}>
                            <Textarea
                                id="commissionApprovalNotes"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value.slice(0, COMMISSION_LONG_TEXT_MAX))}
                                placeholder={resolveLanguageKey("notesPlaceholder")}
                                disabled={loading}
                                rows={4}
                                maxLength={COMMISSION_LONG_TEXT_MAX}
                                className="field-sizing-fixed resize-none min-h-[100px] max-h-[250px] overflow-y-auto"
                            />
                        </FormMaxLengthControl>
                    </div>
                </div>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={loading}>
                        {resolveLanguageKey("cancel")}
                    </Button>
                    <Button type="button" onClick={handleSubmit} disabled={loading}>
                        {loading ? <LoaderCircle className="animate-spin h-4 w-4" /> : <Scale className="h-4 w-4" />}
                        {decision === "rejected" ? resolveLanguageKey("submitReject") : resolveLanguageKey("submitApprove")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/components/custom/commissions/approveCommissionPaymentDialog.tsx"),
    withAxios(
        {
            method: "post",
            url: "/api/realEstate/commission/approvePayment",
            data: {},
        },
        true,
    ),
    withDebug(true, true, "commissions"),
)(ApproveCommissionPaymentDialog);
