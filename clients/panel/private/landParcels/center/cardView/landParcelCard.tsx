import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import type {LandParcel} from "armonia/src/modules/propertyManagement/api/realEstate/private/landParcel/landParcel.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import {Badge} from "@coreModule/components/ui/badge.tsx";
import Sheet from "@propertyManagementModule/clients/panel/private/landParcels/center/sheetView/landParcelSheetView.tsx";
import {STATUS_BADGE_NEUTRAL} from "@propertyManagementModule/components/custom/cards/entityCard.constants.ts";
import {cn} from "@coreModule/components/lib/utils.ts";
import EntityCard from "@coreModule/components/custom/systemCards/entityCard.tsx";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {RefObject} from "react";
import StartDueDiligence, {START_DUE_DILIGENCE_LAND_PARCEL_ACTION} from "@propertyManagementModule/clients/panel/private/landParcels/center/actions/startDueDiligence.tsx";
import AddDueDiligenceStep, {ADD_DUE_DILIGENCE_STEP_LAND_PARCEL_ACTION} from "@propertyManagementModule/clients/panel/private/landParcels/center/actions/addDueDiligenceStep.tsx";
import ConcludeDueDiligence, {CONCLUDE_DUE_DILIGENCE_LAND_PARCEL_ACTION} from "@propertyManagementModule/clients/panel/private/landParcels/center/actions/concludeDueDiligence.tsx";
import DisposeLandParcel, {DISPOSE_LAND_PARCEL_ACTION} from "@propertyManagementModule/clients/panel/private/landParcels/center/actions/dispose.tsx";
import StartDueDiligenceLandParcelDialog from "@propertyManagementModule/components/custom/landParcels/startDueDiligenceLandParcelDialog.tsx";
import AddDueDiligenceStepLandParcelDialog from "@propertyManagementModule/components/custom/landParcels/addDueDiligenceStepLandParcelDialog.tsx";
import ConcludeDueDiligenceLandParcelDialog from "@propertyManagementModule/components/custom/landParcels/concludeDueDiligenceLandParcelDialog.tsx";
import DisposeLandParcelDialog from "@propertyManagementModule/components/custom/landParcels/disposeLandParcelDialog.tsx";

function landParcelEditPath(entity: LandParcel) {
    const params = new URLSearchParams();
    params.set("landParcelId", entity._id);
    if (entity.name) params.set("landParcelName", entity.name);
    return `/realEstate/landParcels/edit?${params.toString()}`;
}

type LandParcelCardProps = WithLanguageType & {
    entity: LandParcel;
    fetchId?: string;
    hideActions?: boolean;
    onDelete?: (deleted?: LandParcel, response?: DeletedData) => void;
    onRestore?: () => void;
    onActionSuccess?: (updated?: LandParcel) => void;
    sheetOnly?: boolean;
    innerRef?: RefObject<WithAxiosLifecycleRef<LandParcel> | null>;
};

function LandParcelCard({
    resolveLanguageKey,
    entity,
    fetchId,
    hideActions = false,
    onDelete,
    onRestore,
    onActionSuccess,
    sheetOnly = false,
    innerRef,
}: LandParcelCardProps) {
    return (
        <EntityCard
            resource="landparcels"
            entity={entity}
            fetchId={fetchId}
            singleUrl="/api/realEstate/landParcel/single"
            onDelete={onDelete}
            onRestore={onRestore}
            hideActions={hideActions}
            sheetOnly={sheetOnly}
            editPath={landParcelEditPath}
            Sheet={Sheet}
            sheetEntityProp="entity"
            deleteUrl="/api/realEstate/landParcel"
            restoreUrl="/api/realEstate/landParcel/restore"
            failedTitle={String(resolveLanguageKey("failedTitle") || "")}
            failedDescription={String(resolveLanguageKey("failedDescription") || "")}
            titlePath="title"
            innerRef={innerRef}
            sheetProps={() => ({fetchId, onActionSuccess})}
            extraDialogs={({action, setAction, entity: row, setEntity}) => {
                const handleSuccess = (updated?: LandParcel) => {
                    if (updated) setEntity({...row, ...updated});
                    onActionSuccess?.(updated);
                    setAction("");
                };
                return (
                    <>
                        {action === START_DUE_DILIGENCE_LAND_PARCEL_ACTION && (
                            <StartDueDiligenceLandParcelDialog open onClose={() => setAction("")} landParcel={row} onSuccess={handleSuccess} />
                        )}
                        {action === ADD_DUE_DILIGENCE_STEP_LAND_PARCEL_ACTION && (
                            <AddDueDiligenceStepLandParcelDialog open onClose={() => setAction("")} landParcel={row} onSuccess={handleSuccess} />
                        )}
                        {action === CONCLUDE_DUE_DILIGENCE_LAND_PARCEL_ACTION && (
                            <ConcludeDueDiligenceLandParcelDialog open onClose={() => setAction("")} landParcel={row} onSuccess={handleSuccess} />
                        )}
                        {action === DISPOSE_LAND_PARCEL_ACTION && (
                            <DisposeLandParcelDialog open onClose={() => setAction("")} landParcel={row} onSuccess={handleSuccess} />
                        )}
                    </>
                );
            }}
        >
            {({entity: row, setAction}) => (
                <EntityCard.Header
                    titlePath="title"
                    title={row.title}
                    subtitle={row.name}
                    subtitlePath="name"
                    badges={row.status ? (
                        <Badge variant="secondary" className={cn("text-xs", STATUS_BADGE_NEUTRAL)}>{String(resolveLanguageKey(`status.${row.status}`, true) || resolveLanguageKey(`statuses.${row.status}`, true) || row.status)}</Badge>
                    ) : null}
                >
                    <StartDueDiligence landParcel={row} onAction={setAction} />
                    <AddDueDiligenceStep landParcel={row} onAction={setAction} />
                    <ConcludeDueDiligence landParcel={row} onAction={setAction} />
                    <DisposeLandParcel landParcel={row} onAction={setAction} />
                </EntityCard.Header>
            )}
        </EntityCard>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/landParcels/center/cardView/landParcelCard.tsx"),
    withDebug(true, true, "landparcels"),
)(LandParcelCard);
