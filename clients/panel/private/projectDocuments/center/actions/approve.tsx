import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {compose} from "redux";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {DropdownMenuItem} from "@coreModule/components/ui/dropdown-menu.tsx";
import {CheckCircle2} from "lucide-react";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import type {ProjectDocument} from "armonia/src/modules/propertyManagement/api/realEstate/private/projectDocument/projectDocument.dto.ts";

export const APPROVE_PROJECT_DOCUMENT_ACTION = "approve";

type ApproveProjectDocumentProps = WithLanguageType & {
    onAction: (action: string) => void;
    projectDocument?: ProjectDocument;
};

function ApproveProjectDocument({onAction, projectDocument, resolveLanguageKey}: ApproveProjectDocumentProps) {
    const {write} = useAccess("projectdocuments");
    const status = projectDocument?.status ?? "draft";
    const canApprove = !!write && !projectDocument?.deletedAt && status === "for_review";

    if (!canApprove) {
        return null;
    }

    return (
        <DropdownMenuItem onClick={() => {onAction(APPROVE_PROJECT_DOCUMENT_ACTION);}}>
            <CheckCircle2 className="text-primary" size={16} />
            <p>{resolveLanguageKey("title")}</p>
        </DropdownMenuItem>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/projectDocuments/center/actions/approve.tsx"),
    withDebug(true, true),
)(ApproveProjectDocument);
