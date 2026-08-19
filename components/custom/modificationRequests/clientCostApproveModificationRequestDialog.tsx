import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {compose} from "redux";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useEffect, useImperativeHandle, useState} from "react";
import {LoaderCircle, CheckCircle2, XCircle} from "lucide-react";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "@coreModule/components/ui/alert-dialog.tsx";
import {ModificationRequest} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/modificationRequest/modificationRequest.dto.ts";
import {Textarea} from "@coreModule/components/ui/textarea.tsx";
import {Label} from "@coreModule/components/ui/label.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import {SimpleSelect} from "@coreModule/components/custom/simpleSelect";
import {clientCostApproveModificationRequestFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/modificationRequest/clientCostApproveModificationRequest.form.validator.ts";

type ClientCostApproveModificationRequestDialogProps = WithLanguageType &
    //@ts-ignore //TODO check this too !important
    WithAxiosType<any, ReturnType<typeof clientCostApproveModificationRequestFormSchema>["_type"]> & {
        open: boolean;
        onClose: () => void;
        request: ModificationRequest;
        onSuccess?: (updated?: ModificationRequest) => void;
    };

function ClientCostApproveModificationRequestDialog({
    open,
    onClose,
    request,
    resolveLanguageKey,
    innerRef,
    onPost,
    onSuccess = () => {},
    loading,
}: ClientCostApproveModificationRequestDialogProps) {
    const [decision, setDecision] = useState<"approved" | "rejected">("approved");
    const [notes, setNotes] = useState("");

    useEffect(() => {
        if (!open) return;
        setDecision("approved");
        setNotes("");
    }, [open, request._id]);

    useImperativeHandle(innerRef, () => ({
        success: (data: unknown) => {
            onSuccess?.(data as ModificationRequest);
            onClose();
            setDecision("approved");
            setNotes("");
        },
    }));

    const handleOpenChange = (next: boolean) => {
        if (!next && !loading) onClose();
    };

    const handleSubmit = () => {
        onPost({
            _id: request._id,
            decision,
            notes: notes.trim() || undefined,
        } as any);
    };

    const financeDetails = (request as any).financeDetails;
    const totalCost = financeDetails?.totalCost;
    const currencySymbol = financeDetails?.currency?.symbol ?? financeDetails?.currency?.code ?? "";

    return (
        <AlertDialog open={open} onOpenChange={handleOpenChange}>
            <AlertDialogContent className="max-w-lg max-h-[85vh] overflow-y-auto overflow-x-hidden">
                <AlertDialogHeader>
                    <AlertDialogTitle>{resolveLanguageKey("title")}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {resolveLanguageKey("description")}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="flex flex-col gap-y-4 py-2">
                    {totalCost != null && (
                        <div className="rounded-md border p-3 bg-muted/40">
                            <p className="text-xs text-muted-foreground mb-1">{resolveLanguageKey("totalCostLabel")}</p>
                            <p className="text-lg font-semibold">
                                {currencySymbol} {Number(totalCost).toLocaleString(undefined, {minimumFractionDigits: 2})}
                            </p>
                        </div>
                    )}
                    <div>
                        <Label className="mb-2 block">{resolveLanguageKey("decisionLabel")}</Label>
                        <SimpleSelect
                            options={[
                                {value: "approved", label: resolveLanguageKey("approve") as string},
                                {value: "rejected", label: resolveLanguageKey("reject") as string},
                            ]}
                            value={decision}
                            onValueChange={(v: string) => setDecision(v as "approved" | "rejected")}
                            placeholder={resolveLanguageKey("decisionPlaceholder") as string}
                            disabled={loading}
                        />
                    </div>
                    <div>
                        <Label htmlFor="clientCostNotes" className="mb-2 block">
                            {resolveLanguageKey("notesLabel")}
                        </Label>
                        <Textarea
                            id="clientCostNotes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder={resolveLanguageKey("notesPlaceholder") as string}
                            disabled={loading}
                            className="min-h-[100px] max-h-[150px] overflow-y-auto resize-none"
                        />
                    </div>
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={loading} onClick={() => { setDecision("approved"); setNotes(""); }}>
                        {resolveLanguageKey("cancel")}
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleSubmit(); }}
                        disabled={loading}
                        className={cn({
                            "hover:bg-success hover:text-success-foreground": decision === "approved",
                            "text-destructive-foreground hover:bg-destructive/90": decision === "rejected",
                        })}
                    >
                        {loading ? <LoaderCircle className="animate-spin" /> : decision === "approved" ? <CheckCircle2 /> : <XCircle />}
                        <p>{resolveLanguageKey("confirmButton")}</p>
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/components/custom/modificationRequests/clientCostApproveModificationRequestDialog.tsx"),
    withAxios(
        {
            method: "post",
            url: "/api/realEstate/unit/modificationRequest/clientCostApprove",
            data: {},
        },
        true,
    ),
    withDebug(true, true, "modificationRequests"),
)(ClientCostApproveModificationRequestDialog);
