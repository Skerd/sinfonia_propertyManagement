import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import TooltipDisplayer from "@coreModule/components/custom/tooltipDisplayer.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import type {ProjectDocument} from "armonia/src/modules/propertyManagement/api/realEstate/private/projectDocument/projectDocument.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import {Badge} from "@coreModule/components/ui/badge.tsx";
import {IconBuilding, IconCalendar, IconDoor, IconHash} from "@tabler/icons-react";
import ProjectDocumentSheetView from "@propertyManagementModule/clients/panel/private/projectDocuments/center/sheetView/projectDocumentSheetView.tsx";
import {STATUS_BADGE_NEUTRAL, STATUS_BADGE_WARNING} from "@propertyManagementModule/components/custom/cards/entityCard.constants.ts";
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
import DisplayRow from "@coreModule/components/custom/displayValue/displayRow.tsx";
import DisplayValue from "@coreModule/components/custom/displayValue/displayValue.tsx";
import EntityCard from "@coreModule/components/custom/systemCards/entityCard.tsx";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {ReactNode, RefObject} from "react";

type ProjectDocumentCardProps = WithLanguageType & {
    projectDocument: ProjectDocument;
    fetchId?: string;
    hideActions?: boolean;
    onDelete?: (deletedProjectDocument?: ProjectDocument, response?: DeletedData) => void;
    onRestore?: () => void;
    onActionSuccess?: (updated?: ProjectDocument) => void;
    sheetOnly?: boolean;
    innerRef?: RefObject<WithAxiosLifecycleRef<ProjectDocument> | null>;
};

function buildEditPath(projectDocument: ProjectDocument) {
    const params = new URLSearchParams();
    params.set("projectDocumentId", projectDocument._id);
    if (projectDocument.name) params.set("projectDocumentName", projectDocument.name);
    if (projectDocument.project?._id) params.set("projectId", projectDocument.project._id);
    if (projectDocument.project?.name) params.set("projectName", projectDocument.project.name);
    return `/realEstate/projectDocuments/edit?${params.toString()}`;
}

