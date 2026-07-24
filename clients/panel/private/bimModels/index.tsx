import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage from "@coreModule/components/entityPage/EntityListPage.tsx";
import {GRID_TRANSACTIONAL_WIDE} from "@propertyManagementModule/components/custom/cards/entityCard.constants.ts";
import {IconPlus} from "@tabler/icons-react";
import type {BimModel} from "armonia/src/modules/propertyManagement/api/realEstate/private/bimModel/bimModel.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import BimModelCard from "@propertyManagementModule/clients/panel/private/bimModels/center/cardView/bimModelCard.tsx";

interface Props extends WithLanguageType {}

function buildEditPath(row: BimModel) {
    const params = new URLSearchParams();
    params.set("bimModelId", row._id);
    if (row.name) params.set("bimModelName", row.name);
    return `/realEstate/bimModels/edit?${params.toString()}`;
}

function AllBimModels({resolveLanguageKey}: Props) {
    return (
        <EntityListPage<BimModel>
            apiUrl="/api/realEstate/bimModel"
            collectionName="bimmodels"
            accessModel="bimmodels"
            tableConfigKey="bimmodels"
            createPath="/realEstate/bimModels/create"
            createIcon={<IconPlus className="h-4 w-4" />}
            createLanguageKey="createBimModel"
            buildEditPath={buildEditPath}
            resolveLanguageKey={resolveLanguageKey}
            sheetLanguagePath="src/modules/propertyManagement/clients/panel/private/bimModels/center/sheetView/bimModelSheetView.tsx"
            cardViewClassName={GRID_TRANSACTIONAL_WIDE}
            renderCard={(row, onDelete, onRestore) => (
                <BimModelCard
                    entity={row}
                    onDelete={(r: BimModel | undefined, response?: DeletedData) => onDelete(r, response)}
                    onRestore={() => onRestore(row)}
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/bimModels/index.tsx"),
    withDebug(true, true),
)(AllBimModels);
