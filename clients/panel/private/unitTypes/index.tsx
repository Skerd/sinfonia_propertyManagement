import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {IconHomePlus} from "@tabler/icons-react";
import {UnitType} from "armonia/src/modules/propertyManagement/api/realEstate/private/unitType/unitType.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import UnitTypeCard from "@propertyManagementModule/clients/panel/private/unitTypes/center/cardView/unitTypeCard.tsx";
import EntityListPage from "@coreModule/components/entityPage/EntityListPage.tsx";
import {GRID_TRANSACTIONAL} from "@propertyManagementModule/components/custom/cards/entityCard.constants.ts";

function unitTypeEditPath(unitType: UnitType) {
    const params = new URLSearchParams();
    params.set("unitTypeId", unitType._id);
    if (unitType.name) params.set("unitTypeName", unitType.name);
    return `/tenancy/systemSettings/unitTypes/edit?${params.toString()}`;
}

function AllUnitTypes({resolveLanguageKey}: WithLanguageType) {
    return (
        <EntityListPage<UnitType>
            apiUrl="/api/realEstate/unitType"
            collectionName="unittypes"
            accessModel="unitTypes"
            tableConfigKey="unittypes"
            createPath="/tenancy/systemSettings/unitTypes/create"
            createIcon={<IconHomePlus />}
            createLanguageKey="createUnitType"
            buildEditPath={unitTypeEditPath}
            resolveLanguageKey={resolveLanguageKey}
            cardViewClassName={GRID_TRANSACTIONAL}
            sheetLanguagePath="src/modules/propertyManagement/clients/panel/private/unitTypes/center/sheetView/unitTypeSheetView.tsx"
            renderCard={(unitType, onDelete, onRestore) => (
                <UnitTypeCard
                    unitType={unitType}
                    onDelete={(row: UnitType | undefined, response?: DeletedData) => onDelete(row, response)}
                    onRestore={() => onRestore(unitType)}
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/unitTypes/index.tsx"),
    withDebug(true, true, "unitTypes"),
)(AllUnitTypes);
