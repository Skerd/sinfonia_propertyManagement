import {compose} from "redux";
import {useEffect, useState} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import {useViewConfig} from "@coreModule/helpers/hooks/useViewConfig.ts";
import SheetViewRenderer from "@coreModule/components/viewEngine/SheetViewRenderer.tsx";
import ReservationRowMenuExtras from "@propertyManagementModule/clients/panel/private/reservations/center/actions/reservationRowMenuExtras.tsx";
import CancelReservationDialog from "@propertyManagementModule/components/custom/reservations/cancelReservationDialog.tsx";
import ReinstateReservationDialog from "@propertyManagementModule/components/custom/reservations/reinstateReservationDialog.tsx";
import PaidInFullReservationDialog from "@propertyManagementModule/components/custom/reservations/paidInFullReservationDialog.tsx";
import ReverseReservationPaymentDialog from "@propertyManagementModule/components/custom/reservations/reverseReservationPaymentDialog.tsx";
import ManualReservationClientEmailDialog, {
    parseManualClientEmailAction,
} from "@propertyManagementModule/components/custom/reservations/manualReservationClientEmailDialog.tsx";
import {Reservation} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/reservation/reservation.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";

/** List route with optional unit filter (sidebar / units menu parity). */
export function reservationsListPath(unitId?: string, unitName?: string): string {
    const params = new URLSearchParams();
    if (unitId) params.set("unitId", unitId);
    if (unitName) params.set("unitName", unitName);
    const q = params.toString();
    return q ? `/realEstate/reservations?${q}` : "/realEstate/reservations";
}

export type ReservationSheetViewOwnProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    /** Full row from list/card, or bootstrap from DisplayCard while `/single` loads. */
    reservation?: Reservation;
    hideActions?: boolean;
    /** Same contract as {@link SheetViewRenderer}: delete modal passes {@link DeletedData} only. */
    onDelete?: (response?: DeletedData) => void;
    onRestore?: () => void;
    onModifySuccess?: (updated?: Reservation) => void;
    /** Mirrors sheet row patches / menu mutations into hosting list state (`EntityListPage`). */
    onSheetRowPatched?: (row: Record<string, unknown>) => void;
    fetchId?: string;
};

function ReservationSheetView({
    open,
    onOpenChange,
    reservation: reservationProp,
    resolveLanguageKey,
    hideActions = false,
    onDelete,
    onRestore,
    onModifySuccess,
    onSheetRowPatched,
    fetchId,
}: ReservationSheetViewOwnProps & WithLanguageType) {
    const access = useAccess("reservations");
    const viewConfig = useViewConfig("reservations", "sheet");
    const read = access.read && typeof access.read === "object" ? access.read : {};
    const [sheetData, setSheetData] = useState<Record<string, any>>(reservationProp || {_id: fetchId});
    const [action, setAction] = useState("");

    useEffect(() => {
        if (!open) setAction("");
    }, [open]);

    useEffect(() => {
        if (!reservationProp) return;
        setSheetData(reservationProp);
    }, [reservationProp]);

    const entityId = reservationProp?._id ?? fetchId;
    const asReservation = sheetData as Reservation;

    const deleteRestoreConfirmLabel = !!read.name && asReservation.name ? asReservation.name : undefined;

    if (!viewConfig) return null;
    if (!entityId) return null;

    const resolvedFetchId = fetchId ?? reservationProp?._id;
    const manualEmailAction = parseManualClientEmailAction(action);

    const handleWorkflowSuccess = (updated?: Reservation) => {
        if (updated) {
            setSheetData(updated);
            onModifySuccess?.(updated);
            onSheetRowPatched?.(updated);
        }
        setAction("");
    };

    return (
        <>
        <SheetViewRenderer
            config={viewConfig}
            url="/api/realEstate/unit/reservation/single"
            fetchId={resolvedFetchId}
            onDataFetched={(data) => {
                setSheetData(data);
            }}
            data={sheetData}
            open={open}
            onOpenChange={onOpenChange}
            resolveLanguageKey={resolveLanguageKey}
            access={access}
            hideActions={hideActions}
            onDelete={onDelete}
            onRestore={onRestore}
            editPath=""
            hideEdit
            deleteRestoreConfirmLabel={deleteRestoreConfirmLabel}
            actionMenuAllowCustomChildren={true}
            onSheetRowPatched={(row) => {
                setSheetData(row);
                onSheetRowPatched?.(row);
            }}
            actionMenuChildren={
                <ReservationRowMenuExtras
                    reservation={asReservation}
                    onAction={setAction}
                />
            }
        />
        {action === "cancel" && (
            <CancelReservationDialog
                open
                onClose={() => setAction("")}
                reservation={asReservation}
                onSuccess={handleWorkflowSuccess}
            />
        )}
        {action === "reinstate" && (
            <ReinstateReservationDialog
                open
                onClose={() => setAction("")}
                reservation={asReservation}
                onSuccess={handleWorkflowSuccess}
            />
        )}
        {action === "paidInFull" && (
            <PaidInFullReservationDialog
                open
                onClose={() => setAction("")}
                reservation={asReservation}
                onSuccess={handleWorkflowSuccess}
            />
        )}
        {action === "reversePayment" && (
            <ReverseReservationPaymentDialog
                open
                onClose={() => setAction("")}
                reservation={asReservation}
                onSuccess={handleWorkflowSuccess}
            />
        )}
        {manualEmailAction && (
            <ManualReservationClientEmailDialog
                open
                onClose={() => setAction("")}
                reservation={asReservation}
                pendingAction={manualEmailAction}
                onSuccess={handleWorkflowSuccess}
            />
        )}
        </>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/reservations/center/sheetView/reservationSheetView.tsx"),
    withDebug(true, true, "reservations"),
)(ReservationSheetView);
