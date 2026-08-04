import {compose} from "redux";
import {InfoRowGroup} from "@coreModule/components/custom/infoRowGroup.tsx";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import HiddenElement from "@coreModule/components/custom/hiddenElement.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import TooltipDisplayer from "@coreModule/components/custom/tooltipDisplayer.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import type {Snag} from "armonia/src/modules/propertyManagement/api/realEstate/private/snag/snag.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import {Separator} from "@coreModule/components/ui/separator.tsx";
import {Badge} from "@coreModule/components/ui/badge.tsx";
import {withDeletedDrawer} from "@coreModule/helpers/hocs/withDeletedDrawer.tsx";
import InfoRow from "@coreModule/components/custom/infoRow.tsx";
import {IconAlertTriangle, IconCalendar, IconDoor, IconLabel, IconMapPin} from "@tabler/icons-react";
import SnagSheetView from "@propertyManagementModule/clients/panel/private/snags/center/sheetView/snagSheetView.tsx";
import DeleteAction from "@coreModule/components/custom/actions/deleteAction.tsx";
import RestoreAction from "@coreModule/components/custom/actions/restoreAction.tsx";
import ActionMenu from "@coreModule/components/custom/actions/menu/actionMenu.tsx";
import CopyTooltip from "@coreModule/components/custom/copyTooltip.tsx";
import {useEntityCard} from "@coreModule/helpers/hooks/useEntityCard.ts";
import {EntityCardShell} from "@propertyManagementModule/components/custom/cards/EntityCardShell.tsx";
import {EntityTextCardHeader} from "@propertyManagementModule/components/custom/cards/EntityTextCardHeader.tsx";
import {CARD_BODY_CLASS, STATUS_BADGE_NEUTRAL, STATUS_BADGE_WARNING} from "@propertyManagementModule/components/custom/cards/entityCard.constants.ts";
import AssignSnag, {ASSIGN_SNAG_ACTION} from "@propertyManagementModule/clients/panel/private/snags/center/actions/assign.tsx";
import StartWorkingSnag, {START_WORKING_SNAG_ACTION} from "@propertyManagementModule/clients/panel/private/snags/center/actions/startWorking.tsx";
import FinishWorkingSnag, {FINISH_WORKING_SNAG_ACTION} from "@propertyManagementModule/clients/panel/private/snags/center/actions/finishWorking.tsx";
import AssignSnagDialog from "@propertyManagementModule/components/custom/snags/assignSnagDialog.tsx";
import StartWorkingSnagDialog from "@propertyManagementModule/components/custom/snags/startWorkingSnagDialog.tsx";
import FinishWorkingSnagDialog from "@propertyManagementModule/components/custom/snags/finishWorkingSnagDialog.tsx";

type SnagCardProps = WithLanguageType & {
    snag: Snag;
    onDelete?: (deletedSnag?: Snag, response?: DeletedData) => void;
    onRestore?: () => void;
    onActionSuccess?: (updated?: Snag) => void;
    hideActions?: boolean;
};

