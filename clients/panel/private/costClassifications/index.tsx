import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage from "@coreModule/components/entityPage/EntityListPage.tsx";
import {GRID_TRANSACTIONAL} from "@propertyManagementModule/components/custom/cards/entityCard.constants.ts";
import {IconPlus} from "@tabler/icons-react";
import type {CostClassification} from "armonia/src/modules/propertyManagement/api/realEstate/private/costClassification/costClassification.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import CostClassificationCard from "@propertyManagementModule/clients/panel/private/costClassifications/center/cardView/costClassificationCard.tsx";

interface Props extends WithLanguageType {}

function buildEditPath(row: CostClassification) {
    const params = new URLSearchParams();
    params.set("costClassificationId", row._id);
    if (row.name) params.set("costClassificationName", row.name);
    return `/realEstate/costClassifications/edit?${params.toString()}`;
}

function AllCostClassifications({resolveLanguageKey}: Props) {
    return (
        <EntityListPage<CostClassification>
            apiUrl="/api/realEstate/costClassification"
            collectionName="costclassifications"
            accessModel="costclassifications"
            tableConfigKey="costclassifications"
            createPath="/realEstate/costClassifications/create"
            createIcon={<IconPlus className="h-4 w-4" />}
            createLanguageKey="createCostClassification"
            buildEditPath={buildEditPath}
            resolveLanguageKey={resolveLanguageKey}
            sheetLanguagePath="src/modules/propertyManagement/clients/panel/private/costClassifications/center/sheetView/costClassificationSheetView.tsx"
            cardViewClassName={GRID_TRANSACTIONAL}
            renderCard={(row, onDelete, onRestore) => (
                <CostClassificationCard
                    entity={row}
                    onDelete={(r: CostClassification | undefined, response?: DeletedData) => onDelete(r, response)}
                    onRestore={() => onRestore(row)}
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/costClassifications/index.tsx"),
    withDebug(true, true),
)(AllCostClassifications);
