import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {compose} from "redux";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useImperativeHandle} from "react";
import {SingleForm} from "armonia/src/modules/core/types/shared.types.ts";
import {LoaderCircle, Send} from "lucide-react";
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
import {Commission} from "armonia/src/modules/propertyManagement/api/realEstate/private/commission/commission.dto.ts";

type RequestApprovalCommissionDialogProps = WithLanguageType & WithAxiosType<Commission, SingleForm> & {
    open: boolean;
    onClose: () => void;
    commission: Commission;
    onSuccess?: (updated?: Commission) => void;
};

function RequestApprovalCommissionDialog({
    commission,
    open,
    onClose,
    resolveLanguageKey,
    innerRef,
    onFilterChange,
    onSuccess = () => {},
    loading,
}: RequestApprovalCommissionDialogProps) {
    useImperativeHandle(innerRef, () => ({
        success: (data: Commission) => {
            onSuccess?.(data);
            onClose();
        },
    }));

    const handleOpenChange = (next: boolean) => {
        if (!next && !loading) onClose();
    };

    return (
        <AlertDialog open={open} onOpenChange={handleOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{resolveLanguageKey("confirmTitle")}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {resolveLanguageKey("confirmDescription")}
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
                            onFilterChange({_id: commission._id});
                        }}
                        disabled={loading}
                    >
                        {loading ? <LoaderCircle className="animate-spin" /> : <Send />}
                        <p>{resolveLanguageKey("confirm")}</p>
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/components/custom/commissions/requestApprovalCommissionDialog.tsx"),
    withAxios(
        {
            method: "post",
            url: "/api/realEstate/commission/requestApproval",
            data: {},
        },
        true,
    ),
    withDebug(true, true, "commissions"),
)(RequestApprovalCommissionDialog);
