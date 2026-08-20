import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {GalleryCarousel} from "@coreModule/components/custom/images/galleryCarousel.tsx";
import {Edifice} from "armonia/src/modules/propertyManagement/api/realEstate/private/edifice/edifice.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import {
    IconCashBanknote,
    IconDoor,
    IconGrid4x4,
    IconStack,
    IconTrees,
} from "@tabler/icons-react";
import {EntityStatusBadgeRow} from "@propertyManagementModule/components/custom/cards/EntityStatusBreakdown.tsx";
import EdificeSheetView from "@propertyManagementModule/clients/panel/private/edifices/center/sheetView/edificeSheetView.tsx";
import ViewFloors from "@propertyManagementModule/clients/panel/private/edifices/center/actions/viewFloors.tsx";
import ViewFloorsOverlay from "@propertyManagementModule/clients/panel/private/edifices/center/actions/viewFloorsOverlay.tsx";
import GenerateFloorsUnits from "@propertyManagementModule/clients/panel/private/edifices/center/actions/generateFloorsUnits.tsx";
import FloorsOverlay from "@propertyManagementModule/components/custom/edifices/floorsOverlay.tsx";
import GenerateFloorsUnitsDialog from "@propertyManagementModule/components/custom/edifices/generateFloorsUnitsDialog.tsx";
import {buildEdificeEditPath} from "@propertyManagementModule/clients/panel/private/edifices";
import DisplayRow from "@coreModule/components/custom/displayValue/displayRow.tsx";
import EntityCard from "@coreModule/components/custom/systemCards/entityCard.tsx";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {RefObject} from "react";

type EdificeCardProps = WithLanguageType & {
    edifice: Edifice;
    projectId?: string;
    projectName?: string;
    fetchId?: string;
    hideActions?: boolean;
    onDelete?: (deletedEdifice?: Edifice, response?: DeletedData) => void;
    onRestore?: () => void;
    sheetOnly?: boolean;
    innerRef?: RefObject<WithAxiosLifecycleRef<Edifice> | null>;
};

function EdificeCard({
    edifice,
    resolveLanguageKey,
    projectId,
    projectName,
    fetchId,
    hideActions = false,
    onDelete,
    onRestore,
    sheetOnly = false,
    innerRef,
}: EdificeCardProps) {
    return (
        <EntityCard
            resource="edifices"
            entity={edifice}
            fetchId={fetchId}
            singleUrl="/api/realEstate/edifice/single"
            onDelete={onDelete}
            onRestore={onRestore}
            hideActions={hideActions}
            sheetOnly={sheetOnly}
            editPath={buildEdificeEditPath}
            Sheet={EdificeSheetView}
            sheetEntityProp="edifice"
            deleteUrl="/api/realEstate/edifice"
            restoreUrl="/api/realEstate/edifice/restore"
            failedTitle={String(resolveLanguageKey("failedTitle"))}
            failedDescription={String(resolveLanguageKey("failedDescription"))}
            titlePath="name"
            innerRef={innerRef}
            sheetProps={({entity, setEntity}) => ({
                fetchId,
                projectId,
                projectName,
                onSheetRowPatched: (row: Partial<Edifice>) => setEntity({...entity, ...row}),
            })}
            extraDialogs={({action, setAction, entity}) => (
                <>
                    {action === "viewFloorOverlay" && (
                        <FloorsOverlay
                            projectMainImageId={entity.project?.mainImage?._id}
                            edificeName={entity.name}
                            floorsCoordinates={entity.floorsCoordinates}
                            openFloorOverlay
                            onClose={() => setAction("")}
                        />
                    )}
                    {action === "generateFloorsUnits" && (
                        <GenerateFloorsUnitsDialog
                            open
                            onClose={() => setAction("")}
                            edificeId={entity._id}
                            projectId={
                                typeof entity.project === "object" && entity.project
                                    ? entity.project._id
                                    : String(entity.project ?? "")
                            }
                        />
                    )}
                </>
            )}
        >
            {({entity, setAction}) => {
                const address = entity.address;
                const addressString = [
                    address?.city?.name,
                    address?.state?.name,
                    address?.country?.name,
                    address?.street,
                    address?.postalCode,
                ]
                    .filter(Boolean)
                    .join(", ");
                return (
                    <>
                        <GalleryCarousel
                            mainImage={entity.mainImage}
                            imageGallery={entity.imageGallery || []}
                            videoGallery={entity.videoGallery || []}
                            showThumbnails={false}
                            allowFullScreen={false}
                            coverAfterFirst
                        />
                        <EntityCard.Header
                            titlePath="name"
                            title={entity.name}
                            subtitle={addressString || undefined}
                            subtitlePath="address"
                        >
                            <ViewFloors edifice={entity} />
                            <ViewFloorsOverlay onAction={setAction} />
                            <GenerateFloorsUnits onAction={setAction} />
                        </EntityCard.Header>
                        <EntityCard.Body>
                            <DisplayRow
                                icon={IconGrid4x4}
                                label={resolveLanguageKey("data.totalArea")}
                                tooltip={resolveLanguageKey("data.totalArea")}
                                path="totalArea"
                                type="area"
                                value={entity.totalArea}
                            />
                            <DisplayRow
                                icon={IconTrees}
                                label={resolveLanguageKey("data.greenArea")}
                                tooltip={resolveLanguageKey("data.greenArea")}
                                path="greenArea"
                                type="area"
                                value={entity.greenArea}
                            />
                            <DisplayRow
                                icon={IconCashBanknote}
                                label={resolveLanguageKey("data.investmentValue")}
                                tooltip={resolveLanguageKey("data.investmentValueTooltip")}
                                path="investmentValue"
                                type="currency"
                                value={{amount: entity.investmentValue, currency: entity.investmentCurrency}}
                            />
                            <DisplayRow
                                icon={IconStack}
                                label={resolveLanguageKey("statistics.floors")}
                                tooltip={resolveLanguageKey("statistics.floorsTooltip")}
                                show
                                path="statistics.totalFloors"
                                type="number"
                                value={entity.statistics?.totalFloors}
                            />
                            <DisplayRow
                                icon={IconDoor}
                                label={resolveLanguageKey("statistics.units")}
                                tooltip={resolveLanguageKey("statistics.unitsTooltip")}
                                show
                                path="statistics.totalUnits"
                                type="number"
                                value={entity.statistics?.totalUnits}
                            />
                            {entity.statistics?.unitsByStatus ? (
                                <EntityStatusBadgeRow
                                    unitsByStatus={entity.statistics.unitsByStatus}
                                    resolveLanguageKey={resolveLanguageKey}
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
    withLanguage("src/modules/propertyManagement/clients/panel/private/edifices/center/cardView/edificeCard.tsx"),
    withDebug(true, true, "edifices"),
)(EdificeCard);
