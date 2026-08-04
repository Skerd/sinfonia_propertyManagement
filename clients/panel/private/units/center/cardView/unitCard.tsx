import {compose} from "redux";
import {InfoRowGroup} from "@coreModule/components/custom/infoRowGroup.tsx";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import HiddenElement from "@coreModule/components/custom/hiddenElement.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import {useEffect, useImperativeHandle, useMemo, useState} from "react";
import {useEntityCard} from "@coreModule/helpers/hooks/useEntityCard.ts";
import {GalleryCarousel} from "@coreModule/components/custom/images/galleryCarousel.tsx";
import {ModifyImagesOnDarkMode} from "@propertyManagementModule/components/custom/images/modifyImagesOnDarkMode.tsx";
import {formatCardAreaM2, formatCardDecimal} from "@propertyManagementModule/helpers/general/formatCardNumber.ts";
import {cn} from "@coreModule/components/lib/utils.ts";
import InfoRow from "@coreModule/components/custom/infoRow.tsx";
import {
    IconBath,
    IconDoor,
    IconGrid4x4,
    IconStack,
    IconListDetails,
    IconTag,
} from "@tabler/icons-react";
import {Unit} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/unit/unit.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import {EntityCardShell} from "@propertyManagementModule/components/custom/cards/EntityCardShell.tsx";
import {EntityMediaHeader} from "@propertyManagementModule/components/custom/cards/EntityMediaHeader.tsx";
import {EntityCardFetchGuard} from "@propertyManagementModule/components/custom/cards/EntityCardFetchGuard.tsx";
import {CARD_BODY_CLASS} from "@propertyManagementModule/components/custom/cards/entityCard.constants.ts";
import {UnitStatusBadge, resolveUnitStatusKey} from "@propertyManagementModule/components/custom/cards/UnitStatusBadge.tsx";
import UnitSheetView from "@propertyManagementModule/clients/panel/private/units/center/sheetView/unitSheetView.tsx";
import ActionMenu from "@coreModule/components/custom/actions/menu/actionMenu.tsx";
import DeleteAction from "@coreModule/components/custom/actions/deleteAction.tsx";
import RestoreAction from "@coreModule/components/custom/actions/restoreAction.tsx";
import {buildUnitEditPath, unitDeleteConfirmLabel} from "@propertyManagementModule/clients/panel/private/units/unitNavigation.ts";
import {UnitDomainMenuItems} from "@propertyManagementModule/clients/panel/private/units/center/actions/unitDomainMenuItems.tsx";
import {withDeletedDrawer} from "@coreModule/helpers/hocs/withDeletedDrawer.tsx";

type UnitCardProps = WithLanguageType & WithAxiosType<Unit, {_id: string}> & {
    unit: Unit;
    hideActions?: boolean;
    onDelete?: (response?: DeletedData) => void;
    onRestore?: () => void;
    fetchId?: string;
    small?: boolean;
};

