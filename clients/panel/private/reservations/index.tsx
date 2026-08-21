import {compose} from "redux";
import {useMemo} from "react";
import {useSearchParams} from "react-router-dom";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {IconSquarePlus2} from "@tabler/icons-react";
import {buildPageTitle} from "@coreModule/helpers/general";
import {Reservation} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/reservation/reservation.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import ReservationCard from "@propertyManagementModule/clients/panel/private/reservations/center/cardView/reservationCard.tsx";
import ReservationRowMenuExtras from "@propertyManagementModule/clients/panel/private/reservations/center/actions/reservationRowMenuExtras.tsx";
import CancelReservationDialog from "@propertyManagementModule/components/custom/reservations/cancelReservationDialog.tsx";
import ReinstateReservationDialog from "@propertyManagementModule/components/custom/reservations/reinstateReservationDialog.tsx";
import PaidInFullReservationDialog from "@propertyManagementModule/components/custom/reservations/paidInFullReservationDialog.tsx";
import ReverseReservationPaymentDialog from "@propertyManagementModule/components/custom/reservations/reverseReservationPaymentDialog.tsx";
import ManualReservationClientEmailDialog, {
    parseManualClientEmailAction,
} from "@propertyManagementModule/components/custom/reservations/manualReservationClientEmailDialog.tsx";
import EntityListPage, {type QuickFilterDef} from "@coreModule/components/entityPage/EntityListPage.tsx";
import {GRID_COLS_MAX_3, GRID_TRANSACTIONAL} from "@coreModule/components/custom/cards/entityCard.constants.ts";
import {cn} from "@coreModule/components/lib/utils.ts";
import {COLUMN_TYPE} from "armonia/src/modules/core/database/filter/typeOperators";

function decodeSearchParam(value: string | null): string | undefined {
    if (value == null || value === "") return undefined;
    try {
        return decodeURIComponent(value.replace(/\+/g, " "));
    } catch {
        return value;
    }
}

type AllReservationsProps = WithLanguageType & {
    unitId?: string;
    unitName?: string;
};

