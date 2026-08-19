import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {compose} from "redux";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {DropdownMenuItem} from "@coreModule/components/ui/dropdown-menu.tsx";
import {BadgeCheck} from "lucide-react";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import type {ProjectDocument} from "armonia/src/modules/propertyManagement/api/realEstate/private/projectDocument/projectDocument.dto.ts";

export const MARK_AS_BUILT_PROJECT_DOCUMENT_ACTION = "markAsBuilt";

type MarkAsBuiltProjectDocumentProps = WithLanguageType & {
    onAction: (action: string) => void;
    projectDocument?: ProjectDocument;
};

function MarkAsBuiltProjectDocument({onAction, projectDocument, resolveLanguageKey}: MarkAsBuiltProjectDocumentProps) {
    const {write} = useAccess("projectdocuments");
    const status = projectDocument?.status ?? "draft";
    const canMarkAsBuilt = !!write && !projectDocument?.deletedAt && status === "approved" && !projectDocument?.isAsBuilt;

    if (!canMarkAsBuilt) {
        return null;
    }

    return (
        <DropdownMenuItem onClick={() => {onAction(MARK_AS_BUILT_PROJECT_DOCUMENT_ACTION);}}>
            <BadgeCheck className="text-primary" size={16} />
            <p>{resolveLanguageKey("title")}</p>
        </DropdownMenuItem>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/projectDocuments/center/actions/markAsBuilt.tsx"),
    withDebug(true, true, "projectdocuments"),
)(MarkAsBuiltProjectDocument);
