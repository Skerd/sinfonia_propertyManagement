import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {IconCalendarClock, IconCurrencyDollar, IconHome, IconUser} from "@tabler/icons-react";
import {Reservation} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/reservation/reservation.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import CopyTooltip from "@coreModule/components/custom/copyTooltip.tsx";
import ReservationRowMenuExtras from "@propertyManagementModule/clients/panel/private/reservations/center/actions/reservationRowMenuExtras.tsx";
import CancelReservationDialog from "@propertyManagementModule/components/custom/reservations/cancelReservationDialog.tsx";
import ReinstateReservationDialog from "@propertyManagementModule/components/custom/reservations/reinstateReservationDialog.tsx";
import PaidInFullReservationDialog from "@propertyManagementModule/components/custom/reservations/paidInFullReservationDialog.tsx";
import ReverseReservationPaymentDialog from "@propertyManagementModule/components/custom/reservations/reverseReservationPaymentDialog.tsx";
import ManualReservationClientEmailDialog, {
    parseManualClientEmailAction,
} from "@propertyManagementModule/components/custom/reservations/manualReservationClientEmailDialog.tsx";
import ReservationSheetView from "@propertyManagementModule/clients/panel/private/reservations/center/sheetView/reservationSheetView.tsx";
import DisplayRow from "@coreModule/components/custom/displayValue/displayRow.tsx";
import EntityCard from "@coreModule/components/custom/systemCards/entityCard.tsx";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import {useEffect, type RefObject} from "react";

function ReservationReady({
    entity,
    onReady,
}: {
    entity: Reservation;
    onReady?: (reservation: Reservation) => void;
}) {
    useEffect(() => {
        onReady?.(entity);
    }, [entity, onReady]);
    return null;
}

type ReservationCardProps = WithLanguageType & {
    reservation: Reservation;
    fetchId?: string;
    hideActions?: boolean;
    onDelete?: (reservation?: Reservation, response?: DeletedData) => void;
    onRestore?: () => void;
    onModifySuccess?: (updatedReservation?: Reservation) => void;
    sheetOnly?: boolean;
    small?: boolean;
    extraSmall?: boolean;
    onReady?: (reservation: Reservation) => void;
    innerRef?: RefObject<WithAxiosLifecycleRef<Reservation> | null>;
};

function ReservationCard({
    reservation,
    resolveLanguageKey,
    fetchId,
    hideActions = false,
    onDelete,
    onRestore,
    onModifySuccess,
    sheetOnly = false,
    small,
    extraSmall,
    onReady,
    innerRef,
}: ReservationCardProps) {
    return (
        <EntityCard
            resource="reservations"
            entity={reservation}
            fetchId={fetchId}
            singleUrl="/api/realEstate/unit/reservation/single"
            onDelete={onDelete}
            onRestore={onRestore}
            hideActions={hideActions}
            hideEdit
            sheetOnly={sheetOnly}
            editPath={() => ""}
            Sheet={ReservationSheetView}
            sheetEntityProp="reservation"
            deleteUrl="/api/realEstate/unit/reservation"
            restoreUrl="/api/realEstate/unit/reservation/restore"
            failedTitle={String(resolveLanguageKey("failedTitle"))}
            failedDescription={String(resolveLanguageKey("failedDescription"))}
            titlePath="name"
            innerRef={innerRef}
            sheetProps={({entity, setEntity}) => ({
                fetchId,
                onModifySuccess: (updated?: Reservation) => {
                    if (updated) setEntity({...entity, ...updated});
                    onModifySuccess?.(updated);
                },
            })}
            extraDialogs={({action, setAction, entity, setEntity}) => {
                const handleModify = (updated?: Reservation) => {
                    if (updated) setEntity({...entity, ...updated});
                    onModifySuccess?.(updated);
                    setAction("");
                };
                const manualEmailAction = parseManualClientEmailAction(action);
                return (
                    <>
                        {action === "cancel" && (
                            <CancelReservationDialog open onClose={() => setAction("")} reservation={entity} onSuccess={handleModify} />
                        )}
                        {action === "reinstate" && (
                            <ReinstateReservationDialog open onClose={() => setAction("")} reservation={entity} onSuccess={handleModify} />
                        )}
                        {action === "paidInFull" && (
                            <PaidInFullReservationDialog open onClose={() => setAction("")} reservation={entity} onSuccess={handleModify} />
                        )}
                        {action === "reversePayment" && (
                            <ReverseReservationPaymentDialog open onClose={() => setAction("")} reservation={entity} onSuccess={handleModify} />
                        )}
                        {manualEmailAction && (
                            <ManualReservationClientEmailDialog
                                open
                                onClose={() => setAction("")}
                                reservation={entity}
                                pendingAction={manualEmailAction}
                                onSuccess={handleModify}
                            />
                        )}
                    </>
                );
            }}
        >
            {({entity, setAction}) => (
                <>
                    <ReservationReady entity={entity} onReady={onReady} />
                    <EntityCard.Header
                        titlePath="name"
                        title={
                            <span className="flex items-center gap-1 truncate">
                                {extraSmall ? (
                                    <>
                                        <span>{resolveLanguageKey("reservation")}:</span>
                                        <span>{entity.name}</span>
                                    </>
                                ) : (
                                    entity.name
                                )}
                                <CopyTooltip text={entity.name} />
                            </span>
                        }
                    >
                        <ReservationRowMenuExtras reservation={entity} onAction={setAction} />
                    </EntityCard.Header>
                    {!extraSmall && (
                        <EntityCard.Body>
                            <DisplayRow
                                icon={IconHome}
                                label={entity.unit?.unitType?.name ?? resolveLanguageKey("unit")}
                                tooltip={entity.unit?.unitType?.name ?? resolveLanguageKey("unit")}
                                path="unit"
                                value={entity.unit?.name ?? entity.unit?.unitNumber}
                            />
                            <DisplayRow
                                icon={IconUser}
                                label={resolveLanguageKey("client")}
                                tooltip={resolveLanguageKey("client")}
                                path="client"
                                type="user"
                                value={entity.client}
                            />
                            <DisplayRow
                                icon={IconUser}
                                label={resolveLanguageKey("reservedBy")}
                                tooltip={resolveLanguageKey("reservedBy")}
                                path="reservedBy"
                                type="user"
                                value={entity.reservedBy}
                            />
                            <DisplayRow
                                icon={IconCalendarClock}
                                label={resolveLanguageKey("reservationDate")}
                                tooltip={resolveLanguageKey("reservationDate")}
                                path="reservationDate"
                                type="date"
                                value={entity.reservationDate}
                            />
                            {!small && (
                                <DisplayRow
                                    icon={IconCurrencyDollar}
                                    label={resolveLanguageKey("depositAmount")}
                                    tooltip={resolveLanguageKey("depositAmount")}
                                    path="depositAmount"
                                    type="currency"
                                    value={{amount: entity.depositAmount, currency: entity.depositCurrency}}
                                />
                            )}
                        </EntityCard.Body>
                    )}
                </>
            )}
        </EntityCard>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/reservations/center/cardView/reservationCard.tsx"),
    withDebug(true, true),
)(ReservationCard);