function AllReservations({resolveLanguageKey, unitId: propUnitId, unitName: propUnitName}: AllReservationsProps) {
    const [searchParams] = useSearchParams();
    const unitId = propUnitId ?? searchParams.get("unitId") ?? undefined;
    const unitName = propUnitName ?? decodeSearchParam(searchParams.get("unitName"));
    const edificeId = searchParams.get("edificeId") ?? undefined;
    const edificeName = decodeSearchParam(searchParams.get("edificeName"));

    const headerTitle = useMemo(
        () => buildPageTitle(resolveLanguageKey("title") as string, [edificeName, unitName]),
        [resolveLanguageKey, edificeName, unitName],
    );

    const headerDescription = useMemo(
        () =>
            (unitId
                ? resolveLanguageKey("descriptionWithContext")
                : resolveLanguageKey("description")) as string,
        [resolveLanguageKey, unitId],
    );

    const createPath = useMemo(() => {
        const p = new URLSearchParams();
        if (unitId) p.set("unitId", unitId);
        if (unitName) p.set("unitName", unitName);
        const qs = p.toString();
        return qs ? `/realEstate/reservations/create?${qs}` : "/realEstate/reservations/create";
    }, [unitId, unitName]);

    const extraFilters = useMemo(() => (unitId ? {unit: unitId} : undefined), [unitId]);
    const extraParams = useMemo(() => (edificeId ? {edifice: edificeId} : undefined), [edificeId]);

    const quickFilters = useMemo<QuickFilterDef[]>(() => [
        {
            field: "project",
            label: resolveLanguageKey("fields.project") as string,
            type: COLUMN_TYPE.OBJECT_ID,
            apiUrl: "/api/realEstate/project/select",
            asExtraParam: true,
        },
        {
            field: "edifice",
            label: resolveLanguageKey("fields.edifice") as string,
            type: COLUMN_TYPE.OBJECT_ID,
            apiUrl: "/api/realEstate/edifice/select",
            dependsOn: "project",
            asExtraParam: true,
        },
        {
            field: "floor",
            label: resolveLanguageKey("fields.floor") as string,
            type: COLUMN_TYPE.OBJECT_ID,
            apiUrl: "/api/realEstate/floor/select",
            dependsOn: ["edifice", "project"],
            asExtraParam: true,
        },
        {
            field: "unit",
            label: resolveLanguageKey("fields.unit") as string,
            type: COLUMN_TYPE.OBJECT_ID,
            apiUrl: "/api/realEstate/unit/select",
            dependsOn: ["floor", "edifice", "project"],
        },
        {
            field: "status",
            label: resolveLanguageKey("status") as string,
            type: COLUMN_TYPE.ENUM,
            enumValues: [
                {value: "active",    label: resolveLanguageKey("active")    as string},
                {value: "expired",   label: resolveLanguageKey("expired")   as string},
                {value: "cancelled", label: resolveLanguageKey("cancelled") as string},
                {value: "converted", label: resolveLanguageKey("converted") as string},
            ],
        },
        {
            field: "isActive",
            label: resolveLanguageKey("fields.isActive") as string,
            type: COLUMN_TYPE.BOOLEAN,
        },
        {
            field: "paid",
            label: resolveLanguageKey("fields.paid") as string,
            type: COLUMN_TYPE.BOOLEAN,
        },
    ], [resolveLanguageKey]);

    return (
        <EntityListPage<Reservation>
            apiUrl="/api/realEstate/unit/reservation"
            collectionName="reservations"
            accessModel="reservations"
            tableConfigKey="reservations"
            extraParams={extraParams}
            createPath={createPath}
            createIcon={<IconSquarePlus2 className="h-4 w-4" />}
            createLanguageKey="createReservation"
            buildEditPath={() => ""}
            resolveLanguageKey={resolveLanguageKey}
            headerTitle={headerTitle}
            headerDescription={headerDescription}
            extraFilters={extraFilters}
            quickFilters={quickFilters}
            sheetLanguagePath="src/modules/propertyManagement/clients/panel/private/reservations/center/sheetView/reservationSheetView.tsx"
            cardViewClassName={cn(GRID_TRANSACTIONAL, GRID_COLS_MAX_3)}
            rowActionMenu={{
                allowMenuForCustomChildren: true,
                hideEdit: true,
            }}
            renderCard={(reservation, onDelete, onRestore, listRef) => (
                <ReservationCard
                    reservation={reservation}
                    onDelete={(row: Reservation | undefined, response?: DeletedData) =>
                        onDelete(row ?? reservation, response)
                    }
                    onRestore={() => onRestore(reservation)}
                    onModifySuccess={(updated: Reservation | undefined) =>
                        updated && listRef.current?.updateRow?.(updated._id, updated)
                    }
                />
            )}
            renderActionMenuChildren={(reservation, bindRowAction) => (
                <ReservationRowMenuExtras reservation={reservation} onAction={bindRowAction} />
            )}
            renderFloatingModals={({action, entity, resetAction, listRef}) => {
                const manualEmailAction = parseManualClientEmailAction(action);
                const onSuccess = (updated?: Reservation) => {
                    if (updated?._id) listRef.current?.updateRow?.(updated._id, updated);
                    resetAction();
                };
                return (
                    <>
                        {action === "cancel" && (
                            <CancelReservationDialog
                                open
                                onClose={resetAction}
                                reservation={entity}
                                onSuccess={onSuccess}
                            />
                        )}
                        {action === "reinstate" && (
                            <ReinstateReservationDialog
                                open
                                onClose={resetAction}
                                reservation={entity}
                                onSuccess={onSuccess}
                            />
                        )}
                        {action === "paidInFull" && (
                            <PaidInFullReservationDialog
                                open
                                onClose={resetAction}
                                reservation={entity}
                                onSuccess={onSuccess}
                            />
                        )}
                        {action === "reversePayment" && (
                            <ReverseReservationPaymentDialog
                                open
                                onClose={resetAction}
                                reservation={entity}
                                onSuccess={onSuccess}
                            />
                        )}
                        {manualEmailAction && (
                            <ManualReservationClientEmailDialog
                                open
                                onClose={resetAction}
                                reservation={entity}
                                pendingAction={manualEmailAction}
                                onSuccess={onSuccess}
                            />
                        )}
                    </>
                );
            }}
        />
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/reservations/index.tsx"),
    withDebug(true, true, "reservations"),
)(AllReservations);
