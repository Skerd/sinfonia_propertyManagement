import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import HiddenElement from "@coreModule/components/custom/hiddenElement.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import type {ApprovalWorkflow} from "armonia/src/modules/propertyManagement/api/realEstate/private/approvalWorkflow/approvalWorkflow.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import {Separator} from "@coreModule/components/ui/separator.tsx";
import {Badge} from "@coreModule/components/ui/badge.tsx";
import {withDeletedDrawer} from "@coreModule/helpers/hocs/withDeletedDrawer.tsx";
import Sheet from "@propertyManagementModule/clients/panel/private/approvalWorkflows/center/sheetView/approvalWorkflowSheetView.tsx";
import DeleteAction from "@coreModule/components/custom/actions/deleteAction.tsx";
import RestoreAction from "@coreModule/components/custom/actions/restoreAction.tsx";
import ActionMenu from "@coreModule/components/custom/actions/menu/actionMenu.tsx";
import {useEntityCard} from "@coreModule/helpers/hooks/useEntityCard.ts";
import {EntityCardShell} from "@propertyManagementModule/components/custom/cards/EntityCardShell.tsx";
import {EntityTextCardHeader} from "@propertyManagementModule/components/custom/cards/EntityTextCardHeader.tsx";
import {CARD_BODY_CLASS, STATUS_BADGE_NEUTRAL} from "@propertyManagementModule/components/custom/cards/entityCard.constants.ts";
import {cn} from "@coreModule/components/lib/utils.ts";

type Props = WithLanguageType & {
    entity: ApprovalWorkflow;
    onDelete?: (deleted?: ApprovalWorkflow, response?: DeletedData) => void;
    onRestore?: () => void;
    hideActions?: boolean;
};

function Card({entity: prop, onDelete: onDeleteProp, onRestore: onRestoreProp, hideActions = false}: Props) {
    const {action, setAction, entity, hideAfterDeletion, onDelete, onRestore} = useEntityCard({entityProp: prop, onDeleteProp, onRestoreProp});
    const {read, restore} = useAccess("approvalworkflows");
    if (hideAfterDeletion || !restore) return <></>;
    if (!read || !Object.keys(read).length) return <HiddenElement />;
    const params = new URLSearchParams();
    params.set("approvalWorkflowId", entity._id);
    if (entity.name) params.set("approvalWorkflowName", entity.name);
    const editPath = `/realEstate/approvalWorkflows/edit?${params.toString()}`;
    return (
        <>
            <EntityCardShell onClick={() => setAction("view")}>
                <EntityTextCardHeader
                    title={!!read?.title ? entity.title : null}
                    subtitle={!!read?.documentType && !!entity.documentType ? entity.documentType : undefined}
                    badges={!!read?.active && entity.active != null ? (
                        <Badge variant="secondary" className={cn("text-xs", STATUS_BADGE_NEUTRAL)}>{String(entity.active)}</Badge>
                    ) : null}
                    hideActions={hideActions}
                    actionMenu={
                        <ActionMenu accessModel="approvalworkflows" deletedData={entity} onAction={(a: string) => setAction(a)} editPath={editPath} />
                    }
                />
                <Separator />
                <div className={CARD_BODY_CLASS} />
            </EntityCardShell>
            {action === "view" && (
                <Sheet open onOpenChange={() => setAction("")} entity={entity} onDelete={onDelete} onRestore={onRestore} />
            )}
            {action === "delete" && (
                <DeleteAction accessModel="approvalworkflows" deleteId={entity._id} openAlert name={entity.name} confirmName={entity.name} onSuccess={onDelete} onCancel={() => setAction("")} url="/api/realEstate/approvalWorkflow" />
            )}
            {action === "restore" && (
                <RestoreAction accessModel="approvalworkflows" deleteId={entity._id} openAlert name={entity.name} confirmName={entity.name} onSuccess={onRestore} onCancel={() => setAction("")} url="/api/realEstate/approvalWorkflow/restore" />
            )}
        </>
    );
}

export default compose(
    (Component: any) => withDeletedDrawer(Component, (props: any) => props.entity),
    withLanguage("src/modules/propertyManagement/clients/panel/private/approvalWorkflows/center/cardView/approvalWorkflowCard.tsx"),
    withDebug(true, true),
)(Card);
