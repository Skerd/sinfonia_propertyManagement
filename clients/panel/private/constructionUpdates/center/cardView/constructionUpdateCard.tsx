import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import HiddenElement from "@coreModule/components/custom/hiddenElement.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import TooltipDisplayer from "@coreModule/components/custom/tooltipDisplayer.tsx";
import type {ConstructionUpdate} from "armonia/src/modules/propertyManagement/api/realEstate/private/constructionUpdate/constructionUpdate.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import {Separator} from "@coreModule/components/ui/separator.tsx";
import {Badge} from "@coreModule/components/ui/badge.tsx";
import {withDeletedDrawer} from "@coreModule/helpers/hocs/withDeletedDrawer.tsx";
import InfoRow from "@coreModule/components/custom/infoRow.tsx";
import {IconBuilding, IconCalendar, IconStack2} from "@tabler/icons-react";
import ConstructionUpdateSheetView from "@propertyManagementModule/clients/panel/private/constructionUpdates/center/sheetView/constructionUpdateSheetView.tsx";
import DeleteAction from "@coreModule/components/custom/actions/deleteAction.tsx";
import RestoreAction from "@coreModule/components/custom/actions/restoreAction.tsx";
import ActionMenu from "@coreModule/components/custom/actions/menu/actionMenu.tsx";
import {useEntityCard} from "@coreModule/helpers/hooks/useEntityCard.ts";
import {EntityCardShell} from "@propertyManagementModule/components/custom/cards/EntityCardShell.tsx";
import {EntityTextCardHeader} from "@propertyManagementModule/components/custom/cards/EntityTextCardHeader.tsx";
import {
    CARD_BODY_CLASS,
    CARD_INFO_ROWS_CLASS,
    STATUS_BADGE_INFO,
    STATUS_BADGE_SUCCESS,
    STATUS_BADGE_WARNING,
} from "@propertyManagementModule/components/custom/cards/entityCard.constants.ts";

type ConstructionUpdateCardProps = WithLanguageType & {
    constructionUpdate: ConstructionUpdate;
    onDelete?: (deletedUpdate?: ConstructionUpdate, response?: DeletedData) => void;
    onRestore?: () => void;
    hideActions?: boolean;
};

function buildEditPath(update: ConstructionUpdate) {
    const params = new URLSearchParams();
    params.set("constructionUpdateId", update._id);
    if (update.name) params.set("constructionUpdateName", update.name);
    if (update.project?._id) params.set("projectId", update.project._id);
    if (update.project?.name) params.set("projectName", update.project.name);
    return `/realEstate/constructionUpdates/edit?${params.toString()}`;
}

function formatUpdateDate(value?: string) {
    if (!value) return undefined;
    try {
        return new Date(value).toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    } catch {
        return value;
    }
}

function progressBadgeClass(percent: number) {
    if (percent >= 75) return STATUS_BADGE_SUCCESS;
    if (percent >= 40) return STATUS_BADGE_WARNING;
    return STATUS_BADGE_INFO;
}

function ConstructionUpdateCard({
    constructionUpdate: updateProp,
    resolveLanguageKey,
    onDelete: onDeleteProp,
    onRestore: onRestoreProp,
    hideActions = false,
}: ConstructionUpdateCardProps) {

    const {action, setAction, entity: update, hideAfterDeletion, onDelete, onRestore} = useEntityCard({
        entityProp: updateProp,
        onDeleteProp,
        onRestoreProp,
    });

    const {read, restore} = useAccess("constructionUpdates");

    if (hideAfterDeletion || !restore) {
        return <></>;
    }
    if (!read || !Object.keys(read).length) {
        return <HiddenElement />;
    }

    const editPath = buildEditPath(update);
    const formattedDate = formatUpdateDate(update.updateDate);

    return (
        <>
            <EntityCardShell onClick={() => setAction("view")}>
                <EntityTextCardHeader
                    title={update.title}
                    subtitle={update.name}
                    badges={
                        <>
                            {formattedDate ? (
                                <TooltipDisplayer tooltip={resolveLanguageKey("fields.updateDate") as string}>
                                    <Badge variant="outline" className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                        <IconCalendar className="h-3 w-3" />
                                        {formattedDate}
                                    </Badge>
                                </TooltipDisplayer>
                            ) : null}
                            {update.progressPercent != null ? (
                                <TooltipDisplayer tooltip={resolveLanguageKey("fields.progressPercent") as string}>
                                    <Badge
                                        variant="outline"
                                        className={cn("text-xs font-semibold tabular-nums", progressBadgeClass(update.progressPercent))}
                                    >
                                        {update.progressPercent}%
                                    </Badge>
                                </TooltipDisplayer>
                            ) : null}
                        </>
                    }
                    showTitle={!!read?.title}
                    showSubtitle={!!read?.name}
                    showBadges={!!(read?.updateDate || read?.progressPercent)}
                    hideActions={hideActions}
                    actionMenu={
                        <ActionMenu accessModel="constructionUpdates" deletedData={update} onAction={(a: string) => setAction(a)} editPath={editPath} />
                    }
                />
                <Separator />
                <div className={CARD_BODY_CLASS}>
                    <div className={CARD_INFO_ROWS_CLASS}>
                        <InfoRow
                            icon={IconBuilding}
                            label={resolveLanguageKey("fields.project")}
                            show={!!read?.project}
                            value={update.project?.name}
                        />
                        <InfoRow
                            icon={IconStack2}
                            label={resolveLanguageKey("fields.edifice")}
                            show={!!read?.edifice}
                            value={update.edifice?.name}
                        />
                    </div>
                </div>
            </EntityCardShell>

            {!!action && (
                <>
                    {action === "view" && (
                        <ConstructionUpdateSheetView
                            open={action === "view"}
                            onOpenChange={() => setAction("")}
                            constructionUpdate={update}
                            onDelete={onDelete}
                            onRestore={onRestore}
                        />
                    )}
                    {action === "delete" && (
                        <DeleteAction
                            accessModel="constructionUpdates"
                            deleteId={update._id}
                            openAlert={action === "delete"}
                            name={read?.title && update.title}
                            confirmName={read?.title && update.title}
                            onSuccess={onDelete}
                            onCancel={() => setAction("")}
                            url="/api/realEstate/constructionUpdate"
                        />
                    )}
                    {action === "restore" && (
                        <RestoreAction
                            accessModel="constructionUpdates"
                            deleteId={update._id}
                            openAlert={action === "restore"}
                            name={read?.title && update.title}
                            confirmName={read?.title && update.title}
                            onSuccess={onRestore}
                            onCancel={() => setAction("")}
                            url="/api/realEstate/constructionUpdate/restore"
                        />
                    )}
                </>
            )}
        </>
    );
}

export default compose(
    (Component: any) => withDeletedDrawer(Component, (props: any) => props.constructionUpdate),
    withLanguage("src/modules/propertyManagement/clients/panel/private/constructionUpdates/center/cardView/constructionUpdateCard.tsx"),
    withDebug(true, true),
)(ConstructionUpdateCard);
