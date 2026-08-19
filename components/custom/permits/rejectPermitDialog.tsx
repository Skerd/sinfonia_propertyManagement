import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {compose} from "redux";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useImperativeHandle} from "react";
import {X} from "lucide-react";
import StatusChangeDialog, {StatusChangeValues} from "@propertyManagementModule/components/custom/development/statusChangeDialog.tsx";
import type {Permit} from "armonia/src/modules/propertyManagement/api/realEstate/private/permit/permit.dto.ts";

type Props = WithLanguageType &
    WithAxiosType<Permit, any> & {
        open: boolean;
        onClose: () => void;
        permit: Permit;
        onSuccess?: (updated?: Permit) => void;
    };

function RejectPermitDialog({
    permit,
    open,
    onClose,
    resolveLanguageKey,
    innerRef,
    onFilterChange,
    onSuccess = () => {},
    loading,
}: Props) {
    useImperativeHandle(innerRef, () => ({
        success: (data?: Permit) => {
            onClose();
            onSuccess?.(data);
        },
    }));

    const handleSubmit = (values: StatusChangeValues) => {
        onFilterChange({_id: permit._id, notes: values.notes});
    };

    const title = permit.title
        ? `${resolveLanguageKey("dialogTitle")} — ${permit.title}`
        : (resolveLanguageKey("dialogTitle") as string);

    return (
        <StatusChangeDialog
            open={open}
            loading={loading}
            onClose={onClose}
            onSubmit={handleSubmit}
            title={title as string}
            description={resolveLanguageKey("dialogDescription") as string}
            submitLabel={resolveLanguageKey("submit") as string}
            cancelLabel={resolveLanguageKey("cancel") as string}
            submitIcon={<X className="h-4 w-4" />}
            showNotes
            notesLabel={resolveLanguageKey("notesLabel") as string}
            notesPlaceholder={resolveLanguageKey("notesPlaceholder") as string}
        />
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/components/custom/permits/rejectPermitDialog.tsx"),
    withAxios(
        {
            method: "POST",
            url: "/api/realEstate/permit/reject",
            data: {},
        },
        true,
    ),
    withDebug(true, true, "permits"),
)(RejectPermitDialog);
