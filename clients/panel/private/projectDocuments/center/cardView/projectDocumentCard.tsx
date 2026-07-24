import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import HiddenElement from "@coreModule/components/custom/hiddenElement.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import TooltipDisplayer from "@coreModule/components/custom/tooltipDisplayer.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import type {ProjectDocument} from "armonia/src/modules/propertyManagement/api/realEstate/private/projectDocument/projectDocument.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import {Separator} from "@coreModule/components/ui/separator.tsx";
import {Badge} from "@coreModule/components/ui/badge.tsx";
import {withDeletedDrawer} from "@coreModule/helpers/hocs/withDeletedDrawer.tsx";
import InfoRow from "@coreModule/components/custom/infoRow.tsx";
import {IconBuilding, IconCalendar, IconDoor, IconHash} from "@tabler/icons-react";
import ProjectDocumentSheetView from "@propertyManagementModule/clients/panel/private/projectDocuments/center/sheetView/projectDocumentSheetView.tsx";
import DeleteAction from "@coreModule/components/custom/actions/deleteAction.tsx";
import RestoreAction from "@coreModule/components/custom/actions/restoreAction.tsx";
import ActionMenu from "@coreModule/components/custom/actions/menu/actionMenu.tsx";
import {useEntityCard} from "@coreModule/helpers/hooks/useEntityCard.ts";
import {EntityCardShell} from "@propertyManagementModule/components/custom/cards/EntityCardShell.tsx";
import {EntityTextCardHeader} from "@propertyManagementModule/components/custom/cards/EntityTextCardHeader.tsx";
import {CARD_BODY_CLASS, CARD_INFO_ROWS_CLASS, STATUS_BADGE_NEUTRAL, STATUS_BADGE_WARNING} from "@propertyManagementModule/components/custom/cards/entityCard.constants.ts";
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

type ProjectDocumentCardProps = WithLanguageType & {
    projectDocument: ProjectDocument;
    onDelete?: (deletedProjectDocument?: ProjectDocument, response?: DeletedData) => void;
    onRestore?: () => void;
    onActionSuccess?: (updated?: ProjectDocument) => void;
    hideActions?: boolean;
};

function buildEditPath(projectDocument: ProjectDocument) {
    const params = new URLSearchParams();
    params.set("projectDocumentId", projectDocument._id);
    if (projectDocument.name) params.set("projectDocumentName", projectDocument.name);
    if (projectDocument.project?._id) params.set("projectId", projectDocument.project._id);
    if (projectDocument.project?.name) params.set("projectName", projectDocument.project.name);
    return `/realEstate/projectDocuments/edit?${params.toString()}`;
}

function formatDate(value?: string) {
    if (!value) return undefined;
    try {
        return new Date(value).toLocaleDateString();
    } catch {
        return value;
    }
}

function getStatusLabel(resolveLanguageKey: (key: string) => unknown, status?: string) {
    if (!status) return undefined;
    return resolveLanguageKey(`fields.!enums.status.${status}`) as string;
}

function getDisciplineLabel(resolveLanguageKey: (key: string) => unknown, discipline?: string) {
    if (!discipline) return undefined;
    return resolveLanguageKey(`fields.!enums.discipline.${discipline}`) as string;
}

