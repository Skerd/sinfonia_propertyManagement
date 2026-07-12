import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {useEffect, useImperativeHandle, useMemo, useState} from "react";
import {useEntityCard} from "@coreModule/helpers/hooks/useEntityCard.ts";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import HiddenElement from "@coreModule/components/custom/hiddenElement.tsx";
import {GalleryCarousel} from "@coreModule/components/custom/images/galleryCarousel.tsx";
import {ModifyImagesOnDarkMode} from "@propertyManagementModule/components/custom/images/modifyImagesOnDarkMode.tsx";
import {formatCardAreaM2} from "@propertyManagementModule/helpers/general/formatCardNumber.ts";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import {Floor} from "armonia/src/modules/propertyManagement/api/realEstate/private/floor/floor.dto.ts";
import {Separator} from "@coreModule/components/ui/separator.tsx";
import InfoRow from "@coreModule/components/custom/infoRow.tsx";
import {
    IconDoor,
    IconFireExtinguisher,
    IconGrid4x4,
    IconWheelchair,
} from "@tabler/icons-react";
import {EntityCardShell} from "@propertyManagementModule/components/custom/cards/EntityCardShell.tsx";
import {EntityMediaHeader} from "@propertyManagementModule/components/custom/cards/EntityMediaHeader.tsx";
import {EntityStatusBadgeRow} from "@propertyManagementModule/components/custom/cards/EntityStatusBreakdown.tsx";
import {EntityCardFetchGuard} from "@propertyManagementModule/components/custom/cards/EntityCardFetchGuard.tsx";
import {CARD_BODY_CLASS, CARD_INFO_ROWS_CLASS} from "@propertyManagementModule/components/custom/cards/entityCard.constants.ts";
import FloorSheetView from "@propertyManagementModule/clients/panel/private/floors/center/sheetView/floorSheetView.tsx";
import DeleteAction from "@coreModule/components/custom/actions/deleteAction.tsx";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import RestoreAction from "@coreModule/components/custom/actions/restoreAction.tsx";
import ActionMenu from "@coreModule/components/custom/actions/menu/actionMenu.tsx";
import ViewUnits from "@propertyManagementModule/clients/panel/private/floors/center/actions/viewUnits.tsx";
import ViewUnitsOverlay from "@propertyManagementModule/clients/panel/private/floors/center/actions/viewUnitsOverlay.tsx";
import UnitsOverlay from "@propertyManagementModule/components/custom/floors/unitsOverlay.tsx";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import {withDeletedDrawer} from "@coreModule/helpers/hocs/withDeletedDrawer.tsx";
import {buildFloorEditPath} from "@propertyManagementModule/clients/panel/private/floors";

type FloorCardProps = WithLanguageType & WithAxiosType<Floor, {_id: string}> & {
    floor: Floor;
    single?: boolean;
    onDelete?: (deletedFloor?: Floor, response?: DeletedData) => void;
    onRestore?: () => void;
    hideActions?: boolean;
    fetchId?: string;
};

