import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import HiddenElement from "@coreModule/components/custom/hiddenElement.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import {useEntityCard} from "@coreModule/helpers/hooks/useEntityCard.ts";
import {Badge} from "@coreModule/components/ui/badge.tsx";
import {StoryType} from "armonia/src/modules/propertyManagement/api/realEstate/private/storyType/storyType.dto.ts";
import DeletedInfo from "@coreModule/components/custom/deletedInfo";
import {IconHash, IconListNumbers, IconStack2} from "@tabler/icons-react";
import StoryTypeSheetView from "@propertyManagementModule/clients/panel/private/storyTypes/center/sheetView/storyTypeSheetView.tsx";
import DeleteAction from "@coreModule/components/custom/actions/deleteAction.tsx";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import RestoreAction from "@coreModule/components/custom/actions/restoreAction.tsx";
import ActionMenu from "@coreModule/components/custom/actions/menu/actionMenu.tsx";
import {EntityCardShell} from "@propertyManagementModule/components/custom/cards/EntityCardShell.tsx";
import {EntityTextCardHeader} from "@propertyManagementModule/components/custom/cards/EntityTextCardHeader.tsx";

function storyTypeEditPath(storyType: StoryType) {
    const params = new URLSearchParams();
    params.set("storyTypeId", storyType._id);
    if (storyType.name) params.set("storyTypeName", storyType.name);
    return `/tenancy/systemSettings/storyTypes/edit?${params.toString()}`;
}

type StoryTypeCardProps = WithLanguageType & {
    storyType: StoryType;
    onDelete?: (deletedStoryType?: StoryType, response?: DeletedData) => void;
    onRestore?: () => void;
    hideActions?: boolean;
    sheetOnly?: boolean;
};

function StoryTypeCard({
    storyType: storyTypeProp,
    onDelete: onDeleteProp,
    onRestore: onRestoreProp,
    hideActions = false,
    sheetOnly = false,
}: StoryTypeCardProps) {
    const {action, setAction, entity: storyType, hideAfterDeletion, onDelete, onRestore} = useEntityCard({
        entityProp: storyTypeProp,
        onDeleteProp,
        onRestoreProp,
    });

    const {read, restore} = useAccess("storyTypes");

    if (hideAfterDeletion) {
        return <></>;
    }
    if (!restore && storyType.deletedAt != null) {
        return <></>;
    }
    if (!read || !Object.keys(read).length) {
        return <HiddenElement />;
    }

    return (
        <>
            {!sheetOnly && (
                <EntityCardShell onClick={() => setAction("view")}>
                    <div className="flex w-full items-stretch">
                        {(read.deletedBy || read.deletedAt) && (
                            <DeletedInfo deletedAt={storyType.deletedAt} deletedBy={storyType.deletedBy} />
                        )}
                        <div className="w-full min-w-0">
                            <EntityTextCardHeader
                                iconTile={
                                    <div className="flex items-center justify-center shrink-0 rounded-lg bg-muted/50 p-2">
                                        <IconStack2 className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                }
                                title={<span className="text-lg font-semibold truncate">{storyType.name}</span>}
                                showTitle={!!read?.name}
                                subtitle={
                                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <IconHash className="h-3 w-3 shrink-0" />
                                        {storyType.slug}
                                    </span>
                                }
                                showSubtitle={!!read?.slug}
                                badges={
                                    storyType.sortOrder != null ? (
                                        <Badge variant="secondary" className="text-xs font-medium gap-1">
                                            <IconListNumbers className="h-3 w-3" />
                                            {storyType.sortOrder}
                                        </Badge>
                                    ) : null
                                }
                                showBadges={!!read?.sortOrder && storyType.sortOrder != null}
                                hideActions={hideActions}
                                actionMenu={
                                    <ActionMenu
                                        accessModel="storyTypes"
                                        deletedData={storyType}
                                        onAction={(a: string) => setAction(a)}
                                        editPath={storyTypeEditPath(storyType)}
                                    />
                                }
                            />
                        </div>
                    </div>
                </EntityCardShell>
            )}

            {!!action && (
                <>
                    {action === "view" && (
                        <StoryTypeSheetView
                            open={action === "view"}
                            onOpenChange={() => setAction("")}
                            storyType={storyType}
                            onDelete={onDelete}
                            onRestore={onRestore}
                        />
                    )}
                    {action === "delete" && (
                        <DeleteAction
                            accessModel="storyTypes"
                            deleteId={storyType._id}
                            openAlert={action === "delete"}
                            name={read?.name && storyType.name}
                            confirmName={read?.name && storyType.name}
                            onSuccess={onDelete}
                            onCancel={() => setAction("")}
                            url="/api/realEstate/storyType"
                        />
                    )}
                    {action === "restore" && (
                        <RestoreAction
                            accessModel="storyTypes"
                            deleteId={storyType._id}
                            openAlert={action === "restore"}
                            name={read?.name && storyType.name}
                            confirmName={read?.name && storyType.name}
                            onSuccess={onRestore}
                            onCancel={() => setAction("")}
                            url="/api/realEstate/storyType/restore"
                        />
                    )}
                </>
            )}
        </>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/storyTypes/center/cardView/storyTypeCard.tsx"),
    withDebug(true, true),
)(StoryTypeCard);
