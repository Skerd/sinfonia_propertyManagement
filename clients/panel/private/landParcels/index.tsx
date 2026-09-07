import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage from "@coreModule/components/entityPage/EntityListPage.tsx";
import {GRID_TRANSACTIONAL} from "@propertyManagementModule/components/custom/cards/entityCard.constants.ts";
import {IconPlus} from "@tabler/icons-react";
import type {LandParcel} from "armonia/src/modules/propertyManagement/api/realEstate/private/landParcel/landParcel.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import LandParcelCard from "@propertyManagementModule/clients/panel/private/landParcels/center/cardView/landParcelCard.tsx";
import StartDueDiligence, {START_DUE_DILIGENCE_LAND_PARCEL_ACTION} from "@propertyManagementModule/clients/panel/private/landParcels/center/actions/startDueDiligence.tsx";
import AddDueDiligenceStep, {ADD_DUE_DILIGENCE_STEP_LAND_PARCEL_ACTION} from "@propertyManagementModule/clients/panel/private/landParcels/center/actions/addDueDiligenceStep.tsx";
import ConcludeDueDiligence, {CONCLUDE_DUE_DILIGENCE_LAND_PARCEL_ACTION} from "@propertyManagementModule/clients/panel/private/landParcels/center/actions/concludeDueDiligence.tsx";
import DisposeLandParcel, {DISPOSE_LAND_PARCEL_ACTION} from "@propertyManagementModule/clients/panel/private/landParcels/center/actions/dispose.tsx";
import StartDueDiligenceLandParcelDialog from "@propertyManagementModule/components/custom/landParcels/startDueDiligenceLandParcelDialog.tsx";
import AddDueDiligenceStepLandParcelDialog from "@propertyManagementModule/components/custom/landParcels/addDueDiligenceStepLandParcelDialog.tsx";
import ConcludeDueDiligenceLandParcelDialog from "@propertyManagementModule/components/custom/landParcels/concludeDueDiligenceLandParcelDialog.tsx";
import DisposeLandParcelDialog from "@propertyManagementModule/components/custom/landParcels/disposeLandParcelDialog.tsx";

interface Props extends WithLanguageType {
    projectId?: string;
    projectName?: string;
}

function buildEditPath(row: LandParcel) {
    const params = new URLSearchParams();
    params.set("landParcelId", row._id);
    if (row.name) params.set("landParcelName", row.name);
    return `/realEstate/landParcels/edit?${params.toString()}`;
}

function AllLandParcels({resolveLanguageKey, projectId}: Props) {
    return (
        <EntityListPage<LandParcel>
            apiUrl="/api/realEstate/landParcel"
            collectionName="landparcels"
            accessModel="landparcels"
            tableConfigKey="landparcels"
            createPath="/realEstate/landParcels/create"
            createIcon={<IconPlus className="h-4 w-4" />}
            createLanguageKey="createLandParcel"
            buildEditPath={buildEditPath}
            resolveLanguageKey={resolveLanguageKey}
            sheetLanguagePath="src/modules/propertyManagement/clients/panel/private/landParcels/center/sheetView/landParcelSheetView.tsx"
            cardViewClassName={GRID_TRANSACTIONAL}
            extraFilters={projectId ? {projectId} : undefined}
            rowActionMenu={{allowMenuForCustomChildren: true}}
            renderActionMenuChildren={(landParcel, bindRowAction) => (
                <>
                    <StartDueDiligence landParcel={landParcel} onAction={bindRowAction} />
                    <AddDueDiligenceStep landParcel={landParcel} onAction={bindRowAction} />
                    <ConcludeDueDiligence landParcel={landParcel} onAction={bindRowAction} />
                    <DisposeLandParcel landParcel={landParcel} onAction={bindRowAction} />
                </>
            )}
            renderFloatingModals={({action, entity, resetAction, listRef}) => {
                const onSuccess = (updated?: LandParcel) => {
                    if (updated?._id) listRef.current?.updateRow?.(updated._id, updated);
                    resetAction();
                };
                if (action === START_DUE_DILIGENCE_LAND_PARCEL_ACTION)
                    return <StartDueDiligenceLandParcelDialog open onClose={resetAction} landParcel={entity} onSuccess={onSuccess} />;
                if (action === ADD_DUE_DILIGENCE_STEP_LAND_PARCEL_ACTION)
                    return <AddDueDiligenceStepLandParcelDialog open onClose={resetAction} landParcel={entity} onSuccess={onSuccess} />;
                if (action === CONCLUDE_DUE_DILIGENCE_LAND_PARCEL_ACTION)
                    return <ConcludeDueDiligenceLandParcelDialog open onClose={resetAction} landParcel={entity} onSuccess={onSuccess} />;
                if (action === DISPOSE_LAND_PARCEL_ACTION)
                    return <DisposeLandParcelDialog open onClose={resetAction} landParcel={entity} onSuccess={onSuccess} />;
                return null;
            }}
            renderCard={(row, onDelete, onRestore, listRef) => (
                <LandParcelCard
                    entity={row}
                    onDelete={(r: LandParcel | undefined, response?: DeletedData) => onDelete(r, response)}
                    onRestore={() => onRestore(row)}
                    onActionSuccess={(updated?: LandParcel) =>
                        updated && listRef.current?.updateRow?.(updated._id, updated)
                    }
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/landParcels/index.tsx"),
    withDebug(true, true, "landparcels"),
)(AllLandParcels);
