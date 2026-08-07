import {compose} from "redux";
import {InfoRowGroup} from "@coreModule/components/custom/infoRowGroup.tsx";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import HiddenElement from "@coreModule/components/custom/hiddenElement.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import TooltipDisplayer from "@coreModule/components/custom/tooltipDisplayer.tsx";
import type {Story} from "armonia/src/modules/propertyManagement/api/realEstate/private/story/story.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import {Separator} from "@coreModule/components/ui/separator.tsx";
import {Badge} from "@coreModule/components/ui/badge.tsx";
import {withDeletedDrawer} from "@coreModule/helpers/hocs/withDeletedDrawer.tsx";
import InfoRow from "@coreModule/components/custom/infoRow.tsx";
import {IconBuilding, IconCalendar, IconLabel, IconStack2} from "@tabler/icons-react";
import {DoorOpen} from "lucide-react";
import StorySheetView from "@propertyManagementModule/clients/panel/private/stories/center/sheetView/storySheetView.tsx";
import DeleteAction from "@coreModule/components/custom/actions/deleteAction.tsx";
import RestoreAction from "@coreModule/components/custom/actions/restoreAction.tsx";
import ActionMenu from "@coreModule/components/custom/actions/menu/actionMenu.tsx";
import CopyTooltip from "@coreModule/components/custom/copyTooltip.tsx";
import {useEntityCard} from "@coreModule/helpers/hooks/useEntityCard.ts";
import {EntityCardShell} from "@propertyManagementModule/components/custom/cards/EntityCardShell.tsx";
import {EntityTextCardHeader} from "@propertyManagementModule/components/custom/cards/EntityTextCardHeader.tsx";
import {
    CARD_BODY_CLASS,
    STATUS_BADGE_INFO,
    STATUS_BADGE_SUCCESS,
} from "@propertyManagementModule/components/custom/cards/entityCard.constants.ts";

type StoryCardProps = WithLanguageType & {
    story: Story;
    onDelete?: (deletedStory?: Story, response?: DeletedData) => void;
    onRestore?: () => void;
    hideActions?: boolean;
};

function buildEditPath(story: Story) {
    const params = new URLSearchParams();
    params.set("storyId", story._id);
    if (story.name) params.set("storyName", story.name);
    if (story.project?._id) params.set("projectId", story.project._id);
    if (story.project?.name) params.set("projectName", story.project.name);
    return `/realEstate/stories/edit?${params.toString()}`;
}

function formatPublishedAt(value?: string) {
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

function StoryCard({
    story: storyProp,
    resolveLanguageKey,
    onDelete: onDeleteProp,
    onRestore: onRestoreProp,
    hideActions = false,
}: StoryCardProps) {
    const {action, setAction, entity: story, hideAfterDeletion, onDelete, onRestore} = useEntityCard({
        entityProp: storyProp,
        onDeleteProp,
        onRestoreProp,
    });

    const {read, restore} = useAccess("stories");

    if (hideAfterDeletion || !restore) {
        return <></>;
    }
    if (!read || !Object.keys(read).length) {
        return <HiddenElement />;
    }

    const editPath = buildEditPath(story);
    const formattedDate = formatPublishedAt(story.publishedAt);

    return (
        <>
            <EntityCardShell onClick={() => setAction("view")}>
                <EntityTextCardHeader
                    title={
                        <span className="flex min-w-0 items-center gap-1">
                            <span className="truncate">{story.title}</span>
                            {!!read?.name && story.name ? <CopyTooltip text={story.name} /> : null}
                        </span>
                    }
                    badges={
                        <>
                            {read?.published ? (
                                <TooltipDisplayer tooltip={resolveLanguageKey("fields.published") as string}>
                                    <Badge
                                        variant="outline"
                                        className={
                                            story.published
                                                ? STATUS_BADGE_SUCCESS
                                                : STATUS_BADGE_INFO
                                        }
                                    >
                                        {story.published
                                            ? (resolveLanguageKey("published") as string)
                                            : (resolveLanguageKey("draft") as string)}
                                    </Badge>
                                </TooltipDisplayer>
                            ) : null}
                            {formattedDate ? (
                                <TooltipDisplayer tooltip={resolveLanguageKey("fields.publishedAt") as string}>
                                    <Badge variant="outline" className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                        <IconCalendar className="h-3 w-3 shrink-0" />
                                        {formattedDate}
                                    </Badge>
                                </TooltipDisplayer>
                            ) : null}
                        </>
                    }
                    showTitle={!!read?.title}
                    showBadges={!!(read?.published || read?.publishedAt)}
                    hideActions={hideActions}
                    actionMenu={
                        <ActionMenu accessModel="stories" deletedData={story} onAction={(a: string) => setAction(a)} editPath={editPath} />
                    }
                />
                <Separator />
                <div className={CARD_BODY_CLASS}>
                    <InfoRowGroup>
                        <InfoRow
                            icon={IconLabel}
                            label={resolveLanguageKey("fields.name")}
                            show={!!read?.name}
                            value={story.name}
                        />
                        <InfoRow
                            icon={IconBuilding}
                            label={resolveLanguageKey("fields.project")}
                            show={!!read?.project}
                            value={story.project?.name}
                        />
                        <InfoRow
                            icon={IconStack2}
                            label={resolveLanguageKey("fields.edifice")}
                            show={!!read?.edifice}
                            value={story.edifice?.name}
                        />
                        <InfoRow
                            icon={DoorOpen}
                            label={resolveLanguageKey("fields.unit")}
                            show={!!read?.unit}
                            value={story.unit?.name ?? story.unit?.unitNumber}
                        />
                    </InfoRowGroup>
                </div>
            </EntityCardShell>

            {!!action && (
                <>
                    {action === "view" && (
                        <StorySheetView
                            open={action === "view"}
                            onOpenChange={() => setAction("")}
                            story={story}
                            onDelete={onDelete}
                            onRestore={onRestore}
                        />
                    )}
                    {action === "delete" && (
                        <DeleteAction
                            accessModel="stories"
                            deleteId={story._id}
                            openAlert={action === "delete"}
                            name={read?.title && story.title}
                            confirmName={read?.title && story.title}
                            onSuccess={onDelete}
                            onCancel={() => setAction("")}
                            url="/api/realEstate/story"
                        />
                    )}
                    {action === "restore" && (
                        <RestoreAction
                            accessModel="stories"
                            deleteId={story._id}
                            openAlert={action === "restore"}
                            name={read?.title && story.title}
                            confirmName={read?.title && story.title}
                            onSuccess={onRestore}
                            onCancel={() => setAction("")}
                            url="/api/realEstate/story/restore"
                        />
                    )}
                </>
            )}
        </>
    );
}

export default compose(
    (Component: any) => withDeletedDrawer(Component, (props: any) => props.story),
    withLanguage("src/modules/propertyManagement/clients/panel/private/stories/center/cardView/storyCard.tsx"),
    withDebug(true, true),
)(StoryCard);
