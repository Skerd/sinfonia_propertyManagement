import {compose} from "redux";
import {InfoRowGroup} from "@coreModule/components/custom/infoRowGroup.tsx";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import HiddenElement from "@coreModule/components/custom/hiddenElement.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import TooltipDisplayer from "@coreModule/components/custom/tooltipDisplayer.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import {formatCardDecimal} from "@propertyManagementModule/helpers/general/formatCardNumber.ts";
import type {RentalPayment} from "armonia/src/modules/propertyManagement/api/realEstate/private/rentalPayment/rentalPayment.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import {Separator} from "@coreModule/components/ui/separator.tsx";
import {Badge} from "@coreModule/components/ui/badge.tsx";
import {withDeletedDrawer} from "@coreModule/helpers/hocs/withDeletedDrawer.tsx";
import InfoRow from "@coreModule/components/custom/infoRow.tsx";
import {IconCalendar, IconCurrencyDollar, IconDoor} from "@tabler/icons-react";
import RentalPaymentSheetView from "@propertyManagementModule/clients/panel/private/rentalPayments/center/sheetView/rentalPaymentSheetView.tsx";
import DeleteAction from "@coreModule/components/custom/actions/deleteAction.tsx";
import RestoreAction from "@coreModule/components/custom/actions/restoreAction.tsx";
import ActionMenu from "@coreModule/components/custom/actions/menu/actionMenu.tsx";
import {useEntityCard} from "@coreModule/helpers/hooks/useEntityCard.ts";
import {EntityCardShell} from "@propertyManagementModule/components/custom/cards/EntityCardShell.tsx";
import {EntityTextCardHeader} from "@propertyManagementModule/components/custom/cards/EntityTextCardHeader.tsx";
import {
    CARD_BODY_CLASS,
    STATUS_BADGE_DANGER,
    STATUS_BADGE_NEUTRAL,
    STATUS_BADGE_SUCCESS,
    STATUS_BADGE_WARNING,
} from "@propertyManagementModule/components/custom/cards/entityCard.constants.ts";
import MarkRentalPaymentPaid, {MARK_RENTAL_PAYMENT_PAID_ACTION} from "@propertyManagementModule/clients/panel/private/rentalPayments/center/actions/markPaid.tsx";
import MarkRentalPaymentPaidDialog from "@propertyManagementModule/components/custom/rentalPayments/markRentalPaymentPaidDialog.tsx";

type RentalPaymentCardProps = WithLanguageType & {
    payment: RentalPayment;
    onDelete?: (deletedPayment?: RentalPayment, response?: DeletedData) => void;
    onRestore?: () => void;
    onActionSuccess?: (updated?: RentalPayment) => void;
    hideActions?: boolean;
};

function buildEditPath(payment: RentalPayment) {
    const params = new URLSearchParams();
    params.set("rentalPaymentId", payment._id);
    if (payment.name) params.set("rentalPaymentName", payment.name);
    if ((payment.lease as any)?._id) {
        params.set("leaseId", (payment.lease as any)._id);
    }
    return `/realEstate/rentalPayments/edit?${params.toString()}`;
}

function formatDate(value?: string) {
    if (!value) return undefined;
    try {
        return new Date(value).toLocaleDateString();
    } catch {
        return value;
    }
}

function statusBadgeClass(status?: string) {
    const s = (status || "").toLowerCase();
    if (s === "paid") return STATUS_BADGE_SUCCESS;
    if (s === "overdue") return STATUS_BADGE_DANGER;
    if (s === "pending") return STATUS_BADGE_WARNING;
    if (s === "waived") return STATUS_BADGE_NEUTRAL;
    return STATUS_BADGE_NEUTRAL;
}

