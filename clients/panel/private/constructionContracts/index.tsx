import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage from "@coreModule/components/entityPage/EntityListPage.tsx";
import {GRID_TRANSACTIONAL} from "@propertyManagementModule/components/custom/cards/entityCard.constants.ts";
import {IconPlus} from "@tabler/icons-react";
import type {ConstructionContract} from "armonia/src/modules/propertyManagement/api/realEstate/private/constructionContract/constructionContract.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import ConstructionContractCard from "@propertyManagementModule/clients/panel/private/constructionContracts/center/cardView/constructionContractCard.tsx";

interface Props extends WithLanguageType {
    projectId?: string;
    projectName?: string;
}

function buildEditPath(row: ConstructionContract) {
    const params = new URLSearchParams();
    params.set("constructionContractId", row._id);
    if (row.name) params.set("constructionContractName", row.name);
    return `/realEstate/constructionContracts/edit?${params.toString()}`;
}

function AllConstructionContracts({resolveLanguageKey, projectId}: Props) {
    return (
        <EntityListPage<ConstructionContract>
            apiUrl="/api/realEstate/constructionContract"
            collectionName="constructioncontracts"
            accessModel="constructioncontracts"
            tableConfigKey="constructioncontracts"
            createPath="/realEstate/constructionContracts/create"
            createIcon={<IconPlus className="h-4 w-4" />}
            createLanguageKey="createConstructionContract"
            buildEditPath={buildEditPath}
            resolveLanguageKey={resolveLanguageKey}
            sheetLanguagePath="src/modules/propertyManagement/clients/panel/private/constructionContracts/center/sheetView/constructionContractSheetView.tsx"
            cardViewClassName={GRID_TRANSACTIONAL}
            extraFilters={projectId ? {projectId} : undefined}
            renderCard={(row, onDelete, onRestore) => (
                <ConstructionContractCard
                    entity={row}
                    onDelete={(r: ConstructionContract | undefined, response?: DeletedData) => onDelete(r, response)}
                    onRestore={() => onRestore(row)}
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/constructionContracts/index.tsx"),
    withDebug(true, true),
)(AllConstructionContracts);