function ProjectDocumentCard({
    projectDocument: projectDocumentProp,
    resolveLanguageKey,
    onDelete: onDeleteProp,
    onRestore: onRestoreProp,
    onActionSuccess,
    hideActions = false,
}: ProjectDocumentCardProps) {
    const {action, setAction, entity: projectDocument, setEntity, hideAfterDeletion, onDelete, onRestore} = useEntityCard({
        entityProp: projectDocumentProp,
        onDeleteProp,
        onRestoreProp,
    });

    const handleActionSuccess = (updated?: ProjectDocument) => {
        if (updated) setEntity(updated);
        onActionSuccess?.(updated);
        setAction("");
    };

    const {read, write, restore} = useAccess("projectdocuments");

    if (hideAfterDeletion || !restore) {
        return <></>;
    }
    if (!read || !Object.keys(read).length) {
        return <HiddenElement />;
    }

    const editPath = buildEditPath(projectDocument);

    return (
        <>
            <EntityCardShell onClick={() => setAction("view")}>
                <EntityTextCardHeader
                    title={!!read?.title ? projectDocument.title : null}
                    subtitle={!!read?.name && !!projectDocument.name ? projectDocument.name : undefined}
                    badges={
                        <>
                            {!!read?.status && !!projectDocument.status && (
                                <TooltipDisplayer tooltip={resolveLanguageKey("statusLabel") as string}>
                                    <Badge variant="secondary" className={cn("text-xs", STATUS_BADGE_NEUTRAL)}>
                                        {getStatusLabel(resolveLanguageKey, projectDocument.status)}
                                    </Badge>
                                </TooltipDisplayer>
                            )}
                            {!!read?.discipline && !!projectDocument.discipline && (
                                <TooltipDisplayer tooltip={resolveLanguageKey("disciplineLabel") as string}>
                                    <Badge variant="outline" className={cn("text-xs", STATUS_BADGE_WARNING)}>
                                        {getDisciplineLabel(resolveLanguageKey, projectDocument.discipline)}
                                    </Badge>
                                </TooltipDisplayer>
                            )}
                        </>
                    }
                    hideActions={hideActions}
                    actionMenu={
                        <ActionMenu
                            accessModel="projectdocuments"
                            deletedData={projectDocument}
                            onAction={(a: string) => setAction(a)}
                            editPath={editPath}
                            allowMenuForCustomChildren={!!write && !projectDocument.deletedAt}
                        >
                            <SubmitForReviewProjectDocument projectDocument={projectDocument} onAction={(a: string) => setAction(a)} />
                            <ApproveProjectDocument projectDocument={projectDocument} onAction={(a: string) => setAction(a)} />
                            <RejectProjectDocument projectDocument={projectDocument} onAction={(a: string) => setAction(a)} />
                            <SupersedeProjectDocument projectDocument={projectDocument} onAction={(a: string) => setAction(a)} />
                            <MarkAsBuiltProjectDocument projectDocument={projectDocument} onAction={(a: string) => setAction(a)} />
                        </ActionMenu>
                    }
                />
                <Separator />
                <div className={CARD_BODY_CLASS}>
                    <div className={CARD_INFO_ROWS_CLASS}>
                        <InfoRow
                            icon={IconBuilding}
                            label={resolveLanguageKey("fields.project")}
                            show={!!read?.project}
                            value={projectDocument.project?.name}
                        />
                        <InfoRow
                            icon={IconDoor}
                            label={resolveLanguageKey("fields.unit")}
                            show={!!read?.unit && !!projectDocument.unit}
                            value={projectDocument.unit?.name || projectDocument.unit?.unitNumber}
                        />
                        <InfoRow
                            icon={IconHash}
                            label={resolveLanguageKey("fields.documentNumber")}
                            show={!!read?.documentNumber && !!projectDocument.documentNumber}
                            value={projectDocument.documentNumber}
                        />
                    </div>
                    <Separator />
                    <div className={CARD_INFO_ROWS_CLASS}>
                        <InfoRow
                            icon={IconCalendar}
                            label={resolveLanguageKey("fields.revisionDate")}
                            show={!!read?.revisionDate}
                            value={formatDate(projectDocument.revisionDate)}
                        />
                    </div>
                </div>
            </EntityCardShell>

            {!!action && (
                <>
                    {action === "view" && (
                        <ProjectDocumentSheetView
                            open={action === "view"}
                            onOpenChange={() => setAction("")}
                            projectDocument={projectDocument}
                            onDelete={onDelete}
                            onRestore={onRestore}
                        />
                    )}
                    {action === "delete" && (
                        <DeleteAction
                            accessModel="projectdocuments"
                            deleteId={projectDocument._id}
                            openAlert={action === "delete"}
                            name={read?.title && projectDocument.title}
                            confirmName={read?.title && projectDocument.title}
                            onSuccess={onDelete}
                            onCancel={() => setAction("")}
                            url="/api/realEstate/projectDocument"
                        />
                    )}
                    {action === "restore" && (
                        <RestoreAction
                            accessModel="projectdocuments"
                            deleteId={projectDocument._id}
                            openAlert={action === "restore"}
                            name={read?.title && projectDocument.title}
                            confirmName={read?.title && projectDocument.title}
                            onSuccess={onRestore}
                            onCancel={() => setAction("")}
                            url="/api/realEstate/projectDocument/restore"
                        />
                    )}
                    {action === SUBMIT_FOR_REVIEW_PROJECT_DOCUMENT_ACTION && (
                        <SubmitForReviewProjectDocumentDialog
                            open
                            onClose={() => setAction("")}
                            projectDocument={projectDocument}
                            onSuccess={handleActionSuccess}
                        />
                    )}
                    {action === APPROVE_PROJECT_DOCUMENT_ACTION && (
                        <ApproveProjectDocumentDialog
                            open
                            onClose={() => setAction("")}
                            projectDocument={projectDocument}
                            onSuccess={handleActionSuccess}
                        />
                    )}
                    {action === REJECT_PROJECT_DOCUMENT_ACTION && (
                        <RejectProjectDocumentDialog
                            open
                            onClose={() => setAction("")}
                            projectDocument={projectDocument}
                            onSuccess={handleActionSuccess}
                        />
                    )}
                    {action === SUPERSEDE_PROJECT_DOCUMENT_ACTION && (
                        <SupersedeProjectDocumentDialog
                            open
                            onClose={() => setAction("")}
                            projectDocument={projectDocument}
                            onSuccess={handleActionSuccess}
                        />
                    )}
                    {action === MARK_AS_BUILT_PROJECT_DOCUMENT_ACTION && (
                        <MarkAsBuiltProjectDocumentDialog
                            open
                            onClose={() => setAction("")}
                            projectDocument={projectDocument}
                            onSuccess={handleActionSuccess}
                        />
                    )}
                </>
            )}
        </>
    );
}

export default compose(
    (Component: any) => withDeletedDrawer(Component, (props: any) => props.projectDocument),
    withLanguage("src/modules/propertyManagement/clients/panel/private/projectDocuments/center/cardView/projectDocumentCard.tsx"),
    withDebug(true, true),
)(ProjectDocumentCard);
