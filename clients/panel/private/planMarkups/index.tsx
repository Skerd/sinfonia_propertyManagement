import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage from "@coreModule/components/entityPage/EntityListPage.tsx";
import {GRID_TRANSACTIONAL} from "@propertyManagementModule/components/custom/cards/entityCard.constants.ts";
import {IconPlus} from "@tabler/icons-react";
import type {PlanMarkup} from "armonia/src/modules/propertyManagement/api/realEstate/private/planMarkup/planMarkup.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import PlanMarkupCard from "@propertyManagementModule/clients/panel/private/planMarkups/center/cardView/planMarkupCard.tsx";

interface Props extends WithLanguageType {}

function buildEditPath(row: PlanMarkup) {
    const params = new URLSearchParams();
    params.set("planMarkupId", row._id);
    if (row.name) params.set("planMarkupName", row.name);
    return `/realEstate/planMarkups/edit?${params.toString()}`;
}

function AllPlanMarkups({resolveLanguageKey}: Props) {
    return (
        <EntityListPage<PlanMarkup>
            apiUrl="/api/realEstate/planMarkup"
            collectionName="planmarkups"
            accessModel="planmarkups"
            tableConfigKey="planmarkups"
            createPath="/realEstate/planMarkups/create"
            createIcon={<IconPlus className="h-4 w-4" />}
            createLanguageKey="createPlanMarkup"
            buildEditPath={buildEditPath}
            resolveLanguageKey={resolveLanguageKey}
            sheetLanguagePath="src/modules/propertyManagement/clients/panel/private/planMarkups/center/sheetView/planMarkupSheetView.tsx"
            cardViewClassName={GRID_TRANSACTIONAL}
            renderCard={(row, onDelete, onRestore) => (
                <PlanMarkupCard
                    entity={row}
                    onDelete={(r: PlanMarkup | undefined, response?: DeletedData) => onDelete(r, response)}
                    onRestore={() => onRestore(row)}
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/planMarkups/index.tsx"),
    withDebug(true, true),
)(AllPlanMarkups);
