import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {compose} from "redux";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useImperativeHandle} from "react";
import type {ActionMessage, SingleForm} from "armonia/src/modules/core/types/shared.types.ts";
import {LoaderCircle, CircleCheck} from "lucide-react";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@coreModule/components/ui/alert-dialog.tsx";
import {Unit} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/unit/unit.dto.ts";
import {UnitStatus} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/unit/unit.constants.ts";

type MarkAvailableUnitDialogProps = WithLanguageType & WithAxiosType<ActionMessage, SingleForm> & {
    open: boolean;
    onClose: () => void;
    unit: Unit;
    onSuccess?: (updated?: Partial<Unit>) => void;
};

function MarkAvailableUnitDialog({
    unit,
    open,
    onClose,
    resolveLanguageKey,
    innerRef,
    onFilterChange,
    onSuccess = () => {},
    loading,
}: MarkAvailableUnitDialogProps) {
    useImperativeHandle(innerRef, () => ({
        success: () => {
            onSuccess?.({
                status: UnitStatus.AVAILABLE,
                isAvailable: true,
                unavailableNotes: undefined,
            });
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
                            onFilterChange({_id: unit._id});
                        }}
                        disabled={loading}
                    >
                        {(loading) ? <LoaderCircle className="animate-spin"/> : <CircleCheck />}
                        <p>{resolveLanguageKey("confirm")}</p>
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/components/custom/units/markAvailableUnitDialog.tsx"),
    withAxios(
        {
            method: "post",
            url: "/api/realEstate/unit/markAvailable",
            data: {},
        },
        true,
    ),
    withDebug(true, true, "units"),
)(MarkAvailableUnitDialog);
