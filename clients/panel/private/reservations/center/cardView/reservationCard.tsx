import {compose} from "redux";
import {InfoRowGroup} from "@coreModule/components/custom/infoRowGroup.tsx";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import {useEffect, useImperativeHandle, useState} from "react";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import HiddenElement from "@coreModule/components/custom/hiddenElement.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import {Separator} from "@coreModule/components/ui/separator.tsx";
import TooltipDisplayer from "@coreModule/components/custom/tooltipDisplayer.tsx";
import InfoRow from "@coreModule/components/custom/infoRow.tsx";
import {format} from "date-fns";
import {
    IconCalendarClock,
    IconCircleCheck,
    IconCircleX,
    IconCurrencyDollar,
    IconFileText,
    IconHome,
    IconUser,
} from "@tabler/icons-react";
import {cn} from "@coreModule/components/lib/utils.ts";
import {Badge} from "@coreModule/components/ui/badge.tsx";
import {Reservation} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/reservation/reservation.dto.ts";
import type {SingleForm} from "armonia/src/modules/core/types/shared.types.ts";
import DeletedInfo from "@coreModule/components/custom/deletedInfo";
import ActionMenu from "@coreModule/components/custom/actions/menu/actionMenu.tsx";
import DeleteAction from "@coreModule/components/custom/actions/deleteAction.tsx";
import RestoreAction from "@coreModule/components/custom/actions/restoreAction.tsx";
import ReservationRowMenuExtras from "@propertyManagementModule/clients/panel/private/reservations/center/actions/reservationRowMenuExtras.tsx";
import CancelReservationDialog from "@propertyManagementModule/components/custom/reservations/cancelReservationDialog.tsx";
import ReinstateReservationDialog from "@propertyManagementModule/components/custom/reservations/reinstateReservationDialog.tsx";
import PaidInFullReservationDialog from "@propertyManagementModule/components/custom/reservations/paidInFullReservationDialog.tsx";
import ReverseReservationPaymentDialog from "@propertyManagementModule/components/custom/reservations/reverseReservationPaymentDialog.tsx";
import ManualReservationClientEmailDialog, {
    parseManualClientEmailAction,
} from "@propertyManagementModule/components/custom/reservations/manualReservationClientEmailDialog.tsx";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import CopyTooltip from "@coreModule/components/custom/copyTooltip.tsx";
import {MdiIcon} from "@coreModule/components/custom/mdiIcons/mdiIcon.tsx";
import ReservationSheetView from "@propertyManagementModule/clients/panel/private/reservations/center/sheetView/reservationSheetView.tsx";
import {useEntityCard} from "@coreModule/helpers/hooks/useEntityCard.ts";
import {EntityCardShell} from "@propertyManagementModule/components/custom/cards/EntityCardShell.tsx";
import {EntityCardFetchGuard} from "@propertyManagementModule/components/custom/cards/EntityCardFetchGuard.tsx";
import {EntityTextCardHeader} from "@propertyManagementModule/components/custom/cards/EntityTextCardHeader.tsx";
import {
    CARD_BODY_CLASS,
    STATUS_BADGE_DANGER,
    STATUS_BADGE_NEUTRAL,
    STATUS_BADGE_SUCCESS,
    STATUS_BADGE_WARNING,
} from "@propertyManagementModule/components/custom/cards/entityCard.constants.ts";

type ReservationCardProps = WithLanguageType &
    WithAxiosType<Reservation, SingleForm> & {
    reservation: Reservation;
    fetchId?: string;
    single?: boolean;
    onDelete?: (reservation?: Reservation, response?: DeletedData) => void;
    onRestore?: () => void;
    onModifySuccess?: (updatedReservation?: Reservation) => void;
    hideActions?: boolean;
    small?: boolean;
    extraSmall?: boolean;
    onReady?: (reservation: Reservation) => void;
};

function fullName(p: { fullName?: string; name?: string; surname?: string } | null | undefined): string | null {
    if (!p) return null;
    const s = p.fullName || [p.name, p.surname].filter(Boolean).join(" ").trim();
    return s.length > 0 ? s : null;
}

function reservationStatusClass(status: string): string {
    if (status === "active") return STATUS_BADGE_SUCCESS;
    if (status === "cancelled" || status === "expired") return STATUS_BADGE_DANGER;
    if (status === "converted") return STATUS_BADGE_SUCCESS;
    return STATUS_BADGE_NEUTRAL;
}

