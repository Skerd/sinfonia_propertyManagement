import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {GalleryCarousel} from "@coreModule/components/custom/images/galleryCarousel.tsx";
import {ModifyImagesOnDarkMode} from "@propertyManagementModule/components/custom/images/modifyImagesOnDarkMode.tsx";
import {Floor} from "armonia/src/modules/propertyManagement/api/realEstate/private/floor/floor.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import {IconDoor, IconFireExtinguisher, IconGrid4x4, IconWheelchair} from "@tabler/icons-react";
import {EntityStatusBadgeRow} from "@propertyManagementModule/components/custom/cards/EntityStatusBreakdown.tsx";
import FloorSheetView from "@propertyManagementModule/clients/panel/private/floors/center/sheetView/floorSheetView.tsx";
import ViewUnits from "@propertyManagementModule/clients/panel/private/floors/center/actions/viewUnits.tsx";
import ViewUnitsOverlay from "@propertyManagementModule/clients/panel/private/floors/center/actions/viewUnitsOverlay.tsx";
import UnitsOverlay from "@propertyManagementModule/components/custom/floors/unitsOverlay.tsx";
import {buildFloorEditPath} from "@propertyManagementModule/clients/panel/private/floors";
import DisplayRow from "@coreModule/components/custom/displayValue/displayRow.tsx";
import EntityCard from "@coreModule/components/custom/systemCards/entityCard.tsx";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {RefObject} from "react";

type FloorCardProps = WithLanguageType & {
    floor: Floor;
    fetchId?: string;
    hideActions?: boolean;
    onDelete?: (deletedFloor?: Floor, response?: DeletedData) => void;
    onRestore?: () => void;
    sheetOnly?: boolean;
    innerRef?: RefObject<WithAxiosLifecycleRef<Floor> | null>;
};

function FloorCard({
    floor,
    resolveLanguageKey,
    fetchId,
    hideActions = false,
    onDelete,
    onRestore,
    sheetOnly = false,
    innerRef,
}: FloorCardProps) {
    return (
        <EntityCard
            resource="floors"
            entity={floor}
            fetchId={fetchId}
            singleUrl="/api/realEstate/floor/single"
            onDelete={onDelete}
            onRestore={onRestore}
            hideActions={hideActions}
            sheetOnly={sheetOnly}
            editPath={buildFloorEditPath}
            Sheet={FloorSheetView}
            sheetEntityProp="floor"
            deleteUrl="/api/realEstate/floor"
            restoreUrl="/api/realEstate/floor/restore"
            failedTitle={String(resolveLanguageKey("failedTitle"))}
            failedDescription={String(resolveLanguageKey("failedDescription"))}
            titlePath="name"
            innerRef={innerRef}
            sheetProps={() => ({fetchId})}
            extraDialogs={({action, setAction, entity}) => (
                <>
                    {action === "viewUnitsOverlay" && (
                        <UnitsOverlay
                            floorMainImageId={entity.mainImage?._id ?? ""}
                            floorName={entity.name}
                            unitsCoordinates={entity.unitsCoordinates}
                            openUnitOverlay
                            onClose={() => setAction("")}
                        />
                    )}
                </>
            )}
        >
            {({entity, setAction}) => (
                <>
                    <GalleryCarousel
                        mainImage={entity.mainImage}
                        imageGallery={entity.imageGallery || []}
                        videoGallery={entity.videoGallery || []}
                        showThumbnails={false}
                        allowFullScreen={false}
                        coverAfterFirst={false}
                        modifyImagesOnDarkMode={ModifyImagesOnDarkMode}
                    />
                    <EntityCard.Header
                        titlePath="name"
                        title={entity.name}
                        subtitle={entity.edifice?.name}
                        subtitlePath="edifice.name"
                    >
                        <ViewUnits floor={entity} />
                        <ViewUnitsOverlay onAction={setAction} />
                    </EntityCard.Header>
                    <EntityCard.Body>
                        <DisplayRow
                            icon={IconDoor}
                            label={resolveLanguageKey("data.units")}
                            tooltip={resolveLanguageKey("data.units")}
                            path="totalUnits"
                            type="number"
                            value={entity.totalUnits}
                        />
                        <DisplayRow
                            icon={IconGrid4x4}
                            label={resolveLanguageKey("data.area")}
                            tooltip={resolveLanguageKey("data.area")}
                            path="area"
                            type="area"
                            value={entity.area}
                        />
                        <DisplayRow
                            icon={IconWheelchair}
                            label={resolveLanguageKey("data.isAccessible")}
                            tooltip={resolveLanguageKey("data.isAccessible")}
                            path="isAccessible"
                            type="boolean"
                            value={entity.isAccessible}
                        />
                        <DisplayRow
                            icon={IconFireExtinguisher}
                            label={resolveLanguageKey("data.hasEmergencyExit")}
                            tooltip={resolveLanguageKey("data.hasEmergencyExit")}
                            path="hasEmergencyExit"
                            type="boolean"
                            value={entity.hasEmergencyExit}
                        />
                        {entity.statistics?.unitsByStatus ? (
                            <EntityStatusBadgeRow
                                unitsByStatus={entity.statistics.unitsByStatus}
                                resolveLanguageKey={resolveLanguageKey}
                            />
                        ) : null}
                    </EntityCard.Body>
                </>
            )}
        </EntityCard>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/floors/center/cardView/floorCard.tsx"),
    withDebug(true, true),
)(FloorCard);
