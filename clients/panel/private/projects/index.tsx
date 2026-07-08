import {compose} from "redux";
import {useMemo} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {IconFolderPlus} from "@tabler/icons-react";
import {Project} from "armonia/src/modules/propertyManagement/api/realEstate/private/project/project.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import ProjectCard from "@propertyManagementModule/clients/panel/private/projects/center/cardView/projectCard.tsx";
import ViewEdifices from "@propertyManagementModule/clients/panel/private/projects/center/actions/viewEdifices.tsx";
import ViewEdificesOverlay from "@propertyManagementModule/clients/panel/private/projects/center/actions/viewEdificesOverlay.tsx";
import EdificesOverlay from "@propertyManagementModule/components/custom/projects/edificesOverlay.tsx";
import EntityListPage, {type QuickFilterDef} from "@coreModule/components/entityPage/EntityListPage.tsx";
import {GRID_HIERARCHY} from "@propertyManagementModule/components/custom/cards/entityCard.constants.ts";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import {COLUMN_TYPE} from "armonia/src/modules/core/database/filter/typeOperators";

function AllProjects({resolveLanguageKey}: WithLanguageType) {
    const {read: readEdifices} = useAccess("edifices");

    const quickFilters = useMemo<QuickFilterDef[]>(() => [
        {
            field: "name",
            label: resolveLanguageKey("fields.name") as string,
            type: COLUMN_TYPE.STRING,
        },
    ], [resolveLanguageKey]);

    return (
        <EntityListPage<Project>
            apiUrl="/api/realEstate/project"
            collectionName="projects"
            accessModel="projects"
            tableConfigKey="projects"
            createPath="/realEstate/projects/create"
            createIcon={<IconFolderPlus />}
            createLanguageKey="createProject"
            buildEditPath={(project: Project) => {
                const params = new URLSearchParams();
                params.set("projectId", project._id ?? "");
                if (project.name) params.set("projectName", project.name);
                return `/realEstate/projects/edit?${params.toString()}`;
            }}
            resolveLanguageKey={resolveLanguageKey}
            quickFilters={quickFilters}
            sheetLanguagePath="src/modules/propertyManagement/clients/panel/private/projects/center/sheetView/projectSheetView.tsx"
            cardViewClassName={GRID_HIERARCHY}
            rowActionMenu={{allowMenuForCustomChildren: !!readEdifices}}
            renderCard={(project, onDelete, onRestore) => (
                <ProjectCard
                    project={project}
                    onDelete={(row: Project | undefined, response?: DeletedData) => onDelete(row, response)}
                    onRestore={() => onRestore(project)}
                />
            )}
            renderActionMenuChildren={(project, bindRowAction) => (
                <>
                    <ViewEdifices project={project} />
                    <ViewEdificesOverlay onAction={bindRowAction} />
                </>
            )}
            renderFloatingModals={({action, entity, resetAction}) =>
                action === "viewEdificesOverlay" ? (
                    <EdificesOverlay
                        project={entity}
                        openEdificesOverlay={true}
                        onClose={resetAction}
                    />
                ) : null
            }
        />
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/projects/index.tsx"),
    withDebug(true, true),
)(AllProjects);
