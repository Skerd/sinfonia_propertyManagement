import { compose } from "redux";
import withLanguage, { WithLanguageType } from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import HiddenElement from "@coreModule/components/custom/hiddenElement.tsx";
import { useAccess } from "@coreModule/helpers/hocs/withAccess.tsx";
import {useEntityCard} from "@coreModule/helpers/hooks/useEntityCard.ts";
import { Badge } from "@coreModule/components/ui/badge.tsx";
import TooltipDisplayer from "@coreModule/components/custom/tooltipDisplayer.tsx";
import { UnitType } from "armonia/src/modules/propertyManagement/api/realEstate/private/unitType/unitType.dto.ts";
import { MdiIcon } from "@coreModule/components/custom/mdiIcons/mdiIcon.tsx";
import DeletedInfo from "@coreModule/components/custom/deletedInfo";
import { IconHash, IconLock } from "@tabler/icons-react";
import UnitTypeSheetView from "@propertyManagementModule/clients/panel/private/unitTypes/center/sheetView/unitTypeSheetView.tsx";
import DeleteAction from "@coreModule/components/custom/actions/deleteAction.tsx";
import type { DeletedData } from "armonia/src/modules/core/types/shared.types.ts";
import RestoreAction from "@coreModule/components/custom/actions/restoreAction.tsx";
import ActionMenu from "@coreModule/components/custom/actions/menu/actionMenu.tsx";
import {EntityCardShell} from "@propertyManagementModule/components/custom/cards/EntityCardShell.tsx";
import {EntityTextCardHeader} from "@propertyManagementModule/components/custom/cards/EntityTextCardHeader.tsx";

function unitTypeEditPath(unitType: UnitType) {
    const params = new URLSearchParams();
    params.set("unitTypeId", unitType._id);
    if (unitType.name) params.set("unitTypeName", unitType.name);
    return `/tenancy/systemSettings/unitTypes/edit?${params.toString()}`;
}

type UnitTypeCardProps = WithLanguageType & {
    unitType: UnitType;
    onDelete?: (deletedUnitType?: UnitType, response?: DeletedData) => void;
    onRestore?: () => void;
    hideActions?: boolean;
    sheetOnly?: boolean;
};

function UnitTypeCard({
    unitType: unitTypeProp,
    resolveLanguageKey,
    onDelete: onDeleteProp,
    onRestore: onRestoreProp,
    hideActions = false,
    sheetOnly = false,
}: UnitTypeCardProps) {
    const {action, setAction, entity: unitType, hideAfterDeletion, onDelete, onRestore} = useEntityCard({
        entityProp: unitTypeProp,
        onDeleteProp,
        onRestoreProp,
    });

    const { read, restore } = useAccess("unitTypes");

    if (hideAfterDeletion) {
        return <></>;
    }
    if (!restore && unitType.deletedAt != null) {
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
                            <DeletedInfo deletedAt={unitType.deletedAt} deletedBy={unitType.deletedBy} />
                        )}
                        <div className="w-full min-w-0">
                            <EntityTextCardHeader
                                iconTile={
                                    <TooltipDisplayer tooltip={resolveLanguageKey("icon")}>
                                        <div className="flex items-center justify-center shrink-0 rounded-lg bg-muted/50 p-2">
                                            {unitType.icon ? (
                                                <MdiIcon icon={unitType.icon} size={1.25} showFallback />
                                            ) : (
                                                <MdiIcon icon="mdiHome" size={1.25} />
                                            )}
                                        </div>
                                    </TooltipDisplayer>
                                }
                                title={<span className="text-lg font-semibold truncate">{unitType.name}</span>}
                                showTitle={!!read?.name}
                                subtitle={
                                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <IconHash className="h-3 w-3 shrink-0" />
                                        {unitType.slug}
                                    </span>
                                }
                                showSubtitle={!!read?.slug}
                                badges={
                                    <>
                                        {!!unitType.category?.name && (
                                            <Badge variant="secondary" className="text-xs font-medium">{unitType.category.name}</Badge>
                                        )}
                                        {!!unitType.group && (
                                            <Badge variant="outline" className="text-xs font-medium">{unitType.group}</Badge>
                                        )}
                                        {unitType.isPrivate && (
                                            <Badge variant="outline" className="text-xs font-medium gap-1">
                                                <IconLock className="h-3 w-3" />
                                                {resolveLanguageKey("private")}
                                            </Badge>
                                        )}
                                    </>
                                }
                                showBadges={!!(read?.category || read?.group || read?.isPrivate)}
                                hideActions={hideActions}
                                actionMenu={
                                    <ActionMenu
                                        accessModel="unitTypes"
                                        deletedData={unitType}
                                        onAction={(a: string) => setAction(a)}
                                        editPath={unitTypeEditPath(unitType)}
                                    />
                                }
                            />
                        </div>
                    </div>
                </EntityCardShell>
            )}

            {!!action && (
                <>
                    {action === "view" && (
                        <UnitTypeSheetView
                            open={action === "view"}
                            onOpenChange={() => setAction("")}
                            unitType={unitType}
                            onDelete={onDelete}
                            onRestore={onRestore}
                        />
                    )}
                    {action === "delete" && (
                        <DeleteAction
                            accessModel="unitTypes"
                            deleteId={unitType._id}
                            openAlert={action === "delete"}
                            name={read?.name && unitType.name}
                            confirmName={read?.name && unitType.name}
                            onSuccess={onDelete}
                            onCancel={() => setAction("")}
                            url="/api/realEstate/unitType"
                        />
                    )}
                    {action === "restore" && (
                        <RestoreAction
                            accessModel="unitTypes"
                            deleteId={unitType._id}
                            openAlert={action === "restore"}
                            name={read?.name && unitType.name}
                            confirmName={read?.name && unitType.name}
                            onSuccess={onRestore}
                            onCancel={() => setAction("")}
                            url="/api/realEstate/unitType/restore"
                        />
                    )}
                </>
            )}
        </>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/unitTypes/center/cardView/unitTypeCard.tsx"),
    withDebug(true, true),
)(UnitTypeCard);
