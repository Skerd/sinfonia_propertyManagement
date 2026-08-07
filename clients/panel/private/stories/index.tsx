import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {BookOpen} from "lucide-react";
import EntityListPage from "@coreModule/components/entityPage/EntityListPage.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import {GRID_COLS_MAX_4, GRID_TRANSACTIONAL} from "@propertyManagementModule/components/custom/cards/entityCard.constants.ts";
import {buildPageTitle} from "@coreModule/helpers/general";
import type {Story} from "armonia/src/modules/propertyManagement/api/realEstate/private/story/story.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import StoryCard from "@propertyManagementModule/clients/panel/private/stories/center/cardView/storyCard.tsx";

interface AllStoriesProps extends WithLanguageType {
    projectId?: string;
    projectName?: string;
}

function buildEditPath(story: Story) {
    const params = new URLSearchParams();
    params.set("storyId", story._id);
    if (story.name) params.set("storyName", story.name);
    if (story.project?._id) params.set("projectId", story.project._id);
    if (story.project?.name) params.set("projectName", story.project.name);
    return `/realEstate/stories/edit?${params.toString()}`;
}

function AllStories({resolveLanguageKey, projectId, projectName}: AllStoriesProps) {
    const extraFilters = projectId ? {projectId} : undefined;
    const headerTitle = buildPageTitle(
        String(resolveLanguageKey("title")),
        projectName ? [projectName] : [],
    );

    return (
        <EntityListPage<Story>
            apiUrl="/api/realEstate/story"
            collectionName="stories"
            accessModel="stories"
            tableConfigKey="stories"
            createPath={
                projectId
                    ? `/realEstate/stories/create?projectId=${projectId}${projectName ? `&projectName=${encodeURIComponent(projectName)}` : ""}`
                    : "/realEstate/stories/create"
            }
            createIcon={<BookOpen className="h-4 w-4" />}
            createLanguageKey="createStory"
            buildEditPath={buildEditPath}
            resolveLanguageKey={resolveLanguageKey}
            sheetLanguagePath="src/modules/propertyManagement/clients/panel/private/stories/center/sheetView/storySheetView.tsx"
            cardViewClassName={cn(GRID_TRANSACTIONAL, GRID_COLS_MAX_4)}
            extraFilters={extraFilters}
            headerTitle={headerTitle}
            renderCard={(story, onDelete, onRestore) => (
                <StoryCard
                    story={story}
                    onDelete={(row: Story | undefined, response?: DeletedData) => onDelete(row, response)}
                    onRestore={() => onRestore(story)}
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/stories/index.tsx"),
    withDebug(true, true),
)(AllStories);
