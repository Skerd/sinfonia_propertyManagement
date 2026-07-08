import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {compose} from "redux";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useImperativeHandle, useMemo} from "react";
import {LoaderCircle, RotateCcw} from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@coreModule/components/ui/alert-dialog.tsx";
import {ModificationRequest} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/modificationRequest/modificationRequest.dto.ts";
import {SubmitRevisionModificationRequestForm} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/modificationRequest/submitRevisionModificationRequest.form.type.ts";

type SubmitRevisionModificationRequestDialogProps = WithLanguageType &
    WithAxiosType<any, SubmitRevisionModificationRequestForm> & {
        open: boolean;
        onClose: () => void;
        request: ModificationRequest;
        onSuccess?: (updated?: ModificationRequest) => void;
    };

function SubmitRevisionModificationRequestDialog({
    open,
    onClose,
    request,
    resolveLanguageKey,
    innerRef,
    onFilterChange,
    onSuccess = () => {},
    loading,
}: SubmitRevisionModificationRequestDialogProps) {
    const targetStage = useMemo<"architect" | "engineer" | null>(() => {
        if (request.status === "pending_architect_revision") return "architect";
        if (request.status === "pending_engineer_revision") return "engineer";
        return null;
    }, [request.status]);

    useImperativeHandle(innerRef, () => ({
        success: (data: SubmitRevisionModificationRequestForm) => {
            onSuccess?.(data as unknown as ModificationRequest);
            onClose();
        },
    }));

    const handleOpenChange = (next: boolean) => {
        if (!next && !loading) onClose();
    };

    if (!targetStage) return null;

    return (
        <AlertDialog open={open} onOpenChange={handleOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{resolveLanguageKey("submitRevisionConfirmTitle")}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {resolveLanguageKey("submitRevisionConfirmDescription").replace(
                            "{stage}",
                            resolveLanguageKey(targetStage === "architect" ? "architectStage" : "engineerStage"),
                        )}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={loading}>{resolveLanguageKey("cancel")}</AlertDialogCancel>
                    <AlertDialogAction
                        disabled={loading}
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onFilterChange({_id: request._id, targetStage});
                        }}
                    >
                        {loading ? <LoaderCircle className="animate-spin"/> : <RotateCcw size={16}/>}
                        {resolveLanguageKey("submitRevisionConfirmButton")}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/components/custom/modificationRequests/submitRevisionModificationRequestDialog.tsx"),
    withAxios(
        {
            method: "post",
            url: "/api/realEstate/unit/modificationRequest/submitRevision",
            data: {},
        },
        true,
    ),
    withDebug(true, true),
)(SubmitRevisionModificationRequestDialog);
