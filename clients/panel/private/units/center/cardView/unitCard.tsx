import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {GalleryCarousel} from "@coreModule/components/custom/images/galleryCarousel.tsx";
import {ModifyImagesOnDarkMode} from "@propertyManagementModule/components/custom/images/modifyImagesOnDarkMode.tsx";
import {IconBath, IconDoor, IconGrid4x4, IconListDetails, IconStack, IconTag} from "@tabler/icons-react";
import {Unit} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/unit/unit.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import {UnitStatusBadge, resolveUnitStatusKey} from "@propertyManagementModule/components/custom/cards/UnitStatusBadge.tsx";
import UnitSheetView from "@propertyManagementModule/clients/panel/private/units/center/sheetView/unitSheetView.tsx";
import {buildUnitEditPath} from "@propertyManagementModule/clients/panel/private/units/unitNavigation.ts";
import {UnitDomainMenuItems} from "@propertyManagementModule/clients/panel/private/units/center/actions/unitDomainMenuItems.tsx";
import DisplayRow from "@coreModule/components/custom/displayValue/displayRow.tsx";
import EntityCard from "@coreModule/components/custom/systemCards/entityCard.tsx";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {RefObject} from "react";

type UnitCardProps = WithLanguageType & {
    unit: Unit;
    fetchId?: string;
    hideActions?: boolean;
    onDelete?: (response?: DeletedData) => void;
    onRestore?: () => void;
    sheetOnly?: boolean;
    small?: boolean;
    innerRef?: RefObject<WithAxiosLifecycleRef<Unit> | null>;
};

function UnitCard({
    unit,
    resolveLanguageKey,
    fetchId,
    hideActions = false,
    onDelete,
    onRestore,
    sheetOnly = false,
    small,
    innerRef,
}: UnitCardProps) {
    return (
        <EntityCard
            resource="units"
            entity={unit}
            fetchId={fetchId}
            singleUrl="/api/realEstate/unit/single"
            onDelete={onDelete ? (_entity, data) => onDelete(data) : undefined}
            onRestore={onRestore}
            hideActions={hideActions}
            sheetOnly={sheetOnly}
            editPath={buildUnitEditPath}
            Sheet={UnitSheetView}
            sheetEntityProp="unit"
            deleteUrl="/api/realEstate/unit"
            restoreUrl="/api/realEstate/unit/restore"
            failedTitle={String(resolveLanguageKey("failedTitle"))}
            failedDescription={String(resolveLanguageKey("failedDescription"))}
            titlePath="name"
            innerRef={innerRef}
            sheetProps={() => ({fetchId})}
        >
            {({entity}) => {
                const unitStatus =
                    entity.status ??
                    (entity.isAvailable != null
                        ? entity.isAvailable
                            ? "available_unit"
                            : "unavailable_unit"
                        : undefined);
                const showStatusBadge = resolveUnitStatusKey(entity.status, entity.isAvailable) != null;
                return (
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
                            badges={
                                showStatusBadge && unitStatus ? (
                                    <UnitStatusBadge
                                        status={unitStatus}
                                        resolveLanguageKey={resolveLanguageKey}
                                        variant="overlay"
                                    />
                                ) : undefined
                            }
                        >
                            <UnitDomainMenuItems
                                unitId={entity._id}
                                unitName={entity.name || entity.unitNumber || entity._id}
                            />
                        </EntityCard.Header>
                        <EntityCard.Body>
                            {!small && (
                                <>
                                    <DisplayRow
                                        icon={IconStack}
                                        label={resolveLanguageKey("floor")}
                                        tooltip={resolveLanguageKey("floor")}
                                        path="floor.name"
                                        value={entity.floor?.name}
                                    />
                                    <DisplayRow
                                        icon={IconListDetails}
                                        label={resolveLanguageKey("data.unitType")}
                                        tooltip={resolveLanguageKey("data.unitType")}
                                        path="unitType.name"
                                        value={entity.unitType?.name}
                                    />
                                </>
                            )}
                            <DisplayRow
                                icon={IconGrid4x4}
                                label={resolveLanguageKey("data.area")}
                                tooltip={resolveLanguageKey("data.area")}
                                path="area"
                                type="area"
                                value={entity.area}
                            />
                            <DisplayRow
                                icon={IconDoor}
                                label={resolveLanguageKey("data.rooms")}
                                tooltip={resolveLanguageKey("data.rooms")}
                                path="numberOfRooms"
                                type="number"
                                value={entity.numberOfRooms}
                            />
                            <DisplayRow
                                icon={IconBath}
                                label={resolveLanguageKey("data.numberOfBathrooms")}
                                tooltip={resolveLanguageKey("data.numberOfBathrooms")}
                                path="numberOfBathrooms"
                                type="number"
                                value={entity.numberOfBathrooms}
                            />
                            <DisplayRow
                                icon={IconTag}
                                label={resolveLanguageKey("data.price")}
                                tooltip={resolveLanguageKey("data.price")}
                                path="price"
                                type="currency"
                                value={{amount: entity.price, currency: entity.priceCurrency}}
                            />
                            <DisplayRow
                                icon={IconDoor}
                                label={resolveLanguageKey("features.balcony")}
                                tooltip={resolveLanguageKey("features.balcony")}
                                path="hasBalcony"
                                type="boolean"
                                value={entity.hasBalcony}
                            />
                            <DisplayRow
                                icon={IconDoor}
                                label={resolveLanguageKey("features.terrace")}
                                tooltip={resolveLanguageKey("features.terrace")}
                                path="hasTerrace"
                                type="boolean"
                                value={entity.hasTerrace}
                            />
                            <DisplayRow
                                icon={IconListDetails}
                                label={resolveLanguageKey("constructionStatusLabel")}
                                tooltip={resolveLanguageKey("constructionStatusLabel")}
                                path="constructionStatus"
                                type="enum"
                                languageKeyCategory="constructionStatus"
                                value={entity.constructionStatus}
                            />
                        </EntityCard.Body>
                    </>
                );
            }}
        </EntityCard>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/units/center/cardView/unitCard.tsx"),
    withDebug(true, true),
)(UnitCard);