function FloorCard({
    floor: floorProp,
    resolveLanguageKey,
    onDelete: onDeleteProp,
    onRestore: onRestoreProp,
    hideActions = false,
    fetchId,
    onFilterChange,
    loading,
    error,
    innerRef
}: FloorCardProps) {

    const {action, setAction, entity: floor, setEntity: setFloor, hideAfterDeletion, onDelete, onRestore} = useEntityCard({
        entityProp: floorProp,
        onDeleteProp,
        onRestoreProp,
        syncPropOnChange: !fetchId,
    });
    const [forceReload, setForceReload] = useState<number>(1);

    const {read} = useAccess("floors");
    const {read: readUnits} = useAccess("units");

    const galleryMemo = useMemo(() => (
        <GalleryCarousel
            mainImage={floor.mainImage}
            imageGallery={floor.imageGallery || []}
            videoGallery={floor.videoGallery || []}
            showThumbnails={false}
            allowFullScreen={false}
            coverAfterFirst={false}
            modifyImagesOnDarkMode={ModifyImagesOnDarkMode}
        />
    ), [floor.imageGallery, floor.videoGallery, floor.mainImage]);

    useEffect(() => {
        if (fetchId) {
            onFilterChange({_id: fetchId});
        }
    }, [fetchId, forceReload]);

    useImperativeHandle(innerRef, () => ({
        success: (data: Floor) => {
            setFloor(data);
        },
    }));

    if (hideAfterDeletion) {
        return <></>;
    }
    if (!read || !Object.keys(read).length) return <HiddenElement />;

    return (
        <EntityCardFetchGuard
            fetchId={fetchId}
            loading={loading}
            error={error}
            failedTitle={resolveLanguageKey("failedTitle")}
            failedDescription={resolveLanguageKey("failedDescription")}
            onRetry={() => setForceReload((prev) => prev + 1)}
        >
            <>
                <EntityCardShell
                    onClick={fetchId ? undefined : () => setAction("view")}
                    disableClick={!!fetchId}
                >
                    <EntityMediaHeader
                        carouselKey={"floor_carousel" + floor._id}
                        showMedia={!!(read?.mainImage || read?.imageGallery || read?.videoGallery)}
                        gallery={galleryMemo}
                        title={floor.name}
                        subtitle={floor.edifice?.name}
                        showTitle={!!read?.name}
                        showSubtitle={!!floor.edifice?.name}
                        hideActions={hideActions}
                        actionMenu={
                            <ActionMenu
                                accessModel={"floors"}
                                deletedData={floor}
                                onAction={(a: string) => setAction(a)}
                                editPath={buildFloorEditPath(floor)}
                                allowMenuForCustomChildren={!!readUnits}
                            >
                                <ViewUnits floor={floor} />
                                <ViewUnitsOverlay onAction={(a: string) => setAction(a)} />
                            </ActionMenu>
                        }
                    />
                    <div className={CARD_BODY_CLASS}>
                        <div className={CARD_INFO_ROWS_CLASS}>
                            <InfoRow
                                icon={IconDoor}
                                label={resolveLanguageKey("data.units")}
                                tooltip={resolveLanguageKey("data.units")}
                                show={!!read?.totalUnits}
                                value={floor.totalUnits}
                            />
                            <InfoRow
                                icon={IconGrid4x4}
                                label={resolveLanguageKey("data.area")}
                                tooltip={resolveLanguageKey("data.area")}
                                show={!!read?.area}
                                value={floor.area != null && formatCardAreaM2(floor.area)}
                            />
                        </div>
                        {(!!floor.isAccessible || !!floor.hasEmergencyExit) && (
                            <div className="flex flex-wrap gap-1">
                                {!!floor.isAccessible && !!read?.isAccessible && (
                                    <span className="inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-md bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400 font-medium">
                                        <IconWheelchair className="h-3 w-3" />
                                        {resolveLanguageKey("data.isAccessible")}
                                    </span>
                                )}
                                {!!floor.hasEmergencyExit && !!read?.hasEmergencyExit && (
                                    <span className="inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-md bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400 font-medium">
                                        <IconFireExtinguisher className="h-3 w-3" />
                                        {resolveLanguageKey("data.hasEmergencyExit")}
                                    </span>
                                )}
                            </div>
                        )}
                        {!!floor.statistics?.unitsByStatus && (
                            <div className="flex flex-col gap-1">
                                <Separator />
                                <EntityStatusBadgeRow
                                    unitsByStatus={floor.statistics.unitsByStatus}
                                    resolveLanguageKey={resolveLanguageKey}
                                />
                            </div>
                        )}
                    </div>
                </EntityCardShell>

                {!!action && (
                    <>
                        {action === "view" && (
                            <FloorSheetView
                                open={action === "view"}
                                onOpenChange={() => setAction("")}
                                floor={floor}
                                onDelete={onDelete}
                                onRestore={onRestore}
                            />
                        )}
                        {action === "delete" && (
                            <DeleteAction
                                accessModel={"floors"}
                                deleteId={floor._id}
                                openAlert={action === "delete"}
                                name={read?.name && floor.name}
                                confirmName={read?.name && floor.name}
                                onSuccess={onDelete}
                                onCancel={() => setAction("")}
                                url={`/api/realEstate/floor`}
                            />
                        )}
                        {action === "restore" && (
                            <RestoreAction
                                accessModel={"floors"}
                                deleteId={floor._id}
                                openAlert={action === "restore"}
                                name={read?.name && floor.name}
                                confirmName={read?.name && floor.name}
                                onSuccess={onRestore}
                                onCancel={() => setAction("")}
                                url={`/api/realEstate/floor/restore`}
                            />
                        )}
                        {action === "viewUnitsOverlay" && (
                            <UnitsOverlay
                                floorMainImageId={floor.mainImage?._id ?? ""}
                                floorName={floor.name}
                                unitsCoordinates={floor.unitsCoordinates}
                                openUnitOverlay={action === "viewUnitsOverlay"}
                                onClose={() => setAction("")}
                            />
                        )}
                    </>
                )}
            </>
        </EntityCardFetchGuard>
    );
}

export default compose(
    (Component: any) => withDeletedDrawer(Component, (props: any) => props.floor),
    withLanguage("src/modules/propertyManagement/clients/panel/private/floors/center/cardView/floorCard.tsx"),
    withAxios(
        {
            url: "/api/realEstate/floor/single",
            method: "POST",
            data: {},
        },
        true,
    ),
    withDebug(true, true),
)(FloorCard);
