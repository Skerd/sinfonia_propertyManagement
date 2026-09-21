import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {compose} from "redux";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useEffect, useImperativeHandle, useState} from "react";
import type {MarkUnavailableForm, MarkUnavailableResponse} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/unit/markUnavailable.form.type.ts";
import {UNIT_LONG_TEXT_MAX} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/unit/unit.schema-def.ts";
import {Unit} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/unit/unit.dto.ts";
import {LoaderCircle, Ban} from "lucide-react";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@coreModule/components/ui/alert-dialog.tsx";
import {Textarea} from "@coreModule/components/ui/textarea.tsx";
import {Label} from "@coreModule/components/ui/label.tsx";
import FormMaxLengthControl from "@coreModule/components/viewEngine/widgets/inputs/formMaxLengthControl.tsx";

type MarkUnavailableUnitDialogProps = WithLanguageType & WithAxiosType<MarkUnavailableResponse, MarkUnavailableForm> & {
    open: boolean;
    onClose: () => void;
    unit: Unit;
    onSuccess?: (updated?: Partial<Unit>) => void;
};

function MarkUnavailableUnitDialog({
    unit,
    open,
    onClose,
    resolveLanguageKey,
    innerRef,
    onFilterChange,
    onSuccess = () => {},
    loading,
}: MarkUnavailableUnitDialogProps) {
    const [unavailableNotes, setUnavailableNotes] = useState("");

    useImperativeHandle(innerRef, () => ({
        success: (data: MarkUnavailableResponse) => {
            onSuccess?.({
                status: data.status,
                unavailableNotes: data.unavailableNotes,
                isAvailable: false,
            });
            setUnavailableNotes("");
            onClose();
        },
    }));

    useEffect(() => {
        if (!open) setUnavailableNotes("");
    }, [open]);

    const handleConfirm = () => {
        onFilterChange({
            _id: unit._id,
            unavailableNotes: unavailableNotes.trim(),
        });
    };

    const handleOpenChange = (next: boolean) => {
        if (!next && !loading) {
            setUnavailableNotes("");
            onClose();
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={handleOpenChange}>
            <AlertDialogContent className="max-w-md">
                <AlertDialogHeader>
                    <AlertDialogTitle>{resolveLanguageKey("confirmTitle")}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {resolveLanguageKey("confirmDescription")}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="py-4">
                    <Label htmlFor="unavailableNotes" className="mb-2">
                        {resolveLanguageKey("unavailableNotesLabel")} *
                    </Label>
                    <FormMaxLengthControl maxLength={UNIT_LONG_TEXT_MAX} value={unavailableNotes}>
                        <Textarea
                            id="unavailableNotes"
                            value={unavailableNotes}
                            onChange={(e) => setUnavailableNotes(e.target.value.slice(0, UNIT_LONG_TEXT_MAX))}
                            placeholder={resolveLanguageKey("unavailableNotesPlaceholder")}
                            disabled={loading}
                            rows={3}
                            maxLength={UNIT_LONG_TEXT_MAX}
                            className="resize-none min-h-[100px]"
                        />
                    </FormMaxLengthControl>
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={loading} onClick={() => setUnavailableNotes("")}>
                        {resolveLanguageKey("cancel")}
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleConfirm();
                        }}
                        disabled={loading || !unavailableNotes.trim()}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        {(loading) ? <LoaderCircle className="animate-spin"/> : <Ban />}
                        <p>{resolveLanguageKey("confirm")}</p>
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/components/custom/units/markUnavailableUnitDialog.tsx"),
    withAxios(
        {
            method: "post",
            url: "/api/realEstate/unit/markUnavailable",
            data: {},
        },
        true,
    ),
    withDebug(true, true, "units"),
)(MarkUnavailableUnitDialog);
