import {compose} from "redux";
import {useEffect, useState} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import {UnitTypeCategory} from "armonia/src/modules/propertyManagement/api/realEstate/private/unitTypeCategory/unitTypeCategory.dto.ts";
import type {DeleteResponse} from "armonia/src/modules/core/types/shared.types.ts";
import {useViewConfig} from "@coreModule/helpers/hooks/useViewConfig.ts";
import SheetViewRenderer from "@coreModule/components/viewEngine/SheetViewRenderer.tsx";

export type UnitTypeCategorySheetViewOwnProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    unitTypeCategory?: UnitTypeCategory;
    hideActions?: boolean;
    onDelete?: (response?: DeleteResponse) => void;
    onRestore?: () => void;
    isRestored?: boolean;
    fetchId?: string;
};

function unitTypeCategoryEditPath(category: UnitTypeCategory) {
    const params = new URLSearchParams();
    params.set("unitTypeCategoryId", category._id);
    if (category.name) params.set("unitTypeCategoryName", category.name);
    return `/tenancy/systemSettings/unitTypeCategories/edit?${params.toString()}`;
}

function UnitTypeCategorySheetView({
    open,
    onOpenChange,
    unitTypeCategory: categoryProp,
    resolveLanguageKey,
    hideActions = false,
    onDelete = () => {},
    onRestore = () => {},
    fetchId,
}: UnitTypeCategorySheetViewOwnProps & WithLanguageType) {
    const [sheetData, setSheetData] = useState<Record<string, any>>(categoryProp || {_id: fetchId});
    const access = useAccess("unitTypeCategories");
    const viewConfig = useViewConfig("unittypecategories", "sheet");

    useEffect(() => {
        if (!categoryProp) return;
        setSheetData(categoryProp);
    }, [categoryProp]);

    const entityId = categoryProp?._id ?? fetchId;

    if (!viewConfig) return null;
    if (!entityId) return null;

    return (
        <SheetViewRenderer
            config={viewConfig}
            url="/api/realEstate/unitTypeCategory/single"
            fetchId={fetchId}
            onDataFetched={(data) => {
                setSheetData(data);
            }}
            data={sheetData}
            open={open}
            onOpenChange={onOpenChange}
            resolveLanguageKey={resolveLanguageKey}
            access={access}
            hideActions={hideActions}
            onDelete={onDelete}
            onRestore={onRestore}
            editPath={unitTypeCategoryEditPath(sheetData as UnitTypeCategory)}
        />
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/unitTypeCategories/center/sheetView/unitTypeCategorySheetView.tsx"),
    withDebug(true, true),
)(UnitTypeCategorySheetView);
