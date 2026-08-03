import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import HiddenElement from "@coreModule/components/custom/hiddenElement.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import type {IncomingInvoice} from "armonia/src/modules/propertyManagement/api/realEstate/private/incomingInvoice/incomingInvoice.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import {Separator} from "@coreModule/components/ui/separator.tsx";
import {Badge} from "@coreModule/components/ui/badge.tsx";
import {withDeletedDrawer} from "@coreModule/helpers/hocs/withDeletedDrawer.tsx";
import Sheet from "@propertyManagementModule/clients/panel/private/incomingInvoices/center/sheetView/incomingInvoiceSheetView.tsx";
import DeleteAction from "@coreModule/components/custom/actions/deleteAction.tsx";
import RestoreAction from "@coreModule/components/custom/actions/restoreAction.tsx";
import ActionMenu from "@coreModule/components/custom/actions/menu/actionMenu.tsx";
import {useEntityCard} from "@coreModule/helpers/hooks/useEntityCard.ts";
import {EntityCardShell} from "@propertyManagementModule/components/custom/cards/EntityCardShell.tsx";
import {EntityTextCardHeader} from "@propertyManagementModule/components/custom/cards/EntityTextCardHeader.tsx";
import {CARD_BODY_CLASS, STATUS_BADGE_NEUTRAL} from "@propertyManagementModule/components/custom/cards/entityCard.constants.ts";
import {cn} from "@coreModule/components/lib/utils.ts";

type Props = WithLanguageType & {
    entity: IncomingInvoice;
    onDelete?: (deleted?: IncomingInvoice, response?: DeletedData) => void;
    onRestore?: () => void;
    hideActions?: boolean;
};

function Card({entity: prop, onDelete: onDeleteProp, onRestore: onRestoreProp, hideActions = false}: Props) {
    const {action, setAction, entity, hideAfterDeletion, onDelete, onRestore} = useEntityCard({entityProp: prop, onDeleteProp, onRestoreProp});
    const {read, restore} = useAccess("incominginvoices");
    if (hideAfterDeletion || !restore) return <></>;
    if (!read || !Object.keys(read).length) return <HiddenElement />;
    const params = new URLSearchParams();
    params.set("incomingInvoiceId", entity._id);
    if (entity.name) params.set("incomingInvoiceName", entity.name);
    const editPath = `/realEstate/incomingInvoices/edit?${params.toString()}`;
    return (
        <>
            <EntityCardShell onClick={() => setAction("view")}>
                <EntityTextCardHeader
                    title={entity.name}
                    subtitle={entity.extractedSupplierName}
                    badges={entity.status ? (
                        <Badge variant="secondary" className={cn("text-xs", STATUS_BADGE_NEUTRAL)}>{entity.status}</Badge>
                    ) : null}
                    showTitle={!!read?.name}
                    showSubtitle={!!read?.extractedSupplierName}
                    showBadges={!!read?.status}
                    hideActions={hideActions}
                    actionMenu={
                        <ActionMenu accessModel="incominginvoices" deletedData={entity} onAction={(a: string) => setAction(a)} editPath={editPath} />
                    }
                />
                <Separator />
                <div className={CARD_BODY_CLASS} />
            </EntityCardShell>
            {action === "view" && (
                <Sheet open onOpenChange={() => setAction("")} entity={entity} onDelete={onDelete} onRestore={onRestore} />
            )}
            {action === "delete" && (
                <DeleteAction accessModel="incominginvoices" deleteId={entity._id} openAlert name={entity.name} confirmName={entity.name} onSuccess={onDelete} onCancel={() => setAction("")} url="/api/realEstate/incomingInvoice" />
            )}
            {action === "restore" && (
                <RestoreAction accessModel="incominginvoices" deleteId={entity._id} openAlert name={entity.name} confirmName={entity.name} onSuccess={onRestore} onCancel={() => setAction("")} url="/api/realEstate/incomingInvoice/restore" />
            )}
        </>
    );
}

export default compose(
    (Component: any) => withDeletedDrawer(Component, (props: any) => props.entity),
    withLanguage("src/modules/propertyManagement/clients/panel/private/incomingInvoices/center/cardView/incomingInvoiceCard.tsx"),
    withDebug(true, true),
)(Card);
