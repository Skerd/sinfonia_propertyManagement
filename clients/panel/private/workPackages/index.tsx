import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage from "@coreModule/components/entityPage/EntityListPage.tsx";
import {GRID_TRANSACTIONAL_WIDE} from "@propertyManagementModule/components/custom/cards/entityCard.constants.ts";
import {IconPlus} from "@tabler/icons-react";
import type {WorkPackage} from "armonia/src/modules/propertyManagement/api/realEstate/private/workPackage/workPackage.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import WorkPackageCard from "@propertyManagementModule/clients/panel/private/workPackages/center/cardView/workPackageCard.tsx";

interface Props extends WithLanguageType {
    projectId?: string;
    projectName?: string;
}

function buildEditPath(row: WorkPackage) {
    const params = new URLSearchParams();
    params.set("workPackageId", row._id);
    if (row.name) params.set("workPackageName", row.name);
    return `/realEstate/workPackages/edit?${params.toString()}`;
}

function AllWorkPackages({resolveLanguageKey, projectId}: Props) {
    return (
        <EntityListPage<WorkPackage>
            apiUrl="/api/realEstate/workPackage"
            collectionName="workpackages"
            accessModel="workpackages"
            tableConfigKey="workpackages"
            createPath="/realEstate/workPackages/create"
            createIcon={<IconPlus className="h-4 w-4" />}
            createLanguageKey="createWorkPackage"
            buildEditPath={buildEditPath}
            resolveLanguageKey={resolveLanguageKey}
            sheetLanguagePath="src/modules/propertyManagement/clients/panel/private/workPackages/center/sheetView/workPackageSheetView.tsx"
            cardViewClassName={GRID_TRANSACTIONAL_WIDE}
            extraFilters={projectId ? {projectId} : undefined}
            renderCard={(row, onDelete, onRestore) => (
                <WorkPackageCard
                    entity={row}
                    onDelete={(r: WorkPackage | undefined, response?: DeletedData) => onDelete(r, response)}
                    onRestore={() => onRestore(row)}
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/workPackages/index.tsx"),
    withDebug(true, true),
)(AllWorkPackages);
