import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage from "@coreModule/components/entityPage/EntityListPage.tsx";
import {GRID_TRANSACTIONAL_WIDE} from "@propertyManagementModule/components/custom/cards/entityCard.constants.ts";
import {IconPlus} from "@tabler/icons-react";
import type {BimQuantity} from "armonia/src/modules/propertyManagement/api/realEstate/private/bimQuantity/bimQuantity.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import BimQuantityCard from "@propertyManagementModule/clients/panel/private/bimQuantities/center/cardView/bimQuantityCard.tsx";

interface Props extends WithLanguageType {}

function buildEditPath(row: BimQuantity) {
    const params = new URLSearchParams();
    params.set("bimQuantityId", row._id);
    if (row.name) params.set("bimQuantityName", row.name);
    return `/realEstate/bimQuantities/edit?${params.toString()}`;
}

function AllBimQuantitys({resolveLanguageKey}: Props) {
    return (
        <EntityListPage<BimQuantity>
            apiUrl="/api/realEstate/bimQuantity"
            collectionName="bimquantities"
            accessModel="bimquantities"
            tableConfigKey="bimquantities"
            createPath="/realEstate/bimQuantities/create"
            createIcon={<IconPlus className="h-4 w-4" />}
            createLanguageKey="createBimQuantity"
            buildEditPath={buildEditPath}
            resolveLanguageKey={resolveLanguageKey}
            sheetLanguagePath="src/modules/propertyManagement/clients/panel/private/bimQuantities/center/sheetView/bimQuantitySheetView.tsx"
            cardViewClassName={GRID_TRANSACTIONAL_WIDE}
            renderCard={(row, onDelete, onRestore) => (
                <BimQuantityCard
                    entity={row}
                    onDelete={(r: BimQuantity | undefined, response?: DeletedData) => onDelete(r, response)}
                    onRestore={() => onRestore(row)}
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/bimQuantities/index.tsx"),
    withDebug(true, true),
)(AllBimQuantitys);
