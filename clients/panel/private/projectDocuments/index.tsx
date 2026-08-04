import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage from "@coreModule/components/entityPage/EntityListPage.tsx";
import {GRID_TRANSACTIONAL} from "@propertyManagementModule/components/custom/cards/entityCard.constants.ts";
import {IconFileDescription} from "@tabler/icons-react";
import type {ProjectDocument} from "armonia/src/modules/propertyManagement/api/realEstate/private/projectDocument/projectDocument.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import ProjectDocumentCard from "@propertyManagementModule/clients/panel/private/projectDocuments/center/cardView/projectDocumentCard.tsx";
import SubmitForReviewProjectDocument, {SUBMIT_FOR_REVIEW_PROJECT_DOCUMENT_ACTION} from "@propertyManagementModule/clients/panel/private/projectDocuments/center/actions/submitForReview.tsx";
import ApproveProjectDocument, {APPROVE_PROJECT_DOCUMENT_ACTION} from "@propertyManagementModule/clients/panel/private/projectDocuments/center/actions/approve.tsx";
import RejectProjectDocument, {REJECT_PROJECT_DOCUMENT_ACTION} from "@propertyManagementModule/clients/panel/private/projectDocuments/center/actions/reject.tsx";
import SupersedeProjectDocument, {SUPERSEDE_PROJECT_DOCUMENT_ACTION} from "@propertyManagementModule/clients/panel/private/projectDocuments/center/actions/supersede.tsx";
import MarkAsBuiltProjectDocument, {MARK_AS_BUILT_PROJECT_DOCUMENT_ACTION} from "@propertyManagementModule/clients/panel/private/projectDocuments/center/actions/markAsBuilt.tsx";
import SubmitForReviewProjectDocumentDialog from "@propertyManagementModule/components/custom/projectDocuments/submitForReviewProjectDocumentDialog.tsx";
import ApproveProjectDocumentDialog from "@propertyManagementModule/components/custom/projectDocuments/approveProjectDocumentDialog.tsx";
import RejectProjectDocumentDialog from "@propertyManagementModule/components/custom/projectDocuments/rejectProjectDocumentDialog.tsx";
import SupersedeProjectDocumentDialog from "@propertyManagementModule/components/custom/projectDocuments/supersedeProjectDocumentDialog.tsx";
import MarkAsBuiltProjectDocumentDialog from "@propertyManagementModule/components/custom/projectDocuments/markAsBuiltProjectDocumentDialog.tsx";

interface AllProjectDocumentsProps extends WithLanguageType {
    projectId?: string;
    projectName?: string;
}

function buildEditPath(doc: ProjectDocument) {
    const params = new URLSearchParams();
    params.set("projectDocumentId", doc._id);
    if (doc.name) params.set("projectDocumentName", doc.name);
    if (doc.project?._id) params.set("projectId", doc.project._id);
    if (doc.project?.name) params.set("projectName", doc.project.name);
    return `/realEstate/projectDocuments/edit?${params.toString()}`;
}

function AllProjectDocuments({resolveLanguageKey, projectId, projectName}: AllProjectDocumentsProps) {
    const extraFilters = projectId ? {projectId} : undefined;

    return (
        <EntityListPage<ProjectDocument>
            apiUrl="/api/realEstate/projectDocument"
            collectionName="projectdocuments"
            accessModel="projectdocuments"
            tableConfigKey="projectdocuments"
            createPath={projectId
                ? `/realEstate/projectDocuments/create?projectId=${projectId}${projectName ? `&projectName=${encodeURIComponent(projectName)}` : ""}`
                : "/realEstate/projectDocuments/create"
            }
            createIcon={<IconFileDescription className="h-4 w-4" />}
            createLanguageKey="createProjectDocument"
            buildEditPath={buildEditPath}
            resolveLanguageKey={resolveLanguageKey}
            sheetLanguagePath="src/modules/propertyManagement/clients/panel/private/projectDocuments/center/sheetView/projectDocumentSheetView.tsx"
            cardViewClassName={GRID_TRANSACTIONAL}
            extraFilters={extraFilters}
            rowActionMenu={{allowMenuForCustomChildren: true}}
            renderActionMenuChildren={(doc, bindRowAction) => (
                <>
                    <SubmitForReviewProjectDocument projectDocument={doc} onAction={bindRowAction} />
                    <ApproveProjectDocument projectDocument={doc} onAction={bindRowAction} />
                    <RejectProjectDocument projectDocument={doc} onAction={bindRowAction} />
                    <SupersedeProjectDocument projectDocument={doc} onAction={bindRowAction} />
                    <MarkAsBuiltProjectDocument projectDocument={doc} onAction={bindRowAction} />
                </>
            )}
            renderFloatingModals={({action, entity, resetAction, listRef}) => {
                const onSuccess = (updated?: ProjectDocument) => {
                    if (updated?._id) listRef.current?.updateRow?.(updated._id, updated);
                    resetAction();
                };
                if (action === SUBMIT_FOR_REVIEW_PROJECT_DOCUMENT_ACTION)
                    return <SubmitForReviewProjectDocumentDialog open onClose={resetAction} projectDocument={entity} onSuccess={onSuccess} />;
                if (action === APPROVE_PROJECT_DOCUMENT_ACTION)
                    return <ApproveProjectDocumentDialog open onClose={resetAction} projectDocument={entity} onSuccess={onSuccess} />;
                if (action === REJECT_PROJECT_DOCUMENT_ACTION)
                    return <RejectProjectDocumentDialog open onClose={resetAction} projectDocument={entity} onSuccess={onSuccess} />;
                if (action === SUPERSEDE_PROJECT_DOCUMENT_ACTION)
                    return <SupersedeProjectDocumentDialog open onClose={resetAction} projectDocument={entity} onSuccess={onSuccess} />;
                if (action === MARK_AS_BUILT_PROJECT_DOCUMENT_ACTION)
                    return <MarkAsBuiltProjectDocumentDialog open onClose={resetAction} projectDocument={entity} onSuccess={onSuccess} />;
                return null;
            }}
            renderCard={(doc, onDelete, onRestore, listRef) => (
                <ProjectDocumentCard
                    projectDocument={doc}
                    onDelete={(row: ProjectDocument | undefined, response?: DeletedData) => onDelete(row, response)}
                    onRestore={() => onRestore(doc)}
                    onActionSuccess={(updated?: ProjectDocument) =>
                        updated && listRef.current?.updateRow?.(updated._id, updated)
                    }
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/projectDocuments/index.tsx"),
    withDebug(true, true),
)(AllProjectDocuments);
