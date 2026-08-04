import {compose} from "redux";
import {useState} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {IconBackhoe} from "@tabler/icons-react";
import EntityListPage from "@coreModule/components/entityPage/EntityListPage.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import {GRID_COLS_MAX_4, GRID_TRANSACTIONAL} from "@propertyManagementModule/components/custom/cards/entityCard.constants.ts";
import {buildPageTitle} from "@coreModule/helpers/general";
import type {ConstructionUpdate} from "armonia/src/modules/propertyManagement/api/realEstate/private/constructionUpdate/constructionUpdate.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import ConstructionUpdateCard from "@propertyManagementModule/clients/panel/private/constructionUpdates/center/cardView/constructionUpdateCard.tsx";
import ConstructionUpdatesTimelineSection from "@propertyManagementModule/clients/panel/private/constructionUpdates/center/timeline/constructionUpdatesTimelineSection.tsx";
import ConstructionUpdateSheetView from "@propertyManagementModule/clients/panel/private/constructionUpdates/center/sheetView/constructionUpdateSheetView.tsx";

interface AllConstructionUpdatesProps extends WithLanguageType {
    projectId?: string;
    projectName?: string;
}

function buildEditPath(update: ConstructionUpdate) {
    const params = new URLSearchParams();
    params.set("constructionUpdateId", update._id);
    if (update.name) params.set("constructionUpdateName", update.name);
    if (update.project?._id) params.set("projectId", update.project._id);
    if (update.project?.name) params.set("projectName", update.project.name);
    return `/realEstate/constructionUpdates/edit?${params.toString()}`;
}

function AllConstructionUpdates({resolveLanguageKey, projectId, projectName}: AllConstructionUpdatesProps) {
    const extraFilters = projectId ? {projectId} : undefined;
    const headerTitle = buildPageTitle(
        String(resolveLanguageKey("title")),
        projectName ? [projectName] : [],
    );
    const [sheetUpdate, setSheetUpdate] = useState<ConstructionUpdate | null>(null);

    return (
        <>
            <EntityListPage<ConstructionUpdate>
                apiUrl="/api/realEstate/constructionUpdate"
                collectionName="constructionupdates"
                accessModel="constructionUpdates"
                tableConfigKey="constructionupdates"
                createPath={projectId ? `/realEstate/constructionUpdates/create?projectId=${projectId}${projectName ? `&projectName=${encodeURIComponent(projectName)}` : ""}` : "/realEstate/constructionUpdates/create"}
                createIcon={<IconBackhoe className="h-4 w-4" />}
                createLanguageKey="createConstructionUpdate"
                buildEditPath={buildEditPath}
                resolveLanguageKey={resolveLanguageKey}
                sheetLanguagePath="src/modules/propertyManagement/clients/panel/private/constructionUpdates/center/sheetView/constructionUpdateSheetView.tsx"
                cardViewClassName={cn(GRID_TRANSACTIONAL, GRID_COLS_MAX_4)}
                extraFilters={extraFilters}
                headerTitle={headerTitle}
                aboveToolbar={(
                    <ConstructionUpdatesTimelineSection
                        projectId={projectId}
                        onSelectUpdate={setSheetUpdate}
                    />
                )}
                renderCard={(update, onDelete, onRestore) => (
                    <ConstructionUpdateCard
                        constructionUpdate={update}
                        onDelete={(row: ConstructionUpdate | undefined, response?: DeletedData) => onDelete(row, response)}
                        onRestore={() => onRestore(update)}
                    />
                )}
            />

            {
                sheetUpdate &&
                <ConstructionUpdateSheetView
                    open={!!sheetUpdate}
                    onOpenChange={(open: boolean) => { if (!open) setSheetUpdate(null); }}
                    constructionUpdate={sheetUpdate}
                />
            }
        </>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/constructionUpdates/index.tsx"),
    withDebug(true, true),
)(AllConstructionUpdates);
