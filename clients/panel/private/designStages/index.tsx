import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage from "@coreModule/components/entityPage/EntityListPage.tsx";
import {GRID_TRANSACTIONAL} from "@propertyManagementModule/components/custom/cards/entityCard.constants.ts";
import {IconPlus} from "@tabler/icons-react";
import type {DesignStage} from "armonia/src/modules/propertyManagement/api/realEstate/private/designStage/designStage.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import DesignStageCard from "@propertyManagementModule/clients/panel/private/designStages/center/cardView/designStageCard.tsx";

interface Props extends WithLanguageType {
    projectId?: string;
    projectName?: string;
}

function buildEditPath(row: DesignStage) {
    const params = new URLSearchParams();
    params.set("designStageId", row._id);
    if (row.name) params.set("designStageName", row.name);
    return `/realEstate/designStages/edit?${params.toString()}`;
}

function AllDesignStages({resolveLanguageKey, projectId}: Props) {
    return (
        <EntityListPage<DesignStage>
            apiUrl="/api/realEstate/designStage"
            collectionName="designstages"
            accessModel="designstages"
            tableConfigKey="designstages"
            createPath="/realEstate/designStages/create"
            createIcon={<IconPlus className="h-4 w-4" />}
            createLanguageKey="createDesignStage"
            buildEditPath={buildEditPath}
            resolveLanguageKey={resolveLanguageKey}
            sheetLanguagePath="src/modules/propertyManagement/clients/panel/private/designStages/center/sheetView/designStageSheetView.tsx"
            cardViewClassName={GRID_TRANSACTIONAL}
            extraFilters={projectId ? {projectId} : undefined}
            renderCard={(row, onDelete, onRestore) => (
                <DesignStageCard
                    entity={row}
                    onDelete={(r: DesignStage | undefined, response?: DeletedData) => onDelete(r, response)}
                    onRestore={() => onRestore(row)}
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/designStages/index.tsx"),
    withDebug(true, true, "designstages"),
)(AllDesignStages);