function UnitCard({
    unit: unitProp,
    resolveLanguageKey,
    hideActions = false,
    onDelete: onDeleteProp,
    onRestore: onRestoreProp,
    fetchId,
    onFilterChange,
    loading,
    error,
    innerRef,
    small,
}: UnitCardProps) {
    const {action, setAction, entity: unit, setEntity: setUnit, hideAfterDeletion, onDelete, onRestore} = useEntityCard({
        entityProp: unitProp,
        onDeleteProp: onDeleteProp ? (_u, data) => onDeleteProp(data) : undefined,
        onRestoreProp,
        syncPropOnChange: !fetchId,
    });
    const [forceReload, setForceReload] = useState(1);

    const {read} = useAccess("units");

    const editPath = buildUnitEditPath(unit);
    const domainUnitName = unit.name || unit.unitNumber || unit._id;

    useEffect(() => {
        if (fetchId) {
            onFilterChange({_id: fetchId});
        }
    }, [fetchId, forceReload]);

    useImperativeHandle(innerRef, () => ({
        success: (data: Unit) => {
            setUnit(data);
        },
    }));

    const galleryMemo = useMemo(
        () => (
            <GalleryCarousel
                mainImage={unit.mainImage}
                imageGallery={unit.imageGallery || []}
                videoGallery={unit.videoGallery || []}
                showThumbnails={false}
                allowFullScreen={false}
                coverAfterFirst={false}
                modifyImagesOnDarkMode={ModifyImagesOnDarkMode}
            />
        ),
        [unit.videoGallery, unit.mainImage, unit.imageGallery],
    );

    const showStatusBadge = resolveUnitStatusKey(unit.status, unit.isAvailable) != null;
    const unitStatus =
        unit.status ??
        (unit.isAvailable != null ? (unit.isAvailable ? "available_unit" : "unavailable_unit") : undefined);

    if (hideAfterDeletion) return <></>;
    if (!read || !Object.keys(read).length) return <HiddenElement />;

    const deleteLabel = unitDeleteConfirmLabel(read as Record<string, unknown> | undefined, unit);

    return (
        <EntityCardFetchGuard
            fetchId={fetchId}
            loading={loading}
            error={error}
            failedTitle={resolveLanguageKey("failedTitle")}
            failedDescription={resolveLanguageKey("failedDescription")}
            onRetry={() => setForceReload((p) => p + 1)}
        >
            <>
                <EntityCardShell
                    onClick={fetchId ? undefined : () => setAction("view")}
                    disableClick={!!fetchId}
                >
                    <EntityMediaHeader
                        carouselKey={"unit_carousel" + unit._id}
                        showMedia={!!(read?.mainImage || read?.imageGallery || read?.videoGallery)}
                        gallery={galleryMemo}
                        title={unit.name}
                        showTitle={!!read?.name}
                        hideActions={hideActions}
                        titleExtra={
                            showStatusBadge && unitStatus ? (
                                <UnitStatusBadge
                                    status={unitStatus}
                                    resolveLanguageKey={resolveLanguageKey}
                                    variant="overlay"
                                />
                            ) : undefined
                        }
                        actionMenu={
                            <ActionMenu
                                accessModel={"units"}
                                deletedData={unit}
                                onAction={(a: string) => setAction(a)}
                                editPath={editPath}
                                allowMenuForCustomChildren={true}
                                alwaysShowDropDownMenuTrigger={true}
                            >
                                <UnitDomainMenuItems unitId={unit._id} unitName={domainUnitName} />
                            </ActionMenu>
                        }
                    />
                    <div className={CARD_BODY_CLASS}>
                        <InfoRowGroup>
                            {!small && (
                                <>
                                    <InfoRow
                                        icon={IconStack}
                                        label={resolveLanguageKey("floor")}
                                        tooltip={resolveLanguageKey("floor")}
                                        show={!!read?.floor}
                                        value={unit.floor?.name}
                                    />
                                    <InfoRow
                                        icon={IconListDetails}
                                        label={resolveLanguageKey("data.unitType")}
                                        tooltip={resolveLanguageKey("data.unitType")}
                                        show={!!read?.unitType?.keys?.name}
                                        value={unit.unitType?.name}
                                    />
                                </>
                            )}
                            <InfoRow
                                icon={IconGrid4x4}
                                label={resolveLanguageKey("data.area")}
                                tooltip={resolveLanguageKey("data.area")}
                                show={!!read?.area}
                                value={unit.area != null && formatCardAreaM2(unit.area)}
                            />
                            <InfoRow
                                icon={IconDoor}
                                label={resolveLanguageKey("data.rooms")}
                                tooltip={resolveLanguageKey("data.rooms")}
                                show={!!read?.numberOfRooms}
                                value={unit.numberOfRooms}
                            />
                            <InfoRow
                                icon={IconBath}
                                label={resolveLanguageKey("data.numberOfBathrooms")}
                                tooltip={resolveLanguageKey("data.numberOfBathrooms")}
                                show={!!read?.numberOfBathrooms}
                                value={unit.numberOfBathrooms}
                            />
                            <InfoRow
                                icon={IconTag}
                                label={resolveLanguageKey("data.price")}
                                tooltip={resolveLanguageKey("data.price")}
                                show={!!read?.price}
                                value={
                                    unit.price != null ? (
                                        <span className="text-success font-semibold">
                                            {unit.priceCurrency?.symbol || unit.priceCurrency?.abbreviation || ""}
                                            {formatCardDecimal(unit.price)}
                                        </span>
                                    ) : null
                                }
                            />
                        </InfoRowGroup>
                        {(unit.hasBalcony || unit.hasTerrace || unit.hasSeaView || unit.hasCityView || unit.hasLakeView || unit.hasElevator) && (
                            <div className="flex flex-wrap gap-1">
                                {unit.hasBalcony && <span className="inline-flex items-center text-xs px-1.5 py-0.5 rounded-md bg-info/10 text-info dark:bg-info/30 font-medium">{resolveLanguageKey("features.balcony")}</span>}
                                {unit.hasTerrace && <span className="inline-flex items-center text-xs px-1.5 py-0.5 rounded-md bg-info/10 text-info dark:bg-info/30 font-medium">{resolveLanguageKey("features.terrace")}</span>}
                                {unit.hasSeaView && <span className="inline-flex items-center text-xs px-1.5 py-0.5 rounded-md bg-info/10 text-info dark:bg-info/30 font-medium">{resolveLanguageKey("features.seaView")}</span>}
                                {unit.hasCityView && <span className="inline-flex items-center text-xs px-1.5 py-0.5 rounded-md bg-info/10 text-info dark:bg-info/30 font-medium">{resolveLanguageKey("features.cityView")}</span>}
                                {unit.hasLakeView && <span className="inline-flex items-center text-xs px-1.5 py-0.5 rounded-md bg-info/10 text-info dark:bg-info/30 font-medium">{resolveLanguageKey("features.lakeView")}</span>}
                                {unit.hasElevator && <span className="inline-flex items-center text-xs px-1.5 py-0.5 rounded-md bg-info/10 text-info dark:bg-info/30 font-medium">{resolveLanguageKey("features.elevator")}</span>}
                            </div>
                        )}
                        {(!!unit.orientation || !!unit.constructionStatus) && (
                            <div className="flex flex-wrap gap-1">
                                {!!unit.orientation && (
                                    <span className="inline-flex items-center text-xs px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground font-medium">
                                        {unit.orientation}
                                    </span>
                                )}
                                {!!unit.constructionStatus && (
                                    <span className={cn("inline-flex items-center text-xs px-1.5 py-0.5 rounded-md font-medium", {
                                        "bg-info/10 text-info dark:bg-info/30": unit.constructionStatus === "planned",
                                        "bg-warning/10 text-warning dark:bg-warning/30": unit.constructionStatus === "under_construction",
                                        "bg-success/10 text-success dark:bg-success/30": unit.constructionStatus === "ready",
                                        "bg-success text-success-foreground": unit.constructionStatus === "delivered",
                                    })}>
                                        {resolveLanguageKey(`constructionStatus.${unit.constructionStatus}`)}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </EntityCardShell>

                {!!action && (
                    <>
                        {action === "view" && (
                            <UnitSheetView
                                open={action === "view"}
                                onOpenChange={() => setAction("")}
                                unit={unit}
                                onDelete={onDelete}
                                onRestore={onRestore}
                            />
                        )}
                        {action === "delete" && (
                            <DeleteAction
                                accessModel={"units"}
                                deleteId={unit._id}
                                openAlert={action === "delete"}
                                name={deleteLabel}
                                confirmName={deleteLabel}
                                onSuccess={onDelete}
                                onCancel={() => setAction("")}
                                url={`/api/realEstate/unit`}
                            />
                        )}
                        {action === "restore" && (
                            <RestoreAction
                                accessModel={"units"}
                                deleteId={unit._id}
                                openAlert={action === "restore"}
                                name={deleteLabel}
                                confirmName={deleteLabel}
                                onSuccess={onRestore}
                                onCancel={() => setAction("")}
                                url={`/api/realEstate/unit/restore`}
                            />
                        )}
                    </>
                )}
            </>
        </EntityCardFetchGuard>
    );
}

export default compose(
    (Component: any) => withDeletedDrawer(Component, (props: any) => props.unit),
    withLanguage("src/modules/propertyManagement/clients/panel/private/units/center/cardView/unitCard.tsx"),
    withAxios<Unit, {_id: string}>(
        {url: "/api/realEstate/unit/single", method: "POST", data: {}},
        true,
    ),
    withDebug(true, true),
)(UnitCard);
