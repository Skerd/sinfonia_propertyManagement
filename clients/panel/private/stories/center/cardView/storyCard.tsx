import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import type {Story} from "armonia/src/modules/propertyManagement/api/realEstate/private/story/story.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import {IconBuilding, IconCalendar, IconLabel, IconStack2} from "@tabler/icons-react";
import {DoorOpen} from "lucide-react";
import StorySheetView from "@propertyManagementModule/clients/panel/private/stories/center/sheetView/storySheetView.tsx";
import CopyTooltip from "@coreModule/components/custom/copyTooltip.tsx";
import DisplayRow from "@coreModule/components/custom/displayValue/displayRow.tsx";
import EntityCard from "@coreModule/components/custom/systemCards/entityCard.tsx";
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
            failedTitle=""
            failedDescription=""
            titlePath="title"
            innerRef={innerRef}
            sheetProps={() => ({fetchId})}
        >
            {({entity}) => (
                <>
                    <EntityCard.Header
                        titlePath="title"
                        title={
                            <span className="flex min-w-0 items-center gap-1">
                                <span className="truncate">{entity.title}</span>
                                {entity.name ? <CopyTooltip text={entity.name} /> : null}
                            </span>
                        }
                    />
                    <EntityCard.Body>
                        <DisplayRow
                            icon={IconLabel}
                            label={resolveLanguageKey("fields.name")}
                            tooltip={resolveLanguageKey("fields.name")}
                            path="name"
                            value={entity.name}
                        />
                        <DisplayRow
                            icon={IconBuilding}
                            label={resolveLanguageKey("fields.project")}
                            tooltip={resolveLanguageKey("fields.project")}
                            path="project.name"
                            value={entity.project?.name}
                        />
                        <DisplayRow
                            icon={IconStack2}
                            label={resolveLanguageKey("fields.edifice")}
                            tooltip={resolveLanguageKey("fields.edifice")}
                            path="edifice.name"
                            value={entity.edifice?.name}
                        />
                        <DisplayRow
                            icon={DoorOpen}
                            label={resolveLanguageKey("fields.unit")}
                            tooltip={resolveLanguageKey("fields.unit")}
                            path="unit"
                            value={entity.unit?.name ?? entity.unit?.unitNumber}
                        />
                        <DisplayRow
                            icon={IconCalendar}
                            label={resolveLanguageKey("fields.publishedAt")}
                            tooltip={resolveLanguageKey("fields.publishedAt")}
                            path="publishedAt"
                            type="date"
                            value={entity.publishedAt}
                        />
                        <DisplayRow
                            icon={IconLabel}
                            label={resolveLanguageKey("fields.published")}
                            tooltip={resolveLanguageKey("fields.published")}
                            path="published"
                            type="boolean"
                            value={entity.published}
                        />
                    </EntityCard.Body>
                </>
            )}
        </EntityCard>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/stories/center/cardView/storyCard.tsx"),
    withDebug(true, true),
)(StoryCard);
