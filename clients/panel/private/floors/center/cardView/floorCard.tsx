import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {AccessGatedGalleryCarousel} from "@coreModule/components/viewEngine/widgets/gallery/galleryCarousel.tsx";
import {Floor} from "armonia/src/modules/propertyManagement/api/realEstate/private/floor/floor.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import {IconDoor, IconGrid4x4} from "@tabler/icons-react";
import {EntityStatusBadgeRow} from "@propertyManagementModule/components/custom/cards/EntityStatusBreakdown.tsx";
import FloorSheetView from "@propertyManagementModule/clients/panel/private/floors/center/sheetView/floorSheetView.tsx";
import ViewUnits from "@propertyManagementModule/clients/panel/private/floors/center/actions/viewUnits.tsx";
import ViewUnitsOverlay from "@propertyManagementModule/clients/panel/private/floors/center/actions/viewUnitsOverlay.tsx";
import UnitsOverlay from "@propertyManagementModule/components/custom/floors/unitsOverlay.tsx";
import {buildFloorEditPath} from "@propertyManagementModule/clients/panel/private/floors";
import EntityCardRow from "@coreModule/components/entityPage/list/card/entityCardRow.tsx";
import EntityCard from "@coreModule/components/entityPage/list/card/entityCard.tsx";
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
            failedTitle={resolveLanguageKey("failedTitle")}
            failedDescription={resolveLanguageKey("failedDescription")}
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
            {({entity, read, setAction}) => (
                <>
                    <AccessGatedGalleryCarousel
                        read={read}
                        mainImage={entity.mainImage}
                        imageGallery={entity.imageGallery || []}
                        videoGallery={entity.videoGallery || []}
                        showThumbnails={false}
                        allowFullScreen={false}
                        coverAfterFirst={false}
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
                    {/* How many units, how big, and how they stand (UX-02); accessibility and exits stay on the sheet. */}
                    {/* A floor without units or a measured area leaves that row off (UX-02). */}
                    <EntityCard.Body>
                        {entity.totalUnits ? (
                            <EntityCardRow
                                icon={IconDoor}
                                label={resolveLanguageKey("data.units")}
                                tooltip={resolveLanguageKey("data.units")}
                                path="totalUnits"
                                type="number"
                                value={entity.totalUnits}
                            />
                        ) : null}
                        {entity.area ? (
                            <EntityCardRow
                                icon={IconGrid4x4}
                                label={resolveLanguageKey("data.area")}
                                tooltip={resolveLanguageKey("data.area")}
                                path="area"
                                type="area"
                                value={entity.area}
                            />
                        ) : null}
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
    withDebug(true, true, "floors"),
)(FloorCard);
