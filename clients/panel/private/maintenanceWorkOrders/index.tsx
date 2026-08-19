import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage from "@coreModule/components/entityPage/EntityListPage.tsx";
import {GRID_TRANSACTIONAL} from "@propertyManagementModule/components/custom/cards/entityCard.constants.ts";
import {IconPlus} from "@tabler/icons-react";
import type {MaintenanceWorkOrder} from "armonia/src/modules/propertyManagement/api/realEstate/private/maintenanceWorkOrder/maintenanceWorkOrder.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import MaintenanceWorkOrderCard from "@propertyManagementModule/clients/panel/private/maintenanceWorkOrders/center/cardView/maintenanceWorkOrderCard.tsx";

interface Props extends WithLanguageType {}

function buildEditPath(row: MaintenanceWorkOrder) {
    const params = new URLSearchParams();
    params.set("maintenanceWorkOrderId", row._id);
    if (row.name) params.set("maintenanceWorkOrderName", row.name);
    return `/realEstate/maintenanceWorkOrders/edit?${params.toString()}`;
}

function AllMaintenanceWorkOrders({resolveLanguageKey}: Props) {
    return (
        <EntityListPage<MaintenanceWorkOrder>
            apiUrl="/api/realEstate/maintenanceWorkOrder"
            collectionName="maintenanceworkorders"
            accessModel="maintenanceworkorders"
            tableConfigKey="maintenanceworkorders"
            createPath="/realEstate/maintenanceWorkOrders/create"
            createIcon={<IconPlus className="h-4 w-4" />}
            createLanguageKey="createMaintenanceWorkOrder"
            buildEditPath={buildEditPath}
            resolveLanguageKey={resolveLanguageKey}
            sheetLanguagePath="src/modules/propertyManagement/clients/panel/private/maintenanceWorkOrders/center/sheetView/maintenanceWorkOrderSheetView.tsx"
            cardViewClassName={GRID_TRANSACTIONAL}
            renderCard={(row, onDelete, onRestore) => (
                <MaintenanceWorkOrderCard
                    entity={row}
                    onDelete={(r: MaintenanceWorkOrder | undefined, response?: DeletedData) => onDelete(r, response)}
                    onRestore={() => onRestore(row)}
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/maintenanceWorkOrders/index.tsx"),
    withDebug(true, true, "maintenanceworkorders"),
)(AllMaintenanceWorkOrders);
