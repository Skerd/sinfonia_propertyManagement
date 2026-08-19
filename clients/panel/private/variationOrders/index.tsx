import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage from "@coreModule/components/entityPage/EntityListPage.tsx";
import {GRID_TRANSACTIONAL} from "@propertyManagementModule/components/custom/cards/entityCard.constants.ts";
import {IconPlus} from "@tabler/icons-react";
import type {VariationOrder} from "armonia/src/modules/propertyManagement/api/realEstate/private/variationOrder/variationOrder.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import VariationOrderCard from "@propertyManagementModule/clients/panel/private/variationOrders/center/cardView/variationOrderCard.tsx";

interface Props extends WithLanguageType {
    projectId?: string;
    projectName?: string;
}

function buildEditPath(row: VariationOrder) {
    const params = new URLSearchParams();
    params.set("variationOrderId", row._id);
    if (row.name) params.set("variationOrderName", row.name);
    return `/realEstate/variationOrders/edit?${params.toString()}`;
}

function AllVariationOrders({resolveLanguageKey, projectId}: Props) {
    return (
        <EntityListPage<VariationOrder>
            apiUrl="/api/realEstate/variationOrder"
            collectionName="variationorders"
            accessModel="variationorders"
            tableConfigKey="variationorders"
            createPath="/realEstate/variationOrders/create"
            createIcon={<IconPlus className="h-4 w-4" />}
            createLanguageKey="createVariationOrder"
            buildEditPath={buildEditPath}
            resolveLanguageKey={resolveLanguageKey}
            sheetLanguagePath="src/modules/propertyManagement/clients/panel/private/variationOrders/center/sheetView/variationOrderSheetView.tsx"
            cardViewClassName={GRID_TRANSACTIONAL}
            extraFilters={projectId ? {projectId} : undefined}
            renderCard={(row, onDelete, onRestore) => (
                <VariationOrderCard
                    entity={row}
                    onDelete={(r: VariationOrder | undefined, response?: DeletedData) => onDelete(r, response)}
                    onRestore={() => onRestore(row)}
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/variationOrders/index.tsx"),
    withDebug(true, true, "variationorders"),
)(AllVariationOrders);
