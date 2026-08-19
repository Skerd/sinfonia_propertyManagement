import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {compose} from "redux";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {DropdownMenuItem} from "@coreModule/components/ui/dropdown-menu.tsx";
import {Send} from "lucide-react";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import type {ProjectDocument} from "armonia/src/modules/propertyManagement/api/realEstate/private/projectDocument/projectDocument.dto.ts";

export const SUBMIT_FOR_REVIEW_PROJECT_DOCUMENT_ACTION = "submitForReview";

type SubmitForReviewProjectDocumentProps = WithLanguageType & {
    onAction: (action: string) => void;
    projectDocument?: ProjectDocument;
};

function SubmitForReviewProjectDocument({onAction, projectDocument, resolveLanguageKey}: SubmitForReviewProjectDocumentProps) {
    const {write} = useAccess("projectdocuments");
    const status = projectDocument?.status ?? "draft";
    const canSubmit = !!write && !projectDocument?.deletedAt && (status === "draft" || status === "rejected");

    if (!canSubmit) {
        return null;
    }

    return (
        <DropdownMenuItem onClick={() => {onAction(SUBMIT_FOR_REVIEW_PROJECT_DOCUMENT_ACTION);}}>
            <Send className="text-primary" size={16} />
            <p>{resolveLanguageKey("title")}</p>
        </DropdownMenuItem>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/projectDocuments/center/actions/submitForReview.tsx"),
    withDebug(true, true, "projectdocuments"),
)(SubmitForReviewProjectDocument);