function ReservationCard({
    reservation: paramReservation,
    resolveLanguageKey,
    fetchId,
    onFilterChange,
    loading,
    error,
    innerRef,
    onDelete: onDeleteProp,
    onRestore: onRestoreProp = () => {},
    onModifySuccess,
    hideActions = false,
    small,
    extraSmall,
    onReady,
}: ReservationCardProps) {
    const {action, setAction, entity: reservation, setEntity: setReservation, hideAfterDeletion, onDelete, onRestore} = useEntityCard({
        entityProp: paramReservation,
        onDeleteProp,
        onRestoreProp,
        syncPropOnChange: !fetchId,
    });
    const [forceReload, setForceReload] = useState(1);
    const {read, restore} = useAccess("reservations");

    useEffect(() => {
        if (fetchId) {
            onFilterChange({_id: fetchId});
        }
    }, [fetchId, forceReload]);

    useImperativeHandle(innerRef, () => ({
        success: (data: unknown) => {
            const wrapped = data as {data?: Reservation[]};
            const next = Array.isArray(wrapped?.data) && wrapped.data.length > 0 ? wrapped.data[0] : (data as Reservation);
            setReservation(next);
        },
    }));

    useEffect(() => {
        onReady?.(reservation);
    }, [reservation, onReady]);

    if (!read || !Object.keys(read).length) {
        return <HiddenElement />;
    }
    if (hideAfterDeletion && !restore) {
        return <></>;
    }
    if (!reservation) {
        return <></>;
    }

    const manualEmailAction = parseManualClientEmailAction(action);

    const handleModify = (updated?: Reservation) => {
        if (updated) setReservation(updated);
        onModifySuccess?.(updated);
    };

    const formatMoney = (amount: number) => amount.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 });

    const expirationDateObj = reservation?.expirationDate ? new Date(reservation.expirationDate) : null;
    const now = new Date();
    const isExpired = expirationDateObj ? expirationDateObj < now : false;
    const daysUntilExpiry = expirationDateObj && !isExpired ? Math.ceil((expirationDateObj.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null;

    const depositDisplayValue = reservation?.depositAmount != null && reservation?.depositAmount > 0 ? `${formatMoney(reservation?.depositAmount)}${reservation?.depositCurrency?.name ? ` ${reservation?.depositCurrency.name}` : ""}` : null;

    const deleteRestoreName = !!read?.name ? reservation?.name : undefined;

    const statusBadges = (
        <>
            {!!read?.status && !!reservation.status && (
                <TooltipDisplayer tooltip={resolveLanguageKey("status")}>
                    <Badge variant="outline" className={cn("text-xs font-medium", reservationStatusClass(reservation.status))}>
                        {resolveLanguageKey(reservation.status)}
                    </Badge>
                </TooltipDisplayer>
            )}
            {!reservation.status && !!read?.isActive && !reservation.isActive && (
                <TooltipDisplayer tooltip={resolveLanguageKey("cancelled")}>
                    <Badge variant="outline" className={cn("text-xs", STATUS_BADGE_DANGER)}>
                        <IconCircleX className="h-3 w-3 mr-1" />
                        {resolveLanguageKey("cancelled")}
                    </Badge>
                </TooltipDisplayer>
            )}
            <HiddenElement>
                {read?.paid && (
                    <TooltipDisplayer tooltip={resolveLanguageKey("paidInFull")}>
                        <Badge variant="outline" className={cn("flex items-center gap-1 text-xs", STATUS_BADGE_SUCCESS)}>
                            <IconCircleCheck className="h-3 w-3" />
                            {resolveLanguageKey("paidInFull")}
                        </Badge>
                    </TooltipDisplayer>
                )}
            </HiddenElement>
            {!reservation.paid && reservation.reservationFinancialPaymentState === "partiallyPaid" && (
                <TooltipDisplayer tooltip={resolveLanguageKey("partiallyPaid")}>
                    <Badge variant="outline" className={cn("text-xs", STATUS_BADGE_WARNING)}>
                        {resolveLanguageKey("partiallyPaid")}
                    </Badge>
                </TooltipDisplayer>
            )}
            {!!reservation.expirationDate && !reservation.paid && (
                <TooltipDisplayer
                    show={!!read?.expirationDate && read?.paid}
                    tooltip={resolveLanguageKey("expirationDate") + ": " + format(new Date(reservation.expirationDate), "PPp")}
                >
                    <Badge
                        variant="outline"
                        className={cn(
                            "text-xs",
                            isExpired
                                ? STATUS_BADGE_DANGER
                                : (daysUntilExpiry != null && daysUntilExpiry <= 7)
                                    ? STATUS_BADGE_WARNING
                                    : STATUS_BADGE_NEUTRAL,
                        )}
                    >
                        <IconCalendarClock className="h-3 w-3 mr-1" />
                        {isExpired ? resolveLanguageKey("expired")
                            : daysUntilExpiry === 0 ? resolveLanguageKey("expiresToday")
                                : daysUntilExpiry === 1 ? resolveLanguageKey("expiresIn1Day")
                                    : resolveLanguageKey("expiresInDays").replace("{count}", String(daysUntilExpiry))}
                    </Badge>
                </TooltipDisplayer>
            )}
            {!!reservation.source && (
                <TooltipDisplayer tooltip={resolveLanguageKey("sourceType")}>
                    <Badge variant="outline" className="text-xs font-medium text-muted-foreground">
                        {resolveLanguageKey(`sources.${reservation.source}`)}
                    </Badge>
                </TooltipDisplayer>
            )}
            {!!reservation.reservationNotes && !!read?.reservationNotes && (
                <TooltipDisplayer tooltip={resolveLanguageKey("notes")}>
                    <Badge variant="outline" className="text-xs font-medium text-muted-foreground">
                        <IconFileText className="h-3 w-3 mr-1" />
                        {resolveLanguageKey("notes")}
                    </Badge>
                </TooltipDisplayer>
            )}
        </>
    );

    const cardContent = extraSmall ? (
        <EntityCardShell
            onClick={fetchId ? undefined : () => setAction("view")}
            disableClick={!!fetchId}
        >
            <div className="flex w-full items-stretch">
                {(read?.deletedBy || read?.deletedAt) && (
                    <DeletedInfo deletedAt={reservation.deletedAt} deletedBy={reservation.deletedBy} />
                )}
                <div className="w-full min-w-0">
                    <EntityTextCardHeader
                        title={
                            <span className="flex items-center gap-1 truncate">
                                <span>{resolveLanguageKey("reservation")}:</span>
                                <span>{reservation.name}</span>
                                <CopyTooltip text={reservation?.name} />
                            </span>
                        }
                        showTitle={!!read?.name}
                        hideActions={hideActions}
                        actionMenu={
                            <ActionMenu
                                accessModel={"reservations"}
                                deletedData={reservation}
                                onAction={(a: string) => setAction(a)}
                                editPath=""
                                hideEdit
                                allowMenuForCustomChildren={true}
                            >
                                <ReservationRowMenuExtras
                                    reservation={reservation}
                                    onAction={(a: string) => setAction(a)}
                                />
                            </ActionMenu>
                        }
                    />
                </div>
            </div>
        </EntityCardShell>
    ) : (
        <EntityCardShell
            onClick={fetchId ? undefined : () => setAction("view")}
            disableClick={!!fetchId}
        >
            <div className="flex w-full items-stretch">
                {(read?.deletedBy || read?.deletedAt) && (
                    <DeletedInfo deletedAt={reservation.deletedAt} deletedBy={reservation.deletedBy} />
                )}
                <div className="w-full min-w-0">
                    <EntityTextCardHeader
                        title={
                            <TooltipDisplayer tooltip={reservation.name} show>
                                <span className="flex items-center gap-1 truncate">
                                    {reservation.name}
                                    <CopyTooltip text={reservation?.name} />
                                </span>
                            </TooltipDisplayer>
                        }
                        showTitle={!!read?.name}
                        badges={statusBadges}
                        showBadges={!!read?.status}
                        hideActions={hideActions}
                        actionMenu={
                            <ActionMenu
                                accessModel={"reservations"}
                                deletedData={reservation}
                                onAction={(a: string) => setAction(a)}
                                editPath=""
                                hideEdit
                                allowMenuForCustomChildren={true}
                            >
                                <ReservationRowMenuExtras
                                    reservation={reservation}
                                    onAction={(a: string) => setAction(a)}
                                />
                            </ActionMenu>
                        }
                    />
                    <div className={CARD_BODY_CLASS}>
                        <Separator />
                        <InfoRowGroup className={cn("grid grid-cols-2 gap-1 px-1", {"xl:grid-cols-3": small})}>
                            <InfoRow
                                icon={IconHome}
                                iconReplacement={
                                    reservation.unit?.unitType?.icon ? (
                                        <MdiIcon
                                            icon={reservation.unit.unitType.icon}
                                            size={0.75}
                                            showFallback
                                            className="text-muted-foreground"
                                        />
                                    ) : undefined
                                }
                                label={reservation.unit?.unitType?.name ?? resolveLanguageKey("unit")}
                                tooltip={reservation.unit?.unitType?.name ?? resolveLanguageKey("unit")}
                                show={!!read?.unit}
                                value={reservation.unit != null && (reservation.unit.name ?? reservation.unit.unitNumber ?? null)}
                            />
                            <InfoRow
                                icon={IconUser}
                                label={resolveLanguageKey("client")}
                                tooltip={resolveLanguageKey("client")}
                                show={!!read?.client}
                                value={fullName(reservation.client)}
                            />
                            <InfoRow
                                icon={IconUser}
                                label={resolveLanguageKey("reservedBy")}
                                tooltip={resolveLanguageKey("reservedBy")}
                                show={!!read?.reservedBy}
                                value={fullName(reservation.reservedBy)}
                            />
                            <InfoRow
                                icon={IconCalendarClock}
                                label={resolveLanguageKey("reservationDate")}
                                tooltip={resolveLanguageKey("reservationDate")}
                                show={!!read?.reservationDate}
                                value={reservation.reservationDate != null ? format(new Date(reservation.reservationDate), "PP") : null}
                            />
                            {!small && (
                                <InfoRow
                                    icon={IconCurrencyDollar}
                                    label={resolveLanguageKey("depositAmount")}
                                    tooltip={resolveLanguageKey("depositAmount")}
                                    show={!!read?.depositAmount}
                                    value={depositDisplayValue}
                                />
                            )}
                        </InfoRowGroup>
                    </div>
                </div>
            </div>
        </EntityCardShell>
    );

    return (
        <EntityCardFetchGuard
            fetchId={fetchId}
            loading={loading}
            error={error}
            failedTitle={resolveLanguageKey("failedTitle")}
            failedDescription={resolveLanguageKey("failedDescription")}
            onRetry={() => setForceReload((n) => n + 1)}
        >
            <>
                {cardContent}

                {action === "view" && (
                    <ReservationSheetView
                        open
                        onOpenChange={(open: boolean) => {
                            if (!open) setAction("");
                        }}
                        reservation={reservation}
                        hideActions={hideActions}
                        onDelete={(data?: DeletedData) => {
                            onDeleteProp?.(reservation, data);
                            if (data?.deletedAt != null || data?.deletedBy != null) {
                                setReservation((prev) => ({...prev, ...data}));
                            }
                        }}
                        onRestore={() => {
                            setReservation((prev) => ({...prev, deletedAt: undefined, deletedBy: undefined}));
                            onRestoreProp?.();
                        }}
                        onModifySuccess={handleModify}
                    />
                )}

                {!!action && action !== "view" && (
                    <>
                        {action === "delete" && (
                            <DeleteAction
                                accessModel={"reservations"}
                                deleteId={reservation._id}
                                openAlert={action === "delete"}
                                name={deleteRestoreName}
                                confirmName={deleteRestoreName}
                                onSuccess={(data: DeletedData) => {
                                    onDelete(data);
                                    setAction("");
                                }}
                                onCancel={() => setAction("")}
                                url={`/api/realEstate/unit/reservation`}
                            />
                        )}
                        {action === "restore" && (
                            <RestoreAction
                                accessModel={"reservations"}
                                deleteId={reservation._id}
                                openAlert={action === "restore"}
                                name={deleteRestoreName}
                                confirmName={deleteRestoreName}
                                onSuccess={() => {
                                    onRestore();
                                    setAction("");
                                }}
                                onCancel={() => setAction("")}
                                url={`/api/realEstate/unit/reservation/restore`}
                            />
                        )}
                        {action === "cancel" && (
                            <CancelReservationDialog
                                open
                                onClose={() => setAction("")}
                                reservation={reservation}
                                onSuccess={(updated?: Reservation) => {
                                    handleModify(updated);
                                    setAction("");
                                }}
                            />
                        )}
                        {action === "reinstate" && (
                            <ReinstateReservationDialog
                                open
                                onClose={() => setAction("")}
                                reservation={reservation}
                                onSuccess={(updated?: Reservation) => {
                                    handleModify(updated);
                                    setAction("");
                                }}
                            />
                        )}
                        {action === "paidInFull" && (
                            <PaidInFullReservationDialog
                                open
                                onClose={() => setAction("")}
                                reservation={reservation}
                                onSuccess={(updated?: Reservation) => {
                                    handleModify(updated);
                                    setAction("");
                                }}
                            />
                        )}
                        {action === "reversePayment" && (
                            <ReverseReservationPaymentDialog
                                open
                                onClose={() => setAction("")}
                                reservation={reservation}
                                onSuccess={(updated?: Reservation) => {
                                    handleModify(updated);
                                    setAction("");
                                }}
                            />
                        )}
                        {manualEmailAction && (
                            <ManualReservationClientEmailDialog
                                open
                                onClose={() => setAction("")}
                                reservation={reservation}
                                pendingAction={manualEmailAction}
                                onSuccess={() => setAction("")}
                            />
                        )}
                    </>
                )}
            </>
        </EntityCardFetchGuard>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/reservations/center/cardView/reservationCard.tsx"),
    withAxios(
        {
            url: "/api/realEstate/unit/reservation/single",
            method: "POST",
            data: {},
        },
        true,
    ),
    withDebug(true, true),
)(ReservationCard);
