import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {useEffect, useImperativeHandle, useMemo, useState} from "react";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useEntityCard} from "@coreModule/helpers/hooks/useEntityCard.ts";
import HiddenElement from "@coreModule/components/custom/hiddenElement.tsx";
import {GalleryCarousel} from "@coreModule/components/custom/images/galleryCarousel.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import TooltipDisplayer from "@coreModule/components/custom/tooltipDisplayer.tsx";
import {formatCardAreaM2, formatCardDecimal} from "@propertyManagementModule/helpers/general/formatCardNumber.ts";
import {Edifice} from "armonia/src/modules/propertyManagement/api/realEstate/private/edifice/edifice.dto.ts";
import {Separator} from "@coreModule/components/ui/separator.tsx";
import {Badge} from "@coreModule/components/ui/badge.tsx";
import InfoRow from "@coreModule/components/custom/infoRow.tsx";
import {
    IconCashBanknote,
    IconCarGarage,
    IconDoor,
    IconGrid4x4,
    IconStack,
    IconParkingCircle,
    IconTrees,
} from "@tabler/icons-react";
import {EntityCardShell} from "@propertyManagementModule/components/custom/cards/EntityCardShell.tsx";
import {EntityMediaHeader} from "@propertyManagementModule/components/custom/cards/EntityMediaHeader.tsx";
import {EntityStatusBadgeRow} from "@propertyManagementModule/components/custom/cards/EntityStatusBreakdown.tsx";
import {EntityCardFetchGuard} from "@propertyManagementModule/components/custom/cards/EntityCardFetchGuard.tsx";
import {CARD_BODY_CLASS, CARD_INFO_ROWS_CLASS} from "@propertyManagementModule/components/custom/cards/entityCard.constants.ts";
import EdificeSheetView from "@propertyManagementModule/clients/panel/private/edifices/center/sheetView/edificeSheetView.tsx";
import ViewFloors from "@propertyManagementModule/clients/panel/private/edifices/center/actions/viewFloors.tsx";
import ViewFloorsOverlay from "@propertyManagementModule/clients/panel/private/edifices/center/actions/viewFloorsOverlay.tsx";
import GenerateFloorsUnits from "@propertyManagementModule/clients/panel/private/edifices/center/actions/generateFloorsUnits.tsx";
import ActionMenu from "@coreModule/components/custom/actions/menu/actionMenu.tsx";
import DeleteAction from "@coreModule/components/custom/actions/deleteAction.tsx";
import RestoreAction from "@coreModule/components/custom/actions/restoreAction.tsx";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import FloorsOverlay from "@propertyManagementModule/components/custom/edifices/floorsOverlay.tsx";
import GenerateFloorsUnitsDialog from "@propertyManagementModule/components/custom/edifices/generateFloorsUnitsDialog.tsx";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import {withDeletedDrawer} from "@coreModule/helpers/hocs/withDeletedDrawer.tsx";
import {buildEdificeEditPath} from "@propertyManagementModule/clients/panel/private/edifices";

type EdificeCardProps = WithLanguageType & WithAxiosType<Edifice, {_id: string}> & {
    edifice: Edifice;
    projectId?: string;
    projectName?: string;
    single?: boolean;
    onDelete?: (deletedEdifice?: Edifice, response?: DeletedData) => void;
    onRestore?: () => void;
    hideActions?: boolean;
    fetchId?: string;
};

