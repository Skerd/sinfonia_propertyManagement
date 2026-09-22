import {compose} from "redux";
import {useMemo, useState} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {IconBackhoe} from "@tabler/icons-react";
import EntityListPage, {type QuickFilterDef} from "@coreModule/components/entityPage/pages/entityListPage.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import {GRID_COLS_MAX_4, GRID_TRANSACTIONAL} from "@propertyManagementModule/components/custom/cards/entityCard.constants.ts";
import {buildPageTitle} from "@coreModule/helpers/general/pageTitle.ts";
import {COLUMN_TYPE} from "armonia/src/modules/core/database/filter/typeOperators";
import type {ConstructionProgress} from "armonia/src/modules/propertyManagement/api/realEstate/private/constructionProgress/constructionProgress.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import ConstructionProgressCard from "@propertyManagementModule/clients/panel/private/constructionProgress/center/cardView/constructionProgressCard.tsx";
import ConstructionProgressTimelineSection from "@propertyManagementModule/clients/panel/private/constructionProgress/center/timeline/constructionProgressTimelineSection.tsx";
import {CONSTRUCTION_PHASE_VALUES} from "armonia/src/modules/propertyManagement/api/realEstate/private/constructionProgress/constructionProgress.constants.ts";
import ConstructionProgressRowMenuExtras from "@propertyManagementModule/clients/panel/private/constructionProgress/center/actions/constructionProgressRowMenuExtras.tsx";
import ConstructionProgressSheetView from "@propertyManagementModule/clients/panel/private/constructionProgress/center/sheetView/constructionProgressSheetView.tsx";

interface AllConstructionProgressProps extends WithLanguageType {
    projectId?: string;
    projectName?: string;
    edificeId?: string;
    edificeName?: string;
}

function buildEditPath(update: ConstructionProgress) {
    const params = new URLSearchParams();
    params.set("constructionProgressId", update._id);
    if (update.name) params.set("constructionProgressName", update.name);
    if (update.project?._id) params.set("projectId", update.project._id);
    if (update.project?.name) params.set("projectName", update.project.name);
    return `/realEstate/constructionProgress/edit?${params.toString()}`;
}

function buildCreatePath(scope: {projectId?: string; projectName?: string; edificeId?: string}) {
    const params = new URLSearchParams();
    if (scope.projectId) params.set("projectId", scope.projectId);
    if (scope.projectName) params.set("projectName", scope.projectName);
    if (scope.edificeId) params.set("edificeId", scope.edificeId);
    const q = params.toString();
    return q ? `/realEstate/constructionProgress/create?${q}` : "/realEstate/constructionProgress/create";
}

function AllConstructionProgress({resolveLanguageKey, projectId, projectName, edificeId, edificeName}: AllConstructionProgressProps) {
    // Route scope (project / building pages) → `equals` rules in the list filter DSL.
    const extraFilters = useMemo(() => {
        const filters: Record<string, string> = {};
        if (projectId) filters.project = projectId;
        if (edificeId) filters.edifice = edificeId;
        return Object.keys(filters).length ? filters : undefined;
    }, [projectId, edificeId]);
    const headerTitle = buildPageTitle(
        String(resolveLanguageKey("title")),
        [projectName, edificeName].filter((n): n is string => !!n),
    );
    const [sheetUpdate, setSheetUpdate] = useState<ConstructionProgress | null>(null);

    const quickFilters = useMemo<QuickFilterDef[]>(() => [
        {
            field: "project",
            label: resolveLanguageKey("fields.project"),
            type: COLUMN_TYPE.OBJECT_ID,
            apiUrl: "/api/realEstate/project/select",
        },
        {
            field: "edifice",
            label: resolveLanguageKey("fields.edifice"),
            type: COLUMN_TYPE.OBJECT_ID,
            apiUrl: "/api/realEstate/edifice/select",
            dependsOn: "project",
        },
        {
            field: "phase",
            label: resolveLanguageKey("fields.phase"),
            type: COLUMN_TYPE.ENUM,
            enumValues: CONSTRUCTION_PHASE_VALUES.map((value) => ({
                value,
                label: resolveLanguageKey(`fields.!enums.phase.${value}`),
            })),
        },
    ], [resolveLanguageKey]);

    return (
        <>
            <EntityListPage<ConstructionProgress>
                apiUrl="/api/realEstate/constructionProgress"
                collectionName="constructionprogresses"
                accessModel="constructionprogresses"
                tableConfigKey="constructionprogresses"
                createPath={buildCreatePath({projectId, projectName, edificeId})}
                createIcon={<IconBackhoe className="h-4 w-4" />}
                createLanguageKey="createConstructionProgress"
                buildEditPath={buildEditPath}
                resolveLanguageKey={resolveLanguageKey}
                sheetLanguagePath="src/modules/propertyManagement/clients/panel/private/constructionProgress/center/sheetView/constructionProgressSheetView.tsx"
                cardViewClassName={cn(GRID_TRANSACTIONAL, GRID_COLS_MAX_4)}
                extraFilters={extraFilters}
                quickFilters={quickFilters}
                headerTitle={headerTitle}
                aboveToolbar={(
                    <ConstructionProgressTimelineSection
                        projectId={projectId}
                        edificeId={edificeId}
                        onSelectUpdate={setSheetUpdate}
                    />
                )}
                rowActionMenu={{allowMenuForCustomChildren: true}}
                renderActionMenuChildren={(update) => (
                    <ConstructionProgressRowMenuExtras constructionProgress={update} />
                )}
                renderCard={(update, onDelete, onRestore) => (
                    <ConstructionProgressCard
                        constructionProgress={update}
                        onDelete={(row: ConstructionProgress | undefined, response?: DeletedData) => onDelete(row, response)}
                        onRestore={() => onRestore(update)}
                    />
                )}
            />

            {
                sheetUpdate &&
                <ConstructionProgressSheetView
                    open={!!sheetUpdate}
                    onOpenChange={(open: boolean) => { if (!open) setSheetUpdate(null); }}
                    constructionProgress={sheetUpdate}
                />
            }
        </>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/constructionProgress/index.tsx"),
    withDebug(true, true, "constructionprogresses"),
)(AllConstructionProgress);
