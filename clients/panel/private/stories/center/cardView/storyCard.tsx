import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import type {Story} from "armonia/src/modules/propertyManagement/api/realEstate/private/story/story.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import {IconBuilding, IconCalendar, IconStack2, IconDoorEnter} from "@tabler/icons-react";
import StorySheetView from "@propertyManagementModule/clients/panel/private/stories/center/sheetView/storySheetView.tsx";
import CopyTooltip from "@coreModule/components/custom/copyTooltip.tsx";
import {Badge} from "@coreModule/components/ui/badge.tsx";
import {AccessGatedGalleryCarousel} from "@coreModule/components/viewEngine/widgets/gallery/galleryCarousel.tsx";
import EntityCardRow from "@coreModule/components/entityPage/list/card/entityCardRow.tsx";
import EntityCard from "@coreModule/components/entityPage/list/card/entityCard.tsx";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {RefObject} from "react";

function storyEditPath(story: Story) {
    const params = new URLSearchParams();
    params.set("storyId", story._id);
    if (story.name) params.set("storyName", story.name);
    if (story.project?._id) params.set("projectId", story.project._id);
    if (story.project?.name) params.set("projectName", story.project.name);
    return `/realEstate/stories/edit?${params.toString()}`;
}

type StoryCardProps = WithLanguageType & {
    story: Story;
    fetchId?: string;
    hideActions?: boolean;
    onDelete?: (deletedStory?: Story, response?: DeletedData) => void;
    onRestore?: () => void;
    sheetOnly?: boolean;
    innerRef?: RefObject<WithAxiosLifecycleRef<Story> | null>;
};

function StoryCard({
    story,
    resolveLanguageKey,
    fetchId,
    hideActions = false,
    onDelete,
    onRestore,
    sheetOnly = false,
    innerRef,
}: StoryCardProps) {
    return (
        <EntityCard
            resource="stories"
            entity={story}
            fetchId={fetchId}
            singleUrl="/api/realEstate/story/single"
            onDelete={onDelete}
            onRestore={onRestore}
            hideActions={hideActions}
            sheetOnly={sheetOnly}
            editPath={storyEditPath}
            Sheet={StorySheetView}
            sheetEntityProp="story"
            deleteUrl="/api/realEstate/story"
            restoreUrl="/api/realEstate/story/restore"
            failedTitle={resolveLanguageKey("failedTitle")}
            failedDescription={resolveLanguageKey("failedDescription")}
            titlePath="title"
            innerRef={innerRef}
            sheetProps={() => ({fetchId})}
        >
            {({entity, read}) => (
                <>
                    {/* The story's own pictures lead the card (UX-02). */}
                    <div className="-mx-(--density-pad) -mt-(--density-pad) w-[calc(100%+2*var(--density-pad))]">
                        <AccessGatedGalleryCarousel
                            read={read}
                            mainImage={entity.mainImage}
                            imageGallery={entity.imageGallery || []}
                            videoGallery={entity.videoGallery || []}
                            showThumbnails={false}
                            allowFullScreen={false}
                            coverAfterFirst
                        />
                    </div>
                    <EntityCard.Header
                        titlePath="title"
                        title={
                            <span className="flex min-w-0 items-center gap-1">
                                <span className="truncate">{entity.title}</span>
                                {entity.name ? <CopyTooltip text={entity.name} /> : null}
                            </span>
                        }
                        // Only the exception is shown: a published story needs no badge (UX-02).
                        badges={entity.published === false ? <Badge variant="secondary" className="text-xs">{resolveLanguageKey("unpublished")}</Badge> : undefined}
                    />
                    <EntityCard.Body>
                        {entity.project?.name ? (
                            <EntityCardRow
                                icon={IconBuilding}
                                label={resolveLanguageKey("fields.project")}
                                tooltip={resolveLanguageKey("fields.project")}
                                path="project.name"
                                value={entity.project?.name}
                            />
                        ) : null}
                        {entity.edifice?.name ? (
                            <EntityCardRow
                                icon={IconStack2}
                                label={resolveLanguageKey("fields.edifice")}
                                tooltip={resolveLanguageKey("fields.edifice")}
                                path="edifice.name"
                                value={entity.edifice?.name}
                            />
                        ) : null}
                        {entity.unit ? (
                            <EntityCardRow
                                icon={IconDoorEnter}
                                label={resolveLanguageKey("fields.unit")}
                                tooltip={resolveLanguageKey("fields.unit")}
                                path="unit"
                                value={entity.unit?.name ?? entity.unit?.unitNumber}
                            />
                        ) : null}
                        {entity.publishedAt ? (
                            <EntityCardRow
                                icon={IconCalendar}
                                label={resolveLanguageKey("fields.publishedAt")}
                                tooltip={resolveLanguageKey("fields.publishedAt")}
                                path="publishedAt"
                                type="dateTime"
                                value={entity.publishedAt}
                            />
                        ) : null}
                    </EntityCard.Body>
                </>
            )}
        </EntityCard>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/stories/center/cardView/storyCard.tsx"),
    withDebug(true, true, "stories"),
)(StoryCard);
