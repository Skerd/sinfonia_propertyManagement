import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage from "@coreModule/components/entityPage/EntityListPage.tsx";
import {GRID_TRANSACTIONAL} from "@propertyManagementModule/components/custom/cards/entityCard.constants.ts";
import {IconPlus} from "@tabler/icons-react";
import type {Budget} from "armonia/src/modules/propertyManagement/api/realEstate/private/budget/budget.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import BudgetCard from "@propertyManagementModule/clients/panel/private/budgets/center/cardView/budgetCard.tsx";

interface Props extends WithLanguageType {
    projectId?: string;
    projectName?: string;
}

function buildEditPath(row: Budget) {
    const params = new URLSearchParams();
    params.set("budgetId", row._id);
    if (row.name) params.set("budgetName", row.name);
    return `/realEstate/budgets/edit?${params.toString()}`;
}

function AllBudgets({resolveLanguageKey, projectId}: Props) {
    return (
        <EntityListPage<Budget>
            apiUrl="/api/realEstate/budget"
            collectionName="budgets"
            accessModel="budgets"
            tableConfigKey="budgets"
            createPath="/realEstate/budgets/create"
            createIcon={<IconPlus className="h-4 w-4" />}
            createLanguageKey="createBudget"
            buildEditPath={buildEditPath}
            resolveLanguageKey={resolveLanguageKey}
            sheetLanguagePath="src/modules/propertyManagement/clients/panel/private/budgets/center/sheetView/budgetSheetView.tsx"
            cardViewClassName={GRID_TRANSACTIONAL}
            extraFilters={projectId ? {projectId} : undefined}
            renderCard={(row, onDelete, onRestore) => (
                <BudgetCard
                    entity={row}
                    onDelete={(r: Budget | undefined, response?: DeletedData) => onDelete(r, response)}
                    onRestore={() => onRestore(row)}
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/budgets/index.tsx"),
    withDebug(true, true),
)(AllBudgets);
