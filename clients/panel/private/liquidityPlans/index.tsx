import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage from "@coreModule/components/entityPage/EntityListPage.tsx";
import {GRID_TRANSACTIONAL_WIDE} from "@propertyManagementModule/components/custom/cards/entityCard.constants.ts";
import {IconPlus} from "@tabler/icons-react";
import type {LiquidityPlan} from "armonia/src/modules/propertyManagement/api/realEstate/private/liquidityPlan/liquidityPlan.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import LiquidityPlanCard from "@propertyManagementModule/clients/panel/private/liquidityPlans/center/cardView/liquidityPlanCard.tsx";

interface Props extends WithLanguageType {}

function buildEditPath(row: LiquidityPlan) {
    const params = new URLSearchParams();
    params.set("liquidityPlanId", row._id);
    if (row.name) params.set("liquidityPlanName", row.name);
    return `/realEstate/liquidityPlans/edit?${params.toString()}`;
}

function AllLiquidityPlans({resolveLanguageKey}: Props) {
    return (
        <EntityListPage<LiquidityPlan>
            apiUrl="/api/realEstate/liquidityPlan"
            collectionName="liquidityplans"
            accessModel="liquidityplans"
            tableConfigKey="liquidityplans"
            createPath="/realEstate/liquidityPlans/create"
            createIcon={<IconPlus className="h-4 w-4" />}
            createLanguageKey="createLiquidityPlan"
            buildEditPath={buildEditPath}
            resolveLanguageKey={resolveLanguageKey}
            sheetLanguagePath="src/modules/propertyManagement/clients/panel/private/liquidityPlans/center/sheetView/liquidityPlanSheetView.tsx"
            cardViewClassName={GRID_TRANSACTIONAL_WIDE}
            renderCard={(row, onDelete, onRestore) => (
                <LiquidityPlanCard
                    entity={row}
                    onDelete={(r: LiquidityPlan | undefined, response?: DeletedData) => onDelete(r, response)}
                    onRestore={() => onRestore(row)}
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/liquidityPlans/index.tsx"),
    withDebug(true, true),
)(AllLiquidityPlans);
