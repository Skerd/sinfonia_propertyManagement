import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {AccessGatedGalleryCarousel} from "@coreModule/components/viewEngine/widgets/gallery/galleryCarousel.tsx";
import {ModifyImagesOnDarkMode} from "@propertyManagementModule/components/custom/images/modifyImagesOnDarkMode.tsx";
import {IconAlignLeft, IconGrid4x4, IconListDetails, IconTag} from "@tabler/icons-react";
import {Unit} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/unit/unit.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import {UnitStatusBadge, resolveUnitStatusKey} from "@propertyManagementModule/components/custom/cards/UnitStatusBadge.tsx";
import UnitSheetView from "@propertyManagementModule/clients/panel/private/units/center/sheetView/unitSheetView.tsx";
import {buildUnitEditPath} from "@propertyManagementModule/clients/panel/private/units/unitNavigation.ts";
import {UnitDomainMenuItems} from "@propertyManagementModule/clients/panel/private/units/center/actions/unitDomainMenuItems.tsx";
import EntityCardRow from "@coreModule/components/entityPage/list/card/entityCardRow.tsx";
import EntityCard from "@coreModule/components/entityPage/list/card/entityCard.tsx";
import {displayPlainText} from "@coreModule/components/viewEngine/widgets/display/displayValue.tsx";
import MarkUnavailableUnitDialog from "@propertyManagementModule/components/custom/units/markUnavailableUnitDialog.tsx";
import MarkAvailableUnitDialog from "@propertyManagementModule/components/custom/units/markAvailableUnitDialog.tsx";
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
            failedTitle={resolveLanguageKey("failedTitle")}
            failedDescription={resolveLanguageKey("failedDescription")}
            titlePath="name"
            innerRef={innerRef}
            sheetProps={() => ({fetchId})}
            extraDialogs={({action, setAction, entity, setEntity}) => {
                const handleModify = (updated?: Partial<Unit>) => {
                    if (updated) setEntity({...entity, ...updated});
                    setAction("");
                };
                return (
                    <>
                        {action === "markUnavailable" && (
                            <MarkUnavailableUnitDialog open onClose={() => setAction("")} unit={entity} onSuccess={handleModify} />
                        )}
                        {action === "markAvailable" && (
                            <MarkAvailableUnitDialog open onClose={() => setAction("")} unit={entity} onSuccess={handleModify} />
                        )}
                    </>
                );
            }}
        >
            {({entity, read, setAction}) => {
                const unitStatus =
                    entity.status ??
                    (entity.isAvailable != null
                        ? entity.isAvailable
                            ? "available_unit"
                            : "unavailable_unit"
                        : undefined);
                const showStatusBadge = resolveUnitStatusKey(entity.status, entity.isAvailable) != null;
                const kindAndFloor = [entity.unitType?.name, entity.floor?.name].filter(Boolean).join(" · ");
                const rooms = !entity.numberOfRooms ? "" : entity.numberOfRooms === 1 ? resolveLanguageKey("roomsCountOne") : resolveLanguageKey("roomsCount").replace("{count}", String(entity.numberOfRooms));
                return (
                    <>
                        <AccessGatedGalleryCarousel
                            read={read}
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
                            <UnitDomainMenuItems unit={entity} onAction={setAction} />
                        </EntityCard.Header>
                        {/* What it is and where, how big, what it costs (UX-02); features stay on the sheet. */}
                        <EntityCard.Body>
                            {!small && kindAndFloor ? (
                                <EntityCardRow
                                    icon={IconListDetails}
                                    label={resolveLanguageKey("data.unitType")}
                                    tooltip={resolveLanguageKey("data.unitType")}
                                    path="unitType"
                                    value={kindAndFloor}
                                />
                            ) : null}
                            <EntityCardRow
                                icon={IconGrid4x4}
                                label={resolveLanguageKey("data.area")}
                                tooltip={resolveLanguageKey("data.area")}
                                path="area"
                                value={[displayPlainText(entity.area, "area"), rooms].filter(Boolean).join(" · ")}
                            />
                            {entity.price != null ? (
                                <EntityCardRow
                                    icon={IconTag}
                                    label={resolveLanguageKey("data.price")}
                                    tooltip={resolveLanguageKey("data.price")}
                                    path="price"
                                    type="currency"
                                    value={{amount: entity.price, currency: entity.priceCurrency}}
                                />
                            ) : null}
                            {entity.unavailableNotes ? (
                                <EntityCardRow
                                    icon={IconAlignLeft}
                                    label={resolveLanguageKey("unavailableNotes")}
                                    tooltip={resolveLanguageKey("unavailableNotes")}
                                    path="unavailableNotes"
                                    value={entity.unavailableNotes}
                                />
                            ) : null}
                        </EntityCard.Body>
                    </>
                );
            }}
        </EntityCard>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/units/center/cardView/unitCard.tsx"),
    withDebug(true, true, "units"),
)(UnitCard);
