import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage from "@coreModule/components/entityPage/EntityListPage.tsx";
import {GRID_TRANSACTIONAL} from "@propertyManagementModule/components/custom/cards/entityCard.constants.ts";
import {IconPlus} from "@tabler/icons-react";
import type {CostCommitment} from "armonia/src/modules/propertyManagement/api/realEstate/private/costCommitment/costCommitment.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import CostCommitmentCard from "@propertyManagementModule/clients/panel/private/costCommitments/center/cardView/costCommitmentCard.tsx";

interface Props extends WithLanguageType {
    projectId?: string;
    projectName?: string;
}

function buildEditPath(row: CostCommitment) {
    const params = new URLSearchParams();
    params.set("costCommitmentId", row._id);
    if (row.name) params.set("costCommitmentName", row.name);
    return `/realEstate/costCommitments/edit?${params.toString()}`;
}

function AllCostCommitments({resolveLanguageKey, projectId}: Props) {
    return (
        <EntityListPage<CostCommitment>
            apiUrl="/api/realEstate/costCommitment"
            collectionName="costcommitments"
            accessModel="costcommitments"
            tableConfigKey="costcommitments"
            createPath="/realEstate/costCommitments/create"
            createIcon={<IconPlus className="h-4 w-4" />}
            createLanguageKey="createCostCommitment"
            buildEditPath={buildEditPath}
            resolveLanguageKey={resolveLanguageKey}
            sheetLanguagePath="src/modules/propertyManagement/clients/panel/private/costCommitments/center/sheetView/costCommitmentSheetView.tsx"
            cardViewClassName={GRID_TRANSACTIONAL}
            extraFilters={projectId ? {projectId} : undefined}
            renderCard={(row, onDelete, onRestore) => (
                <CostCommitmentCard
                    entity={row}
                    onDelete={(r: CostCommitment | undefined, response?: DeletedData) => onDelete(r, response)}
                    onRestore={() => onRestore(row)}
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/costCommitments/index.tsx"),
    withDebug(true, true, "costcommitments"),
)(AllCostCommitments);
