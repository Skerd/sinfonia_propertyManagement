import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage from "@coreModule/components/entityPage/EntityListPage.tsx";
import {GRID_TRANSACTIONAL} from "@propertyManagementModule/components/custom/cards/entityCard.constants.ts";
import {IconPlus} from "@tabler/icons-react";
import type {SpecificationItem} from "armonia/src/modules/propertyManagement/api/realEstate/private/specificationItem/specificationItem.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import SpecificationItemCard from "@propertyManagementModule/clients/panel/private/specificationItems/center/cardView/specificationItemCard.tsx";

interface Props extends WithLanguageType {
    specificationId?: string;
}

function buildEditPath(row: SpecificationItem) {
    const params = new URLSearchParams();
    params.set("specificationItemId", row._id);
    if (row.name) params.set("specificationItemName", row.name);
    return `/realEstate/specificationItems/edit?${params.toString()}`;
}

function AllSpecificationItems({resolveLanguageKey, specificationId}: Props) {
    return (
        <EntityListPage<SpecificationItem>
            apiUrl="/api/realEstate/specificationItem"
            collectionName="specificationitems"
            accessModel="specificationitems"
            tableConfigKey="specificationitems"
            createPath="/realEstate/specificationItems/create"
            createIcon={<IconPlus className="h-4 w-4" />}
            createLanguageKey="createSpecificationItem"
            buildEditPath={buildEditPath}
            resolveLanguageKey={resolveLanguageKey}
            sheetLanguagePath="src/modules/propertyManagement/clients/panel/private/specificationItems/center/sheetView/specificationItemSheetView.tsx"
            cardViewClassName={GRID_TRANSACTIONAL}
            extraFilters={specificationId ? {specificationId} : undefined}
            renderCard={(row, onDelete, onRestore) => (
                <SpecificationItemCard
                    entity={row}
                    onDelete={(r: SpecificationItem | undefined, response?: DeletedData) => onDelete(r, response)}
                    onRestore={() => onRestore(row)}
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/specificationItems/index.tsx"),
    withDebug(true, true, "specificationitems"),
)(AllSpecificationItems);
