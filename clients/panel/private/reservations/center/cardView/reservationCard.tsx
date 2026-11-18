import {compose} from "redux";
import withLanguage, {type ResolveLanguageKey, WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {IconCalendarClock, IconCurrencyDollar, IconHome, IconNotes} from "@tabler/icons-react";
import {Reservation} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/reservation/reservation.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import ReservationRowMenuExtras from "@propertyManagementModule/clients/panel/private/reservations/center/actions/reservationRowMenuExtras.tsx";
import CancelReservationDialog from "@propertyManagementModule/components/custom/reservations/cancelReservationDialog.tsx";
import ReinstateReservationDialog from "@propertyManagementModule/components/custom/reservations/reinstateReservationDialog.tsx";
import PaidInFullReservationDialog from "@propertyManagementModule/components/custom/reservations/paidInFullReservationDialog.tsx";
import ReverseReservationPaymentDialog from "@propertyManagementModule/components/custom/reservations/reverseReservationPaymentDialog.tsx";
import ManualReservationClientEmailDialog, {
    parseManualClientEmailAction,
} from "@propertyManagementModule/components/custom/reservations/manualReservationClientEmailDialog.tsx";
import ReservationSheetView from "@propertyManagementModule/clients/panel/private/reservations/center/sheetView/reservationSheetView.tsx";
import EntityCardRow from "@coreModule/components/entityPage/list/card/entityCardRow.tsx";
import DisplayValue from "@coreModule/components/viewEngine/widgets/display/displayValue.tsx";
import EntityCard from "@coreModule/components/entityPage/list/card/entityCard.tsx";
import {Badge} from "@coreModule/components/ui/badge.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import {
    STATUS_BADGE_DANGER,
    STATUS_BADGE_INFO,
    STATUS_BADGE_WARNING,
} from "@coreModule/components/entityPage/list/entityCard.constants.ts";
import StatusBadge from "@coreModule/components/entityPage/sheet/statusBadge.tsx";
import {getName} from "@coreModule/helpers/general/names.ts";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import {useEffect, type ReactNode, type RefObject} from "react";
import {calendarDaysUntil} from "@coreModule/helpers/general/dateTime.ts";
import {useCompanyTimeZone} from "@coreModule/helpers/hooks/useCompanyTimeZone.ts";

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


/** Badge for the expiration day, counted from the company's today (D116), like the expiry cron. */
function expirationBadgeMeta(
    days: number,
    resolveLanguageKey: ResolveLanguageKey,
): {label: string; className: string} {
    if (days < 0) {
        return {label: String(resolveLanguageKey("expired")), className: STATUS_BADGE_DANGER};
    }
    if (days === 0) {
        return {label: String(resolveLanguageKey("expiresToday")), className: STATUS_BADGE_WARNING};
    }
    if (days === 1) {
        return {label: String(resolveLanguageKey("expiresIn1Day")), className: STATUS_BADGE_WARNING};
    }
    const label = String(resolveLanguageKey("expiresInDays")).replace("{count}", String(days));
    return {
        label,
        className: days <= 3 ? STATUS_BADGE_WARNING : STATUS_BADGE_INFO,
    };
}

function ReservationCardBadges({
    entity,
    resolveLanguageKey,
}: {
    entity: Reservation;
    resolveLanguageKey: ResolveLanguageKey;
}): ReactNode {
    const status = entity.status;
    const expirationDate = entity.expirationDate;
    const notes = entity.reservationNotes?.trim();
    const days = calendarDaysUntil(expirationDate, useCompanyTimeZone());
    // The expiry only matters while the reservation still holds the unit.
    const expiration = days === null || status !== "active" ? null : expirationBadgeMeta(days, resolveLanguageKey);

    if (!status && !expiration && !notes) return null;

    return (
        <>
            <StatusBadge
                tableConfigKey="reservations"
                field="status"
                value={status}
                label={String(resolveLanguageKey(`statusValues.${status}`, true) || status)}
            />
            {expiration && expirationDate ? (
                <DisplayValue path="expirationDate" value={expirationDate}>
                    {() => (
                        <Badge variant="secondary" className={cn("text-xs gap-1", expiration.className)}>
                            <IconCalendarClock className="size-3" aria-hidden />
                            {expiration.label}
                        </Badge>
                    )}
                </DisplayValue>
            ) : null}
            {notes ? (
                <DisplayValue path="reservationNotes" value={notes}>
                    {() => (
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                            <IconNotes className="size-3" aria-hidden />
                            {String(resolveLanguageKey("notes"))}
                        </span>
                    )}
                </DisplayValue>
            ) : null}
        </>
    );
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
            failedTitle={resolveLanguageKey("failedTitle")}
            failedDescription={resolveLanguageKey("failedDescription")}
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
            {({entity, setAction}) => {
                // Without read access on the unit the API sends only its id.
                const readableUnit = entity.unit && "name" in entity.unit ? entity.unit : undefined;
                return (
                <>
                    <ReservationReady entity={entity} onReady={onReady} />
                    {/* Named by the client, the code beside it, the state as a badge (UX-01, UX-02). */}
                    <EntityCard.Header
                        titlePath={["client", "name"]}
                        title={getName(entity.client) || entity.name || "—"}
                        subtitlePath="name"
                        subtitle={getName(entity.client) ? entity.name : undefined}
                        badgesBesideTitle
                        badges={<ReservationCardBadges entity={entity} resolveLanguageKey={resolveLanguageKey} />}
                    >
                        <ReservationRowMenuExtras reservation={entity} onAction={setAction} />
                    </EntityCard.Header>
                    {!extraSmall && (
                        <EntityCard.Body>
                            <EntityCardRow
                                icon={IconHome}
                                label={readableUnit?.unitType?.name ?? resolveLanguageKey("unit")}
                                tooltip={readableUnit?.unitType?.name ?? resolveLanguageKey("unit")}
                                path="unit"
                                // Unit names repeat across buildings, so the building goes with it.
                                value={[readableUnit?.name ?? readableUnit?.unitNumber, readableUnit ? entity.edifice?.name : undefined].filter(Boolean).join(" · ")}
                            />
                            <EntityCardRow
                                icon={IconCalendarClock}
                                label={resolveLanguageKey("reservationDate")}
                                tooltip={resolveLanguageKey("reservationDate")}
                                path="reservationDate"
                                type="date"
                                value={entity.reservationDate}
                            />
                            {!small && (
                                <EntityCardRow
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
                );
            }}
        </EntityCard>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/reservations/center/cardView/reservationCard.tsx"),
    withDebug(true, true, "reservations"),
)(ReservationCard);
