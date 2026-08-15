import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {IconTag} from "@tabler/icons-react";
import {UnitTypeCategory} from "armonia/src/modules/propertyManagement/api/realEstate/private/unitTypeCategory/unitTypeCategory.dto.ts";
import UnitTypeCategorySheetView from "@propertyManagementModule/clients/panel/private/unitTypeCategories/center/sheetView/unitTypeCategorySheetView.tsx";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import EntityCard from "@coreModule/components/custom/systemCards/entityCard.tsx";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {RefObject} from "react";

function unitTypeCategoryEditPath(category: UnitTypeCategory) {
    const params = new URLSearchParams();
    params.set("unitTypeCategoryId", category._id);
    if (category.name) params.set("unitTypeCategoryName", category.name);
    return `/tenancy/systemSettings/unitTypeCategories/edit?${params.toString()}`;
}

type UnitTypeCategoryCardProps = WithLanguageType & {
    unitTypeCategory: UnitTypeCategory;
    fetchId?: string;
    hideActions?: boolean;
    onDelete?: (deletedCategory?: UnitTypeCategory, response?: DeletedData) => void;
    onRestore?: () => void;
    sheetOnly?: boolean;
    innerRef?: RefObject<WithAxiosLifecycleRef<UnitTypeCategory> | null>;
};

function UnitTypeCategoryCard({
    unitTypeCategory,
    fetchId,
    hideActions = false,
    onDelete,
    onRestore,
    sheetOnly = false,
    innerRef,
}: UnitTypeCategoryCardProps) {
    return (
        <EntityCard
            resource="unitTypeCategories"
            entity={unitTypeCategory}
            fetchId={fetchId}
            singleUrl="/api/realEstate/unitTypeCategory/single"
            onDelete={onDelete}
            onRestore={onRestore}
            hideActions={hideActions}
            sheetOnly={sheetOnly}
            editPath={unitTypeCategoryEditPath}
            Sheet={UnitTypeCategorySheetView}
            sheetEntityProp="unitTypeCategory"
            deleteUrl="/api/realEstate/unitTypeCategory"
            restoreUrl="/api/realEstate/unitTypeCategory/restore"
            failedTitle=""
            failedDescription=""
            titlePath="name"
            innerRef={innerRef}
        >
            {({entity}) => (
                <EntityCard.Header
                    titlePath="name"
                    title={entity.name}
                    
                />
            )}
        </EntityCard>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/unitTypeCategories/center/cardView/unitTypeCategoryCard.tsx"),
    withDebug(true, true),
)(UnitTypeCategoryCard);
