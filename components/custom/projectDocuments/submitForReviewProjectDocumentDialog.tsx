import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {compose} from "redux";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useImperativeHandle} from "react";
import {LoaderCircle, Send} from "lucide-react";
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

type SubmitForReviewProjectDocumentPayload = {
    _id: string;
};

type SubmitForReviewProjectDocumentDialogProps = WithLanguageType &
    WithAxiosType<ProjectDocument, SubmitForReviewProjectDocumentPayload> & {
        open: boolean;
        onClose: () => void;
        projectDocument: ProjectDocument;
        onSuccess?: (updated?: ProjectDocument) => void;
    };

function SubmitForReviewProjectDocumentDialog({
    projectDocument,
    open,
    onClose,
    resolveLanguageKey,
    innerRef,
    onFilterChange,
    onSuccess = () => {},
    loading,
}: SubmitForReviewProjectDocumentDialogProps) {
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
                        {loading ? <LoaderCircle className="animate-spin h-4 w-4" /> : <Send className="h-4 w-4" />}
                        {resolveLanguageKey("submit")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/components/custom/projectDocuments/submitForReviewProjectDocumentDialog.tsx"),
    withAxios(
        {
            method: "POST",
            url:    "/api/realEstate/projectDocument/submitForReview",
            data:   {},
        },
        true,
    ),
    withDebug(true, true, "projectdocuments"),
)(SubmitForReviewProjectDocumentDialog);
