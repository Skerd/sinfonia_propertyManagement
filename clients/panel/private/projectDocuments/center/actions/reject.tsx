import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {compose} from "redux";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {DropdownMenuItem} from "@coreModule/components/ui/dropdown-menu.tsx";
import {XCircle} from "lucide-react";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import type {ProjectDocument} from "armonia/src/modules/propertyManagement/api/realEstate/private/projectDocument/projectDocument.dto.ts";

export const REJECT_PROJECT_DOCUMENT_ACTION = "reject";

type RejectProjectDocumentProps = WithLanguageType & {
    onAction: (action: string) => void;
    projectDocument?: ProjectDocument;
};

function RejectProjectDocument({onAction, projectDocument, resolveLanguageKey}: RejectProjectDocumentProps) {
    const {write} = useAccess("projectdocuments");
    const status = projectDocument?.status ?? "draft";
    const canReject = !!write && !projectDocument?.deletedAt && status === "for_review";

    if (!canReject) {
        return null;
    }

    return (
        <DropdownMenuItem onClick={() => {onAction(REJECT_PROJECT_DOCUMENT_ACTION);}}>
            <XCircle className="text-destructive" size={16} />
            <p>{resolveLanguageKey("title")}</p>
        </DropdownMenuItem>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/projectDocuments/center/actions/reject.tsx"),
    withDebug(true, true),
)(RejectProjectDocument);
