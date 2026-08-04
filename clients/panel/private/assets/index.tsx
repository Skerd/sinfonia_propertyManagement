import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage from "@coreModule/components/entityPage/EntityListPage.tsx";
import {GRID_TRANSACTIONAL} from "@propertyManagementModule/components/custom/cards/entityCard.constants.ts";
import {IconPlus} from "@tabler/icons-react";
import type {Asset} from "armonia/src/modules/propertyManagement/api/realEstate/private/asset/asset.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import AssetCard from "@propertyManagementModule/clients/panel/private/assets/center/cardView/assetCard.tsx";

interface Props extends WithLanguageType {}

function buildEditPath(row: Asset) {
    const params = new URLSearchParams();
    params.set("assetId", row._id);
    if (row.name) params.set("assetName", row.name);
    return `/realEstate/assets/edit?${params.toString()}`;
}

function AllAssets({resolveLanguageKey}: Props) {
    return (
        <EntityListPage<Asset>
            apiUrl="/api/realEstate/asset"
            collectionName="assets"
            accessModel="assets"
            tableConfigKey="assets"
            createPath="/realEstate/assets/create"
            createIcon={<IconPlus className="h-4 w-4" />}
            createLanguageKey="createAsset"
            buildEditPath={buildEditPath}
            resolveLanguageKey={resolveLanguageKey}
            sheetLanguagePath="src/modules/propertyManagement/clients/panel/private/assets/center/sheetView/assetSheetView.tsx"
            cardViewClassName={GRID_TRANSACTIONAL}
            renderCard={(row, onDelete, onRestore) => (
                <AssetCard
                    entity={row}
                    onDelete={(r: Asset | undefined, response?: DeletedData) => onDelete(r, response)}
                    onRestore={() => onRestore(row)}
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/assets/index.tsx"),
    withDebug(true, true),
)(AllAssets);
