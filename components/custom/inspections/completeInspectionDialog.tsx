import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {compose} from "redux";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useImperativeHandle} from "react";
import {SingleForm} from "armonia/src/modules/core/types/shared.types.ts";
import {IconCircleCheck, IconLoader2} from "@tabler/icons-react";
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
import {Inspection} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/inspection/inspection.dto.ts";

type CompleteInspectionDialogProps = WithLanguageType & WithAxiosType<Inspection, SingleForm> & {
    open: boolean;
    onClose: () => void;
    inspection: Inspection;
    onSuccess?: (updatedInspection?: Inspection) => void;
};

function CompleteInspectionDialog({
    inspection,
    open,
    onClose,
    resolveLanguageKey,
    innerRef,
    onFilterChange,
    onSuccess = () => {},
    loading,
}: CompleteInspectionDialogProps) {
    useImperativeHandle(innerRef, () => ({
        success: (data?: Inspection) => {
            onSuccess?.(data);
            onClose();
        },
    }));

    // The server refuses an unfinished checklist too; saying so here saves a round trip that can only fail.
    const checklistOpen = inspection.checklistComplete === false;
    const handleOpenChange = (next: boolean) => {
        if (!next && !loading) onClose();
    };

    return (
        <AlertDialog open={open} onOpenChange={handleOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{resolveLanguageKey("confirmTitle")}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {resolveLanguageKey(checklistOpen ? "checklistOpenDescription" : "confirmDescription")}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={loading}>
                        {resolveLanguageKey("cancel")}
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onFilterChange({_id: inspection._id});
                        }}
                        disabled={loading || checklistOpen}
                    >
                        {loading ? <IconLoader2 className="animate-spin" /> : <IconCircleCheck />}
                        <p>{resolveLanguageKey("confirm")}</p>
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/components/custom/inspections/completeInspectionDialog.tsx"),
    withAxios(
        {
            method: "post",
            url: "/api/realEstate/unit/inspection/complete",
            data: {},
        },
        true,
    ),
    withDebug(true, true, "inspections"),
)(CompleteInspectionDialog);