function ProjectDocumentCard({
    projectDocument,
    resolveLanguageKey,
    fetchId,
    hideActions = false,
    onDelete,
    onRestore,
    onActionSuccess,
    sheetOnly = false,
    innerRef,
}: ProjectDocumentCardProps) {
    return (
        <EntityCard
            resource="projectdocuments"
            entity={projectDocument}
            fetchId={fetchId}
            singleUrl="/api/realEstate/projectDocument/single"
            onDelete={onDelete}
            onRestore={onRestore}
            hideActions={hideActions}
            sheetOnly={sheetOnly}
            editPath={buildEditPath}
            Sheet={ProjectDocumentSheetView}
            sheetEntityProp="projectDocument"
            deleteUrl="/api/realEstate/projectDocument"
            restoreUrl="/api/realEstate/projectDocument/restore"
            failedTitle=""
            failedDescription=""
            titlePath="title"
            innerRef={innerRef}
            sheetProps={() => ({fetchId})}
            extraDialogs={({action, setAction, entity, setEntity}) => {
                const handleSuccess = (updated?: ProjectDocument) => {
                    if (updated) setEntity({...entity, ...updated});
                    onActionSuccess?.(updated);
                    setAction("");
                };
                return (
                    <>
                        {action === SUBMIT_FOR_REVIEW_PROJECT_DOCUMENT_ACTION && (
                            <SubmitForReviewProjectDocumentDialog
                                open
                                onClose={() => setAction("")}
                                projectDocument={entity}
                                onSuccess={handleSuccess}
                            />
                        )}
                        {action === APPROVE_PROJECT_DOCUMENT_ACTION && (
                            <ApproveProjectDocumentDialog
                                open
                                onClose={() => setAction("")}
                                projectDocument={entity}
                                onSuccess={handleSuccess}
                            />
                        )}
                        {action === REJECT_PROJECT_DOCUMENT_ACTION && (
                            <RejectProjectDocumentDialog
                                open
                                onClose={() => setAction("")}
                                projectDocument={entity}
                                onSuccess={handleSuccess}
                            />
                        )}
                        {action === SUPERSEDE_PROJECT_DOCUMENT_ACTION && (
                            <SupersedeProjectDocumentDialog
                                open
                                onClose={() => setAction("")}
                                projectDocument={entity}
                                onSuccess={handleSuccess}
                            />
                        )}
                        {action === MARK_AS_BUILT_PROJECT_DOCUMENT_ACTION && (
                            <MarkAsBuiltProjectDocumentDialog
                                open
                                onClose={() => setAction("")}
                                projectDocument={entity}
                                onSuccess={handleSuccess}
                            />
                        )}
                    </>
                );
            }}
        >
            {({entity, setAction}) => (
                <>
                    <EntityCard.Header
                        titlePath="title"
                        title={entity.title}
                        subtitle={entity.name}
                        subtitlePath="name"
                        badges={
                            <>
                                {entity.status ? (
                                    <DisplayValue
                                        path="status"
                                        type="enum"
                                        languageKeyCategory="fields.!enums.status"
                                        value={entity.status}
                                    >
                                        {(formatted: ReactNode) => (
                                            <TooltipDisplayer tooltip={resolveLanguageKey("statusLabel") as string}>
                                                <Badge variant="secondary" className={cn("text-xs", STATUS_BADGE_NEUTRAL)}>
                                                    {formatted}
                                                </Badge>
                                            </TooltipDisplayer>
                                        )}
                                    </DisplayValue>
                                ) : null}
                                {entity.discipline ? (
                                    <DisplayValue
                                        path="discipline"
                                        type="enum"
                                        languageKeyCategory="fields.!enums.discipline"
                                        value={entity.discipline}
                                    >
                                        {(formatted: ReactNode) => (
                                            <TooltipDisplayer tooltip={resolveLanguageKey("disciplineLabel") as string}>
                                                <Badge variant="outline" className={cn("text-xs", STATUS_BADGE_WARNING)}>
                                                    {formatted}
                                                </Badge>
                                            </TooltipDisplayer>
                                        )}
                                    </DisplayValue>
                                ) : null}
                            </>
                        }
                    >
                        <SubmitForReviewProjectDocument projectDocument={entity} onAction={setAction} />
                        <ApproveProjectDocument projectDocument={entity} onAction={setAction} />
                        <RejectProjectDocument projectDocument={entity} onAction={setAction} />
                        <SupersedeProjectDocument projectDocument={entity} onAction={setAction} />
                        <MarkAsBuiltProjectDocument projectDocument={entity} onAction={setAction} />
                    </EntityCard.Header>
                    <EntityCard.Body>
                        <DisplayRow
                            icon={IconBuilding}
                            label={resolveLanguageKey("fields.project")}
                            tooltip={resolveLanguageKey("fields.project")}
                            path="project"
                            value={entity.project?.name}
                        />
                        <DisplayRow
                            icon={IconDoor}
                            label={resolveLanguageKey("fields.unit")}
                            tooltip={resolveLanguageKey("fields.unit")}
                            path="unit"
                            value={entity.unit?.name || entity.unit?.unitNumber}
                        />
                        <DisplayRow
                            icon={IconHash}
                            label={resolveLanguageKey("fields.documentNumber")}
                            tooltip={resolveLanguageKey("fields.documentNumber")}
                            path="documentNumber"
                            value={entity.documentNumber}
                        />
                        <DisplayRow
                            icon={IconCalendar}
                            label={resolveLanguageKey("fields.revisionDate")}
                            tooltip={resolveLanguageKey("fields.revisionDate")}
                            path="revisionDate"
                            type="date"
                            value={entity.revisionDate}
                        />
                    </EntityCard.Body>
                </>
            )}
        </EntityCard>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/projectDocuments/center/cardView/projectDocumentCard.tsx"),
    withDebug(true, true),
)(ProjectDocumentCard);
