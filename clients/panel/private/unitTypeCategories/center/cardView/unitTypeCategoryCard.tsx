import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import HiddenElement from "@coreModule/components/custom/hiddenElement.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import {useEntityCard} from "@coreModule/helpers/hooks/useEntityCard.ts";
import {IconTag} from "@tabler/icons-react";
import {UnitTypeCategory} from "armonia/src/modules/propertyManagement/api/realEstate/private/unitTypeCategory/unitTypeCategory.dto.ts";
import DeletedInfo from "@coreModule/components/custom/deletedInfo";
import UnitTypeCategorySheetView from "@propertyManagementModule/clients/panel/private/unitTypeCategories/center/sheetView/unitTypeCategorySheetView.tsx";
import DeleteAction from "@coreModule/components/custom/actions/deleteAction.tsx";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import RestoreAction from "@coreModule/components/custom/actions/restoreAction.tsx";
import ActionMenu from "@coreModule/components/custom/actions/menu/actionMenu.tsx";
import {EntityCardShell} from "@propertyManagementModule/components/custom/cards/EntityCardShell.tsx";
import {EntityTextCardHeader} from "@propertyManagementModule/components/custom/cards/EntityTextCardHeader.tsx";

function unitTypeCategoryEditPath(category: UnitTypeCategory) {
    const params = new URLSearchParams();
    params.set("unitTypeCategoryId", category._id);
    if (category.name) params.set("unitTypeCategoryName", category.name);
    return `/tenancy/systemSettings/unitTypeCategories/edit?${params.toString()}`;
}

type UnitTypeCategoryCardProps = WithLanguageType & {
    unitTypeCategory: UnitTypeCategory;
    hideActions?: boolean;
    onDelete?: (deletedCategory?: UnitTypeCategory, response?: DeletedData) => void;
    onRestore?: () => void;
    sheetOnly?: boolean;
};

function UnitTypeCategoryCard({
    unitTypeCategory: categoryProp,
    resolveLanguageKey,
    hideActions = false,
    onDelete: onDeleteProp,
    onRestore: onRestoreProp,
    sheetOnly = false,
}: UnitTypeCategoryCardProps) {
    const {action, setAction, entity: category, hideAfterDeletion, onDelete, onRestore} = useEntityCard({
        entityProp: categoryProp,
        onDeleteProp,
        onRestoreProp,
    });

    const {read, restore} = useAccess("unitTypeCategories");

    if (hideAfterDeletion || !restore) {
        return <></>;
    }
    if (!read || !Object.keys(read).length) {
        return <HiddenElement />;
    }

    return (
        <>
            {!sheetOnly && (
                <EntityCardShell onClick={() => setAction("view")}>
                    <div className="flex w-full items-stretch">
                        {(read.deletedBy || read.deletedAt) && (
                            <DeletedInfo deletedAt={category.deletedAt} deletedBy={category.deletedBy} />
                        )}
                        <div className="w-full min-w-0">
                            <EntityTextCardHeader
                                iconTile={
                                    <div className="flex items-center justify-center shrink-0 rounded-lg bg-muted/50 p-2">
                                        <IconTag className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                }
                                title={<span className="text-lg font-semibold truncate">{category.name}</span>}
                                showTitle={!!read?.name}
                                hideActions={hideActions}
                                actionMenu={
                                    <ActionMenu
                                        accessModel="unitTypeCategories"
                                        deletedData={category}
                                        onAction={(a: string) => setAction(a)}
                                        editPath={unitTypeCategoryEditPath(category)}
                                    />
                                }
                            />
                        </div>
                    </div>
                </EntityCardShell>
            )}

            {action === "view" && (
                <UnitTypeCategorySheetView
                    open={action === "view"}
                    onOpenChange={(open) => !open && setAction("")}
                    unitTypeCategory={category}
                    hideActions={hideActions}
                    onDelete={onDelete}
                    onRestore={onRestore}
                />
            )}
            {action === "delete" && (
                <DeleteAction
                    accessModel="unitTypeCategories"
                    apiUrl="/api/realEstate/unitTypeCategory"
                    entity={category}
                    onClose={() => setAction("")}
                    onDelete={onDelete}
                    resolveLanguageKey={resolveLanguageKey}
                />
            )}
            {action === "restore" && (
                <RestoreAction
                    accessModel="unitTypeCategories"
                    apiUrl="/api/realEstate/unitTypeCategory/restore"
                    entity={category}
                    onClose={() => setAction("")}
                    onRestore={onRestore}
                    resolveLanguageKey={resolveLanguageKey}
                />
            )}
        </>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/unitTypeCategories/center/cardView/unitTypeCategoryCard.tsx"),
    withDebug(true, true),
)(UnitTypeCategoryCard);