function EdificeCard({
    edifice: edificeProp,
    resolveLanguageKey,
    projectId,
    projectName,
    onDelete: onDeleteProp,
    onRestore: onRestoreProp,
    hideActions = false,
    fetchId,
    onFilterChange,
    loading,
    error,
    innerRef,
}: EdificeCardProps) {

    const {action, setAction, entity: edifice, setEntity: setEdifice, hideAfterDeletion, onDelete, onRestore} = useEntityCard({
        entityProp: edificeProp,
        onDeleteProp,
        onRestoreProp,
        syncPropOnChange: !fetchId,
    });

    const [forceReload, setForceReload] = useState<number>(1);

    const {read} = useAccess("edifices");
    const {read: readFloors} = useAccess("floors");

    const address = edifice.address;
    const addressString = [address?.city?.name, address?.state?.name, address?.country?.name, address?.street, address?.postalCode].filter(Boolean).join(", ");

    const galleryMemo = useMemo(
        () => (
            <GalleryCarousel
                mainImage={edifice.mainImage}
                imageGallery={edifice.imageGallery || []}
                videoGallery={edifice.videoGallery || []}
                showThumbnails={false}
                allowFullScreen={false}
                coverAfterFirst={true}
            />
        ),
        [edifice.imageGallery, edifice.videoGallery, edifice.mainImage],
    );

    useEffect(() => {
        if (fetchId) onFilterChange({_id: fetchId});
    }, [fetchId, forceReload]);

    useImperativeHandle(innerRef, () => ({
        success: (data: Edifice) => {
            setEdifice(data);
        },
    }));

    if (hideAfterDeletion) {
        return <></>;
    }
    if (!read || !Object.keys(read).length) {
        return <HiddenElement />;
    }

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
                    carouselKey={"edifice_carousel" + edifice._id}
                    showMedia={!!(read?.mainImage || read?.imageGallery || read?.videoGallery)}
                    gallery={galleryMemo}
                    title={edifice.name}
                    subtitle={addressString || undefined}
                    showTitle={!!read?.name}
                    showSubtitle={!!read?.address && !!addressString}
                    hideActions={hideActions}
                    actionMenu={
                        <ActionMenu
                            accessModel={"edifices"}
                            deletedData={edifice}
                            onAction={(a: string) => setAction(a)}
                            editPath={buildEdificeEditPath(edifice)}
                            allowMenuForCustomChildren={!!readFloors}
                        >
                            <ViewFloors edifice={edifice}/>
                            <ViewFloorsOverlay onAction={(a: string) => {setAction(a);}}/>
                            <GenerateFloorsUnits onAction={(a: string) => {setAction(a);}} />
                        </ActionMenu>
                    }
                />
                <div className={CARD_BODY_CLASS}>
                    {read && (
                        <div className={CARD_INFO_ROWS_CLASS}>
                                    <InfoRow
                                        icon={IconGrid4x4}
                                        label={resolveLanguageKey("data.totalArea")}
                                        tooltip={resolveLanguageKey("data.totalArea")}
                                        show={!!read?.totalArea}
                                        value={edifice.totalArea != null ? formatCardAreaM2(edifice.totalArea) : null}
                                    />
                                    <InfoRow
                                        icon={IconTrees}
                                        label={resolveLanguageKey("data.greenArea")}
                                        tooltip={resolveLanguageKey("data.greenArea")}
                                        show={!!read?.greenArea}
                                        value={edifice.greenArea != null ? formatCardAreaM2(edifice.greenArea) : null}
                                    />
                                    <InfoRow
                                        icon={IconParkingCircle}
                                        label={resolveLanguageKey("data.numberOfParkingSpaces")}
                                        tooltip={resolveLanguageKey("data.numberOfParkingSpaces")}
                                        show={!!read?.numberOfParkingSpaces}
                                        value={edifice.numberOfParkingSpaces}
                                    />
                                    <InfoRow
                                        icon={IconCarGarage}
                                        label={resolveLanguageKey("data.numberOfGarages")}
                                        tooltip={resolveLanguageKey("data.numberOfGarages")}
                                        show={!!read?.numberOfGarages}
                                        value={edifice.numberOfGarages}
                                    />
                                    <InfoRow
                                        icon={IconCashBanknote}
                                        label={resolveLanguageKey("data.investmentValue")}
                                        tooltip={resolveLanguageKey("data.investmentValueTooltip")}
                                        show={!!read?.investmentValue || !!read?.investmentCurrency}
                                        value={
                                            edifice.investmentValue != null && edifice.investmentCurrency?.symbol != null &&
                                            <span className="text-green-600">
                                                {edifice.investmentCurrency.symbol}
                                                {formatCardDecimal(edifice.investmentValue)}
                                            </span>
                                        }
                                    />
                                </div>
                            )}
                            {!!edifice.statistics && (
                                <div className="flex flex-col gap-1">
                                    <Separator />
                                    <div className={CARD_INFO_ROWS_CLASS}>
                                        <InfoRow
                                            icon={IconStack}
                                            label={resolveLanguageKey("statistics.floors")}
                                            tooltip={resolveLanguageKey("statistics.floorsTooltip")}
                                            value={edifice.statistics.totalFloors != null && edifice.statistics.totalFloors}
                                        />
                                        <InfoRow
                                            icon={IconDoor}
                                            label={resolveLanguageKey("statistics.units")}
                                            tooltip={resolveLanguageKey("statistics.unitsTooltip")}
                                            value={edifice.statistics.totalUnits != null && edifice.statistics.totalUnits}
                                        />
                                    </div>
                                    <EntityStatusBadgeRow
                                        unitsByStatus={edifice.statistics.unitsByStatus}
                                        resolveLanguageKey={resolveLanguageKey}
                                    />
                                </div>
                            )}
                            {!!edifice.constructors && edifice.constructors.length > 0 && (
                                <div className="flex flex-wrap gap-1 pt-0.5">
                                    {edifice.constructors.slice(0, 3).map(c => (
                                        <TooltipDisplayer key={c._id} tooltip={c.name}>
                                            <Badge variant="outline" className="text-xs">{c.name}</Badge>
                                        </TooltipDisplayer>
                                    ))}
                                    {edifice.constructors.length > 3 && (
                                        <TooltipDisplayer tooltip={edifice.constructors.slice(3).map(c => c.name).join(", ")}>
                                            <Badge variant="outline" className="text-xs">+{edifice.constructors.length - 3}</Badge>
                                        </TooltipDisplayer>
                                    )}
                                </div>
                            )}
                </div>
            </EntityCardShell>

            {!!action && (
                <>
                    {action === "viewFloorOverlay" && (
                        <FloorsOverlay
                            projectMainImageId={edifice.project?.mainImage?._id}
                            edificeName={edifice.name}
                            floorsCoordinates={edifice.floorsCoordinates}
                            openFloorOverlay={action === "viewFloorOverlay"}
                            onClose={() => {setAction("");}}
                        />
                    )}
                    {action === "generateFloorsUnits" && (
                        <GenerateFloorsUnitsDialog
                            open={action === "generateFloorsUnits"}
                            onClose={() => {setAction("");}}
                            edificeId={edifice._id}
                            projectId={typeof edifice.project === "object" && edifice.project ? edifice.project._id : String(edifice.project ?? "")}
                        />
                    )}
                    {action === "view" && (
                        <EdificeSheetView
                            open={action === "view"}
                            onOpenChange={() => setAction("")}
                            edifice={edifice}
                            projectId={projectId}
                            projectName={projectName}
                            onSheetRowPatched={(row: Record<string, unknown>) => {
                                setEdifice(row as Edifice);
                            }}
                            onDelete={onDelete}
                            onRestore={onRestore}
                        />
                    )}
                    {action === "delete" && (
                        <DeleteAction
                            accessModel={"edifices"}
                            deleteId={edifice._id}
                            openAlert={action === "delete"}
                            name={read?.name && edifice.name}
                            confirmName={read?.name && edifice.name}
                            onSuccess={onDelete}
                            onCancel={() => setAction("")}
                            url={`/api/realEstate/edifice`}
                        />
                    )}
                    {action === "restore" && (
                        <RestoreAction
                            accessModel={"edifices"}
                            deleteId={edifice._id}
                            openAlert={action === "restore"}
                            name={read?.name && edifice.name}
                            confirmName={read?.name && edifice.name}
                            onSuccess={onRestore}
                            onCancel={() => setAction("")}
                            url={`/api/realEstate/edifice/restore`}
                        />
                    )}
                </>
            )}
            </>
        </EntityCardFetchGuard>
    );
}

export default compose(
    (Component: any) => withDeletedDrawer(Component, (props: any) => props.edifice),
    withLanguage("src/modules/propertyManagement/clients/panel/private/edifices/center/cardView/edificeCard.tsx"),
    withAxios(
        {
            url: "/api/realEstate/edifice/single",
            method: "POST",
            data: {},
        },
        true,
    ),
    withDebug(true, true),
)(EdificeCard);