function RentalPaymentCard({
    payment: paymentProp,
    resolveLanguageKey,
    onDelete: onDeleteProp,
    onRestore: onRestoreProp,
    onActionSuccess,
    hideActions = false,
}: RentalPaymentCardProps) {
    const {action, setAction, entity: payment, setEntity, hideAfterDeletion, onDelete, onRestore} = useEntityCard({
        entityProp: paymentProp,
        onDeleteProp,
        onRestoreProp,
    });

    const handleActionSuccess = (updated?: RentalPayment) => {
        if (updated) setEntity(updated);
        onActionSuccess?.(updated);
        setAction("");
    };

    const {read, write, restore} = useAccess("rentalpayments");

    if (hideAfterDeletion || !restore) {
        return <></>;
    }
    if (!read || !Object.keys(read).length) {
        return <HiddenElement />;
    }

    const editPath = buildEditPath(payment);
    const amountDisplay =
        payment.amount != null
            ? `${formatCardDecimal(payment.amount)}${payment.currency?.symbol ? ` ${payment.currency.symbol}` : ""}`
            : null;

    return (
        <>
            <EntityCardShell onClick={() => setAction("view")}>
                <EntityTextCardHeader
                    title={payment.name || "—"}
                    subtitle={payment.lease?.name}
                    badges={payment.status ? (
                        <TooltipDisplayer tooltip={resolveLanguageKey("statusLabel") as string}>
                            <Badge variant="secondary" className={cn("text-xs", statusBadgeClass(payment.status))}>
                                {resolveLanguageKey(`fields.!enums.status.${payment.status}`) as string}
                            </Badge>
                        </TooltipDisplayer>
                    ) : null}
                    showTitle={!!read?.name}
                    showSubtitle={!!read?.lease}
                    showBadges={!!read?.status}
                    hideActions={hideActions}
                    actionMenu={
                        <ActionMenu
                            accessModel="rentalpayments"
                            deletedData={payment}
                            onAction={(a: string) => setAction(a)}
                            editPath={editPath}
                            allowMenuForCustomChildren={!!write && !payment.deletedAt}
                        >
                            <MarkRentalPaymentPaid payment={payment} onAction={(a: string) => setAction(a)} />
                        </ActionMenu>
                    }
                />
                <Separator />
                <div className={CARD_BODY_CLASS}>
                    <InfoRowGroup>
                        <InfoRow
                            icon={IconCurrencyDollar}
                            label={resolveLanguageKey("fields.amount")}
                            show={!!read?.amount}
                            value={amountDisplay}
                        />
                        <InfoRow
                            icon={IconDoor}
                            label={resolveLanguageKey("fields.unit")}
                            show={!!read?.unit}
                            value={payment.unit?.name || payment.unit?.unitNumber}
                        />
                        <InfoRow
                            icon={IconCalendar}
                            label={resolveLanguageKey("fields.dueDate")}
                            show={!!read?.dueDate}
                            value={formatDate(payment.dueDate)}
                        />
                        <InfoRow
                            icon={IconCalendar}
                            label={resolveLanguageKey("fields.paidDate")}
                            show={!!read?.paidDate && !!payment.paidDate}
                            value={formatDate(payment.paidDate)}
                        />
                    </InfoRowGroup>
                </div>
            </EntityCardShell>

            {!!action && (
                <>
                    {action === "view" && (
                        <RentalPaymentSheetView
                            open={action === "view"}
                            onOpenChange={() => setAction("")}
                            rentalPayment={payment}
                            onDelete={onDelete}
                            onRestore={onRestore}
                            actionMenuAllowCustomChildren
                            onActionMenuAction={setAction}
                            actionMenuChildren={(
                                <MarkRentalPaymentPaid payment={payment} onAction={(a: string) => setAction(a)} />
                            )}
                        />
                    )}
                    {action === "delete" && (
                        <DeleteAction
                            accessModel="rentalpayments"
                            deleteId={payment._id}
                            openAlert={action === "delete"}
                            name={read?.name && payment.name}
                            confirmName={read?.name && payment.name}
                            onSuccess={onDelete}
                            onCancel={() => setAction("")}
                            url="/api/realEstate/rentalPayment"
                        />
                    )}
                    {action === "restore" && (
                        <RestoreAction
                            accessModel="rentalpayments"
                            deleteId={payment._id}
                            openAlert={action === "restore"}
                            name={read?.name && payment.name}
                            confirmName={read?.name && payment.name}
                            onSuccess={onRestore}
                            onCancel={() => setAction("")}
                            url="/api/realEstate/rentalPayment/restore"
                        />
                    )}
                    {action === MARK_RENTAL_PAYMENT_PAID_ACTION && (
                        <MarkRentalPaymentPaidDialog
                            open
                            onClose={() => setAction("")}
                            payment={payment}
                            onSuccess={handleActionSuccess}
                        />
                    )}
                </>
            )}
        </>
    );
}

export default compose(
    (Component: any) => withDeletedDrawer(Component, (props: any) => props.payment),
    withLanguage("src/modules/propertyManagement/clients/panel/private/rentalPayments/center/cardView/rentalPaymentCard.tsx"),
    withDebug(true, true),
)(RentalPaymentCard);
