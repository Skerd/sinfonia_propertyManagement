import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {IconTag} from "@tabler/icons-react";
import {UnitTypeCategory} from "armonia/src/modules/propertyManagement/api/realEstate/private/unitTypeCategory/unitTypeCategory.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import UnitTypeCategoryCard from "@propertyManagementModule/clients/panel/private/unitTypeCategories/center/cardView/unitTypeCategoryCard.tsx";
import EntityListPage from "@coreModule/components/entityPage/EntityListPage.tsx";
import {GRID_TRANSACTIONAL} from "@propertyManagementModule/components/custom/cards/entityCard.constants.ts";

function unitTypeCategoryEditPath(category: UnitTypeCategory) {
    const params = new URLSearchParams();
    params.set("unitTypeCategoryId", category._id);
    if (category.name) params.set("unitTypeCategoryName", category.name);
    return `/tenancy/systemSettings/unitTypeCategories/edit?${params.toString()}`;
}

function AllUnitTypeCategories({resolveLanguageKey}: WithLanguageType) {
    return (
        <EntityListPage<UnitTypeCategory>
            apiUrl="/api/realEstate/unitTypeCategory"
            collectionName="unittypecategories"
            accessModel="unitTypeCategories"
            tableConfigKey="unittypecategories"
            createPath="/tenancy/systemSettings/unitTypeCategories/create"
            createIcon={<IconTag />}
            createLanguageKey="createUnitTypeCategory"
            buildEditPath={unitTypeCategoryEditPath}
            resolveLanguageKey={resolveLanguageKey}
            cardViewClassName={GRID_TRANSACTIONAL}
            sheetLanguagePath="src/modules/propertyManagement/clients/panel/private/unitTypeCategories/center/sheetView/unitTypeCategorySheetView.tsx"
            renderCard={(category, onDelete, onRestore) => (
                <UnitTypeCategoryCard
                    unitTypeCategory={category}
                    onDelete={(row: UnitTypeCategory | undefined, response?: DeletedData) => onDelete(row, response)}
                    onRestore={() => onRestore(category)}
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/unitTypeCategories/index.tsx"),
    withDebug(true, true),
)(AllUnitTypeCategories);
