import {compose} from "redux";
import {useMemo} from "react";
import {useSearchParams} from "react-router-dom";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {IconSquarePlus2} from "@tabler/icons-react";
import {buildPageTitle} from "@coreModule/helpers/general/pageTitle.ts";
import {Reservation} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/reservation/reservation.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import ReservationCard from "@propertyManagementModule/clients/panel/private/reservations/center/cardView/reservationCard.tsx";
import ReservationRowMenuExtras from "@propertyManagementModule/clients/panel/private/reservations/center/actions/reservationRowMenuExtras.tsx";
import ReservationSheetView from "@propertyManagementModule/clients/panel/private/reservations/center/sheetView/reservationSheetView.tsx";
import CancelReservationDialog from "@propertyManagementModule/components/custom/reservations/cancelReservationDialog.tsx";
import ReinstateReservationDialog from "@propertyManagementModule/components/custom/reservations/reinstateReservationDialog.tsx";
import PaidInFullReservationDialog from "@propertyManagementModule/components/custom/reservations/paidInFullReservationDialog.tsx";
import ReverseReservationPaymentDialog from "@propertyManagementModule/components/custom/reservations/reverseReservationPaymentDialog.tsx";
import ManualReservationClientEmailDialog, {
    parseManualClientEmailAction,
} from "@propertyManagementModule/components/custom/reservations/manualReservationClientEmailDialog.tsx";
import EntityListPage, {EntityListCreateButton, EntityListHeader, type QuickFilterDef} from "@coreModule/components/entityPage/pages/entityListPage.tsx";
import {GRID_COLS_MAX_3, GRID_TRANSACTIONAL} from "@coreModule/components/entityPage/list/entityCard.constants.ts";
import {cn} from "@coreModule/components/lib/utils.ts";
import {COLUMN_TYPE} from "armonia/src/modules/core/database/filter/typeOperators";
import {RESERVATION_WHEN} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/reservation/reservation.constants.ts";

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
        () => buildPageTitle(resolveLanguageKey("title"), [edificeName, unitName]),
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
            // Not a stored field: the list route compares the expiration day with the company's today (UX-12).
            field: "when",
            label: resolveLanguageKey("fields.when"),
            type: COLUMN_TYPE.ENUM,
            enumValues: RESERVATION_WHEN.map((value) => ({
                value,
                label: resolveLanguageKey(`fields.!enums.when.${value}`),
            })),
            asExtraParam: true,
        },
        {
            field: "project",
            label: resolveLanguageKey("fields.project"),
            type: COLUMN_TYPE.OBJECT_ID,
            apiUrl: "/api/realEstate/project/select",
            asExtraParam: true,
        },
        {
            field: "edifice",
            label: resolveLanguageKey("fields.edifice"),
            type: COLUMN_TYPE.OBJECT_ID,
            apiUrl: "/api/realEstate/edifice/select",
            dependsOn: "project",
            asExtraParam: true,
        },
        {
            field: "floor",
            label: resolveLanguageKey("fields.floor"),
            type: COLUMN_TYPE.OBJECT_ID,
            apiUrl: "/api/realEstate/floor/select",
            dependsOn: ["edifice", "project"],
            asExtraParam: true,
        },
        {
            field: "unit",
            label: resolveLanguageKey("fields.unit"),
            type: COLUMN_TYPE.OBJECT_ID,
            apiUrl: "/api/realEstate/unit/select",
            dependsOn: ["floor", "edifice", "project"],
        },
        {
            field: "status",
            label: resolveLanguageKey("status"),
            type: COLUMN_TYPE.ENUM,
            enumValues: [
                {value: "active",    label: resolveLanguageKey("active")},
                {value: "expired",   label: resolveLanguageKey("expired")},
                {value: "cancelled", label: resolveLanguageKey("cancelled")},
                {value: "converted", label: resolveLanguageKey("converted")},
            ],
        },
        {
            field: "isActive",
            label: resolveLanguageKey("fields.isActive"),
            type: COLUMN_TYPE.BOOLEAN,
        },
        {
            field: "paid",
            label: resolveLanguageKey("fields.paid"),
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
            header={(ctx) => (
                <EntityListHeader ctx={ctx} title={headerTitle} description={headerDescription}>
                    <EntityListCreateButton
                        ctx={ctx}
                        path={createPath}
                        icon={<IconSquarePlus2 className="h-4 w-4" />}
                        labelKey="createReservation"
                    />
                </EntityListHeader>
            )}
            buildEditPath={() => ""}
            resolveLanguageKey={resolveLanguageKey}
            extraFilters={extraFilters}
            quickFilters={quickFilters}
            sheetLanguagePath="src/modules/propertyManagement/clients/panel/private/reservations/center/sheetView/reservationSheetView.tsx"
            cardViewClassName={cn(GRID_TRANSACTIONAL, GRID_COLS_MAX_3)}
            rowActionMenu={{
                allowMenuForCustomChildren: true,
                hideEdit: true,
            }}
            // A table row opens the same sheet as a card: titled by the client, with the lifecycle menu (UX-01).
            renderSheet={({entity, open, onOpenChange, onDelete, onRestore, listRef}) => (
                <ReservationSheetView
                    open={open}
                    onOpenChange={(o: boolean) => { if (!o) onOpenChange(); }}
                    reservation={entity}
                    onDelete={onDelete}
                    onRestore={onRestore}
                    onModifySuccess={(updated?: Reservation) =>
                        updated && listRef.current?.updateRow?.(updated._id, updated)
                    }
                />
            )}
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
