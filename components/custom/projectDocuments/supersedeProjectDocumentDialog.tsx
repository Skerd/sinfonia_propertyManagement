import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {compose} from "redux";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useImperativeHandle} from "react";
import {Replace} from "lucide-react";
import StatusChangeDialog, {StatusChangeValues} from "@propertyManagementModule/components/custom/development/statusChangeDialog.tsx";
import type {ProjectDocument} from "armonia/src/modules/propertyManagement/api/realEstate/private/projectDocument/projectDocument.dto.ts";

type SupersedePayload = {
    _id: string;
    notes?: string;
};

type Props = WithLanguageType &
    WithAxiosType<ProjectDocument, SupersedePayload> & {
        open: boolean;
        onClose: () => void;
        projectDocument: ProjectDocument;
        onSuccess?: (updated?: ProjectDocument) => void;
    };

function SupersedeProjectDocumentDialog({
    projectDocument,
    open,
    onClose,
    resolveLanguageKey,
    innerRef,
    onFilterChange,
    onSuccess = () => {},
    loading,
}: Props) {
    useImperativeHandle(innerRef, () => ({
        success: (data?: ProjectDocument) => {
            onClose();
            onSuccess?.(data);
        },
    }));

    const handleSubmit = (values: StatusChangeValues) => {
        onFilterChange({_id: projectDocument._id, notes: values.notes});
    };

    const baseTitle = resolveLanguageKey("dialogTitle") as string;

    return (
        <StatusChangeDialog
            open={open}
            loading={loading}
            onClose={onClose}
            onSubmit={handleSubmit}
            title={projectDocument.title ? `${baseTitle} — ${projectDocument.title}` : baseTitle}
            description={resolveLanguageKey("dialogDescription") as string}
            submitLabel={resolveLanguageKey("submit") as string}
            cancelLabel={resolveLanguageKey("cancel") as string}
            submitIcon={<Replace className="h-4 w-4" />}
            showNotes
            notesLabel={resolveLanguageKey("notesLabel") as string}
            notesPlaceholder={resolveLanguageKey("notesPlaceholder") as string}
        />
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/components/custom/projectDocuments/supersedeProjectDocumentDialog.tsx"),
    withAxios(
        {
            method: "POST",
            url:    "/api/realEstate/projectDocument/supersede",
            data:   {},
        },
        true,
    ),
    withDebug(true, true, "projectdocuments"),
)(SupersedeProjectDocumentDialog);
