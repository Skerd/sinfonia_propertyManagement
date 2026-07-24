import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {compose} from "redux";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {DropdownMenuItem} from "@coreModule/components/ui/dropdown-menu.tsx";
import {History} from "lucide-react";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import type {ProjectDocument} from "armonia/src/modules/propertyManagement/api/realEstate/private/projectDocument/projectDocument.dto.ts";

export const SUPERSEDE_PROJECT_DOCUMENT_ACTION = "supersede";

type SupersedeProjectDocumentProps = WithLanguageType & {
    onAction: (action: string) => void;
    projectDocument?: ProjectDocument;
};

function SupersedeProjectDocument({onAction, projectDocument, resolveLanguageKey}: SupersedeProjectDocumentProps) {
    const {write} = useAccess("projectdocuments");
    const status = projectDocument?.status ?? "draft";
    const canSupersede = !!write && !projectDocument?.deletedAt && status === "approved";

    if (!canSupersede) {
        return null;
    }

    return (
        <DropdownMenuItem onClick={() => {onAction(SUPERSEDE_PROJECT_DOCUMENT_ACTION);}}>
            <History className="text-primary" size={16} />
            <p>{resolveLanguageKey("title")}</p>
        </DropdownMenuItem>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/projectDocuments/center/actions/supersede.tsx"),
    withDebug(true, true),
)(SupersedeProjectDocument);
