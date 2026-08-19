import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {compose} from "redux";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useImperativeHandle} from "react";
import {BadgeCheck, LoaderCircle} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@coreModule/components/ui/dialog.tsx";
import {Button} from "@coreModule/components/ui/button.tsx";
import type {ProjectDocument} from "armonia/src/modules/propertyManagement/api/realEstate/private/projectDocument/projectDocument.dto.ts";

type MarkAsBuiltProjectDocumentPayload = {
    _id: string;
};

type MarkAsBuiltProjectDocumentDialogProps = WithLanguageType &
    WithAxiosType<ProjectDocument, MarkAsBuiltProjectDocumentPayload> & {
        open: boolean;
        onClose: () => void;
        projectDocument: ProjectDocument;
        onSuccess?: (updated?: ProjectDocument) => void;
    };

function MarkAsBuiltProjectDocumentDialog({
    projectDocument,
    open,
    onClose,
    resolveLanguageKey,
    innerRef,
    onFilterChange,
    onSuccess = () => {},
    loading,
}: MarkAsBuiltProjectDocumentDialogProps) {
    useImperativeHandle(innerRef, () => ({
        success: (data?: ProjectDocument) => {
            onClose();
            onSuccess?.(data);
        },
    }));

    const handleOpenChange = (next: boolean) => {
        if (!next && !loading) onClose();
    };

    const handleSubmit = () => {
        onFilterChange({_id: projectDocument._id});
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-md" onClick={(e) => e.stopPropagation()}>
                <DialogHeader>
                    <DialogTitle>
                        {projectDocument.title
                            ? `${resolveLanguageKey("dialogTitle")} — ${projectDocument.title}`
                            : resolveLanguageKey("dialogTitle")}
                    </DialogTitle>
                    <DialogDescription>
                        {resolveLanguageKey("dialogDescription")}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={loading}>
                        {resolveLanguageKey("cancel")}
                    </Button>
                    <Button type="button" onClick={handleSubmit} disabled={loading}>
                        {loading ? <LoaderCircle className="animate-spin h-4 w-4" /> : <BadgeCheck className="h-4 w-4" />}
                        {resolveLanguageKey("submit")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/components/custom/projectDocuments/markAsBuiltProjectDocumentDialog.tsx"),
    withAxios(
        {
            method: "POST",
            url:    "/api/realEstate/projectDocument/markAsBuilt",
            data:   {},
        },
        true,
    ),
    withDebug(true, true, "projectdocuments"),
)(MarkAsBuiltProjectDocumentDialog);