function buildEditPath(snag: Snag) {
    const params = new URLSearchParams();
    params.set("snagId", snag._id);
    if (snag.name) params.set("snagName", snag.name);
    if (snag.unit?._id) params.set("unitId", snag.unit._id);
    if (snag.unit?.name) params.set("unitName", snag.unit.name);
    return `/realEstate/snags/edit?${params.toString()}`;
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

function getSeverityLabel(resolveLanguageKey: (key: string) => unknown, severity?: string) {
    if (!severity) return undefined;
    return resolveLanguageKey(`fields.!enums.severity.${severity}`) as string;
}

function SnagCard({
    snag: snagProp,
    resolveLanguageKey,
    onDelete: onDeleteProp,
    onRestore: onRestoreProp,
    onActionSuccess,
    hideActions = false,
}: SnagCardProps) {
    const {action, setAction, entity: snag, setEntity, hideAfterDeletion, onDelete, onRestore} = useEntityCard({
        entityProp: snagProp,
        onDeleteProp,
        onRestoreProp,
    });

    const handleActionSuccess = (updated?: Snag) => {
        if (updated) setEntity(updated);
        onActionSuccess?.(updated);
        setAction("");
    };

    const {read, write, restore} = useAccess("snags");

    if (hideAfterDeletion || !restore) {
        return <></>;
    }
    if (!read || !Object.keys(read).length) {
        return <HiddenElement />;
    }

    const editPath = buildEditPath(snag);

    return (
        <>
            <EntityCardShell onClick={() => setAction("view")}>
                <EntityTextCardHeader
                    title={
                        <span className="flex min-w-0 items-center gap-1">
                            <span className="truncate">{snag.title}</span>
                            {!!read?.name && snag.name ? <CopyTooltip text={snag.name} /> : null}
                        </span>
                    }
                    badges={
                        <>
                            {!!read?.status && !!snag.status && (
                                <TooltipDisplayer tooltip={resolveLanguageKey("statusLabel") as string}>
                                    <Badge variant="outline" className={cn("text-xs", STATUS_BADGE_NEUTRAL)}>
                                        {getStatusLabel(resolveLanguageKey, snag.status)}
                                    </Badge>
                                </TooltipDisplayer>
                            )}
                            {!!read?.severity && !!snag.severity && (
                                <TooltipDisplayer tooltip={resolveLanguageKey("severityLabel") as string}>
                                    <Badge variant="outline" className={cn("text-xs", STATUS_BADGE_WARNING)}>
                                        {getSeverityLabel(resolveLanguageKey, snag.severity)}
                                    </Badge>
                                </TooltipDisplayer>
                            )}
                        </>
                    }
                    showTitle={!!read?.title}
                    showBadges={!!(read?.status || read?.severity)}
                    hideActions={hideActions}
                    actionMenu={
                        <ActionMenu
                            accessModel="snags"
                            deletedData={snag}
                            onAction={(a: string) => setAction(a)}
                            editPath={editPath}
                            allowMenuForCustomChildren={!!write && !snag.deletedAt}
                        >
                            <AssignSnag snag={snag} onAction={(a: string) => setAction(a)} />
                            <StartWorkingSnag snag={snag} onAction={(a: string) => setAction(a)} />
                            <FinishWorkingSnag snag={snag} onAction={(a: string) => setAction(a)} />
                        </ActionMenu>
                    }
                />
                <Separator />
                <div className={CARD_BODY_CLASS}>
                    <InfoRowGroup>
                        <InfoRow
                            icon={IconLabel}
                            label={resolveLanguageKey("fields.name")}
                            show={!!read?.name}
                            value={snag.name}
                        />
                        <InfoRow
                            icon={IconDoor}
                            label={resolveLanguageKey("fields.unit")}
                            show={!!read?.unit}
                            value={snag.unit?.name || snag.unit?.unitNumber}
                        />
                        <InfoRow
                            icon={IconMapPin}
                            label={resolveLanguageKey("fields.location")}
                            show={!!read?.location && !!snag.location}
                            value={snag.location}
                        />
                        <InfoRow
                            icon={IconCalendar}
                            label={resolveLanguageKey("fields.dueDate")}
                            show={!!read?.dueDate}
                            value={formatDate(snag.dueDate)}
                        />
                        <InfoRow
                            icon={IconAlertTriangle}
                            label={resolveLanguageKey("fields.assignedTo")}
                            show={!!read?.assignedTo && !!(snag.assignedTo?.name || snag.assignedTo?.surname)}
                            value={[snag.assignedTo?.name, snag.assignedTo?.surname].filter(Boolean).join(" ")}
                        />
                    </InfoRowGroup>
                </div>
            </EntityCardShell>

            {!!action && (
                <>
                    {action === "view" && (
                        <SnagSheetView
                            open={action === "view"}
                            onOpenChange={() => setAction("")}
                            snag={snag}
                            onDelete={onDelete}
                            onRestore={onRestore}
                        />
                    )}
                    {action === "delete" && (
                        <DeleteAction
                            accessModel="snags"
                            deleteId={snag._id}
                            openAlert={action === "delete"}
                            name={read?.title && snag.title}
                            confirmName={read?.title && snag.title}
                            onSuccess={onDelete}
                            onCancel={() => setAction("")}
                            url="/api/realEstate/snag"
                        />
                    )}
                    {action === "restore" && (
                        <RestoreAction
                            accessModel="snags"
                            deleteId={snag._id}
                            openAlert={action === "restore"}
                            name={read?.title && snag.title}
                            confirmName={read?.title && snag.title}
                            onSuccess={onRestore}
                            onCancel={() => setAction("")}
                            url="/api/realEstate/snag/restore"
                        />
                    )}
                    {action === ASSIGN_SNAG_ACTION && (
                        <AssignSnagDialog
                            open
                            onClose={() => setAction("")}
                            snag={snag}
                            onSuccess={handleActionSuccess}
                        />
                    )}
                    {action === START_WORKING_SNAG_ACTION && (
                        <StartWorkingSnagDialog
                            open
                            onClose={() => setAction("")}
                            snag={snag}
                            onSuccess={handleActionSuccess}
                        />
                    )}
                    {action === FINISH_WORKING_SNAG_ACTION && (
                        <FinishWorkingSnagDialog
                            open
                            onClose={() => setAction("")}
                            snag={snag}
                            onSuccess={handleActionSuccess}
                        />
                    )}
                </>
            )}
        </>
    );
}

export default compose(
    (Component: any) => withDeletedDrawer(Component, (props: any) => props.snag),
    withLanguage("src/modules/propertyManagement/clients/panel/private/snags/center/cardView/snagCard.tsx"),
    withDebug(true, true),
)(SnagCard);
