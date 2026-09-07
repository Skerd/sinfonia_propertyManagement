import {compose} from "redux";
import {useEffect, useState} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import type {LandParcel} from "armonia/src/modules/propertyManagement/api/realEstate/private/landParcel/landParcel.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import SheetViewRenderer from "@coreModule/components/viewEngine/SheetViewRenderer.tsx";
import {useViewConfig} from "@coreModule/helpers/hooks/useViewConfig.ts";
import StartDueDiligence, {START_DUE_DILIGENCE_LAND_PARCEL_ACTION} from "@propertyManagementModule/clients/panel/private/landParcels/center/actions/startDueDiligence.tsx";
import AddDueDiligenceStep, {ADD_DUE_DILIGENCE_STEP_LAND_PARCEL_ACTION} from "@propertyManagementModule/clients/panel/private/landParcels/center/actions/addDueDiligenceStep.tsx";
import ConcludeDueDiligence, {CONCLUDE_DUE_DILIGENCE_LAND_PARCEL_ACTION} from "@propertyManagementModule/clients/panel/private/landParcels/center/actions/concludeDueDiligence.tsx";
import DisposeLandParcel, {DISPOSE_LAND_PARCEL_ACTION} from "@propertyManagementModule/clients/panel/private/landParcels/center/actions/dispose.tsx";
import StartDueDiligenceLandParcelDialog from "@propertyManagementModule/components/custom/landParcels/startDueDiligenceLandParcelDialog.tsx";
import AddDueDiligenceStepLandParcelDialog from "@propertyManagementModule/components/custom/landParcels/addDueDiligenceStepLandParcelDialog.tsx";
import ConcludeDueDiligenceLandParcelDialog from "@propertyManagementModule/components/custom/landParcels/concludeDueDiligenceLandParcelDialog.tsx";
import DisposeLandParcelDialog from "@propertyManagementModule/components/custom/landParcels/disposeLandParcelDialog.tsx";

type Props = WithLanguageType & {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    entity?: LandParcel;
    hideActions?: boolean;
    onDelete?: (response?: DeletedData) => void;
    onRestore?: () => void;
    onActionSuccess?: (updated?: LandParcel) => void;
    fetchId?: string;
};

function Sheet({
    open,
    onOpenChange,
    entity,
    resolveLanguageKey,
    hideActions = false,
    onDelete = () => {},
    onRestore = () => {},
    onActionSuccess,
    fetchId,
}: Props) {
    const [sheetData, setSheetData] = useState<Record<string, any>>(entity || {_id: fetchId});
    const [action, setAction] = useState("");
    const access = useAccess("landparcels");
    const viewConfig = useViewConfig("landparcels", "sheet");
    useEffect(() => { if (entity) setSheetData(entity); }, [entity]);
    const entityId = entity?._id ?? fetchId;
    const asLandParcel = sheetData as LandParcel;
    if (!viewConfig || !entityId) return null;
    const params = new URLSearchParams();
    params.set("landParcelId", String(entityId));
    const handleSuccess = (updated?: LandParcel) => {
        if (updated) setSheetData(updated);
        onActionSuccess?.(updated);
        setAction("");
    };
    return (
        <>
            <SheetViewRenderer
                config={viewConfig}
                url="/api/realEstate/landParcel/single"
                fetchId={fetchId}
                onDataFetched={(data) => setSheetData(data)}
                data={sheetData}
                open={open}
                onOpenChange={onOpenChange}
                resolveLanguageKey={resolveLanguageKey}
                access={access}
                hideActions={hideActions}
                onDelete={onDelete}
                onRestore={onRestore}
                editPath={`/realEstate/landParcels/edit?${params.toString()}`}
                actionMenuAllowCustomChildren
                actionMenuChildren={
                    <>
                        <StartDueDiligence landParcel={asLandParcel} onAction={setAction} />
                        <AddDueDiligenceStep landParcel={asLandParcel} onAction={setAction} />
                        <ConcludeDueDiligence landParcel={asLandParcel} onAction={setAction} />
                        <DisposeLandParcel landParcel={asLandParcel} onAction={setAction} />
                    </>
                }
            />
            {action === START_DUE_DILIGENCE_LAND_PARCEL_ACTION && (
                <StartDueDiligenceLandParcelDialog open onClose={() => setAction("")} landParcel={asLandParcel} onSuccess={handleSuccess} />
            )}
            {action === ADD_DUE_DILIGENCE_STEP_LAND_PARCEL_ACTION && (
                <AddDueDiligenceStepLandParcelDialog open onClose={() => setAction("")} landParcel={asLandParcel} onSuccess={handleSuccess} />
            )}
            {action === CONCLUDE_DUE_DILIGENCE_LAND_PARCEL_ACTION && (
                <ConcludeDueDiligenceLandParcelDialog open onClose={() => setAction("")} landParcel={asLandParcel} onSuccess={handleSuccess} />
            )}
            {action === DISPOSE_LAND_PARCEL_ACTION && (
                <DisposeLandParcelDialog open onClose={() => setAction("")} landParcel={asLandParcel} onSuccess={handleSuccess} />
            )}
        </>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/landParcels/center/sheetView/landParcelSheetView.tsx"),
    withDebug(true, true, "landparcels"),
)(Sheet);
