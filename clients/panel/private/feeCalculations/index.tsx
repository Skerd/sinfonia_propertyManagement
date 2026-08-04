import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage from "@coreModule/components/entityPage/EntityListPage.tsx";
import {GRID_TRANSACTIONAL} from "@propertyManagementModule/components/custom/cards/entityCard.constants.ts";
import {IconPlus} from "@tabler/icons-react";
import type {FeeCalculation} from "armonia/src/modules/propertyManagement/api/realEstate/private/feeCalculation/feeCalculation.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import FeeCalculationCard from "@propertyManagementModule/clients/panel/private/feeCalculations/center/cardView/feeCalculationCard.tsx";

interface Props extends WithLanguageType {}

function buildEditPath(row: FeeCalculation) {
    const params = new URLSearchParams();
    params.set("feeCalculationId", row._id);
    if (row.name) params.set("feeCalculationName", row.name);
    return `/realEstate/feeCalculations/edit?${params.toString()}`;
}

function AllFeeCalculations({resolveLanguageKey}: Props) {
    return (
        <EntityListPage<FeeCalculation>
            apiUrl="/api/realEstate/feeCalculation"
            collectionName="feecalculations"
            accessModel="feecalculations"
            tableConfigKey="feecalculations"
            createPath="/realEstate/feeCalculations/create"
            createIcon={<IconPlus className="h-4 w-4" />}
            createLanguageKey="createFeeCalculation"
            buildEditPath={buildEditPath}
            resolveLanguageKey={resolveLanguageKey}
            sheetLanguagePath="src/modules/propertyManagement/clients/panel/private/feeCalculations/center/sheetView/feeCalculationSheetView.tsx"
            cardViewClassName={GRID_TRANSACTIONAL}
            renderCard={(row, onDelete, onRestore) => (
                <FeeCalculationCard
                    entity={row}
                    onDelete={(r: FeeCalculation | undefined, response?: DeletedData) => onDelete(r, response)}
                    onRestore={() => onRestore(row)}
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/feeCalculations/index.tsx"),
    withDebug(true, true),
)(AllFeeCalculations);
