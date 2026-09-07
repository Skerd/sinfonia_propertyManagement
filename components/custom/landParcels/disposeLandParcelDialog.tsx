import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {compose} from "redux";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useImperativeHandle} from "react";
import {Archive} from "lucide-react";
import StatusChangeDialog, {StatusChangeValues} from "@propertyManagementModule/components/custom/development/statusChangeDialog.tsx";
import type {LandParcel} from "armonia/src/modules/propertyManagement/api/realEstate/private/landParcel/landParcel.dto.ts";

type Props = WithLanguageType &
    WithAxiosType<LandParcel, any> & {
        open: boolean;
        onClose: () => void;
        landParcel: LandParcel;
        onSuccess?: (updated?: LandParcel) => void;
    };

function DisposeLandParcelDialog({
    landParcel,
    open,
    onClose,
    resolveLanguageKey,
    innerRef,
    onFilterChange,
    onSuccess = () => {},
    loading,
}: Props) {
    useImperativeHandle(innerRef, () => ({
        success: (data?: LandParcel) => {
            onClose();
            onSuccess?.(data);
        },
    }));

    const handleSubmit = (values: StatusChangeValues) => {
        onFilterChange({_id: landParcel._id, disposeNotes: values.notes});
    };

    const title = landParcel.title
        ? `${resolveLanguageKey("dialogTitle")} — ${landParcel.title}`
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
            submitIcon={<Archive className="h-4 w-4" />}
            showNotes
            notesLabel={resolveLanguageKey("notesLabel") as string}
            notesPlaceholder={resolveLanguageKey("notesPlaceholder") as string}
        />
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/components/custom/landParcels/disposeLandParcelDialog.tsx"),
    withAxios(
        {
            method: "POST",
            url: "/api/realEstate/landParcel/dispose",
            data: {},
        },
        true,
    ),
    withDebug(true, true, "landparcels"),
)(DisposeLandParcelDialog);
