import {compose} from "redux";
import withLanguage, {type ResolveLanguageKey, WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {IconCalendarClock, IconCurrencyDollar, IconHome, IconNotes, IconUser} from "@tabler/icons-react";
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
import DisplayValue from "@coreModule/components/custom/displayValue/displayValue.tsx";
import EntityCard from "@coreModule/components/custom/systemCards/entityCard.tsx";
import {Badge} from "@coreModule/components/ui/badge.tsx";
import {Separator} from "@coreModule/components/ui/separator.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import {
    CARD_INFO_ROWS_TWO_COL_CLASS,
    STATUS_BADGE_DANGER,
    STATUS_BADGE_INFO,
    STATUS_BADGE_NEUTRAL,
    STATUS_BADGE_SUCCESS,
    STATUS_BADGE_WARNING,
} from "@coreModule/components/custom/cards/entityCard.constants.ts";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import {useEffect, type ReactNode, type RefObject} from "react";

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

/** Whole UTC calendar days from today to expiration day. 0 = expires today. */
function utcCalendarDaysUntilExpirationDay(iso: string): number {
    const exp = new Date(iso);
    const expStart = Date.UTC(exp.getUTCFullYear(), exp.getUTCMonth(), exp.getUTCDate());
    const n = new Date();
    const todayStart = Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate());
    return Math.round((expStart - todayStart) / 86400000);
}

function reservationStatusBadgeClass(status: NonNullable<Reservation["status"]>): string {
    switch (status) {
        case "active":
            return STATUS_BADGE_NEUTRAL;
        case "converted":
            return STATUS_BADGE_SUCCESS;
        case "expired":
        case "cancelled":
            return STATUS_BADGE_DANGER;
        default:
            return STATUS_BADGE_NEUTRAL;
    }
}

function expirationBadgeMeta(
    expirationDate: string,
    resolveLanguageKey: ResolveLanguageKey,
): {label: string; className: string} {
    const days = utcCalendarDaysUntilExpirationDay(expirationDate);
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
    const expiration = expirationDate ? expirationBadgeMeta(expirationDate, resolveLanguageKey) : null;

    if (!status && !expiration && !notes) return null;

    return (
        <>
            {status ? (
                <DisplayValue path="status" value={status}>
                    {() => (
                        <Badge variant="outline" className={cn("text-xs", reservationStatusBadgeClass(status))}>
                            {String(resolveLanguageKey(`statusValues.${status}`, true) || status)}
                        </Badge>
                    )}
                </DisplayValue>
            ) : null}
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
            {({entity, setAction}) => {
                const hasNotes = Boolean(entity.reservationNotes?.trim());
                const hasBadges = Boolean(entity.status || entity.expirationDate || hasNotes);
                return (
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
                        badges={
                            hasBadges ? (
                                <ReservationCardBadges entity={entity} resolveLanguageKey={resolveLanguageKey} />
                            ) : undefined
                        }
                    >
                        <ReservationRowMenuExtras reservation={entity} onAction={setAction} />
                    </EntityCard.Header>
                    {hasBadges && (
                        <Separator className="-mx-(--density-pad) w-auto self-stretch" />
                    )}
                    {!extraSmall && (
                        <EntityCard.Body className={CARD_INFO_ROWS_TWO_COL_CLASS}>
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
                                type="dateTime"
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
                );
            }}
        </EntityCard>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/reservations/center/cardView/reservationCard.tsx"),
    withDebug(true, true, "reservations"),
)(ReservationCard);
