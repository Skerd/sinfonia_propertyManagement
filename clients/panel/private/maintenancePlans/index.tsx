import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage from "@coreModule/components/entityPage/EntityListPage.tsx";
import {GRID_TRANSACTIONAL_WIDE} from "@propertyManagementModule/components/custom/cards/entityCard.constants.ts";
import {IconPlus} from "@tabler/icons-react";
import type {MaintenancePlan} from "armonia/src/modules/propertyManagement/api/realEstate/private/maintenancePlan/maintenancePlan.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import MaintenancePlanCard from "@propertyManagementModule/clients/panel/private/maintenancePlans/center/cardView/maintenancePlanCard.tsx";

interface Props extends WithLanguageType {}

function buildEditPath(row: MaintenancePlan) {
    const params = new URLSearchParams();
    params.set("maintenancePlanId", row._id);
    if (row.name) params.set("maintenancePlanName", row.name);
    return `/realEstate/maintenancePlans/edit?${params.toString()}`;
}

function AllMaintenancePlans({resolveLanguageKey}: Props) {
    return (
        <EntityListPage<MaintenancePlan>
            apiUrl="/api/realEstate/maintenancePlan"
            collectionName="maintenanceplans"
            accessModel="maintenanceplans"
            tableConfigKey="maintenanceplans"
            createPath="/realEstate/maintenancePlans/create"
            createIcon={<IconPlus className="h-4 w-4" />}
            createLanguageKey="createMaintenancePlan"
            buildEditPath={buildEditPath}
            resolveLanguageKey={resolveLanguageKey}
            sheetLanguagePath="src/modules/propertyManagement/clients/panel/private/maintenancePlans/center/sheetView/maintenancePlanSheetView.tsx"
            cardViewClassName={GRID_TRANSACTIONAL_WIDE}
            renderCard={(row, onDelete, onRestore) => (
                <MaintenancePlanCard
                    entity={row}
                    onDelete={(r: MaintenancePlan | undefined, response?: DeletedData) => onDelete(r, response)}
                    onRestore={() => onRestore(row)}
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/maintenancePlans/index.tsx"),
    withDebug(true, true),
)(AllMaintenancePlans);
