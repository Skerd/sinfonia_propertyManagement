import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import type {RentalPayment} from "armonia/src/modules/propertyManagement/api/realEstate/private/rentalPayment/rentalPayment.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import {IconCalendar, IconCurrencyDollar, IconDoor, IconLabel} from "@tabler/icons-react";
import RentalPaymentSheetView from "@propertyManagementModule/clients/panel/private/rentalPayments/center/sheetView/rentalPaymentSheetView.tsx";
import MarkRentalPaymentPaid, {MARK_RENTAL_PAYMENT_PAID_ACTION} from "@propertyManagementModule/clients/panel/private/rentalPayments/center/actions/markPaid.tsx";
import MarkRentalPaymentPaidDialog from "@propertyManagementModule/components/custom/rentalPayments/markRentalPaymentPaidDialog.tsx";
import DisplayRow from "@coreModule/components/custom/displayValue/displayRow.tsx";
import EntityCard from "@coreModule/components/custom/systemCards/entityCard.tsx";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {RefObject} from "react";

function rentalPaymentEditPath(payment: RentalPayment) {
    const params = new URLSearchParams();
    params.set("rentalPaymentId", payment._id);
    if (payment.name) params.set("rentalPaymentName", payment.name);
    const leaseId = payment.lease && typeof payment.lease === "object" ? payment.lease._id : undefined;
    if (leaseId) params.set("leaseId", leaseId);
    return `/realEstate/rentalPayments/edit?${params.toString()}`;
}

type RentalPaymentCardProps = WithLanguageType & {
    payment: RentalPayment;
    fetchId?: string;
    hideActions?: boolean;
    onDelete?: (deletedPayment?: RentalPayment, response?: DeletedData) => void;
    onRestore?: () => void;
    onActionSuccess?: (updated?: RentalPayment) => void;
    sheetOnly?: boolean;
    innerRef?: RefObject<WithAxiosLifecycleRef<RentalPayment> | null>;
};

function RentalPaymentCard({
    payment,
    resolveLanguageKey,
    fetchId,
    hideActions = false,
    onDelete,
    onRestore,
    onActionSuccess,
    sheetOnly = false,
    innerRef,
}: RentalPaymentCardProps) {
    return (
        <EntityCard
            resource="rentalpayments"
            entity={payment}
            fetchId={fetchId}
            singleUrl="/api/realEstate/rentalPayment/single"
            onDelete={onDelete}
            onRestore={onRestore}
            hideActions={hideActions}
            sheetOnly={sheetOnly}
            editPath={rentalPaymentEditPath}
            Sheet={RentalPaymentSheetView}
            sheetEntityProp="rentalPayment"
            deleteUrl="/api/realEstate/rentalPayment"
            restoreUrl="/api/realEstate/rentalPayment/restore"
            failedTitle={String(resolveLanguageKey("failedTitle") || "")}
            failedDescription={String(resolveLanguageKey("failedDescription") || "")}
            titlePath="name"
            innerRef={innerRef}
            sheetProps={({entity, setAction}) => ({
                fetchId,
                actionMenuAllowCustomChildren: true,
                onActionMenuAction: setAction,
                actionMenuChildren: (
                    <MarkRentalPaymentPaid payment={entity} onAction={setAction} />
                ),
            })}
            extraDialogs={({action, setAction, entity, setEntity}) => (
                <>
                    {action === MARK_RENTAL_PAYMENT_PAID_ACTION && (
                        <MarkRentalPaymentPaidDialog
                            open
                            onClose={() => setAction("")}
                            payment={entity}
                            onSuccess={(updated?: RentalPayment) => {
                                if (updated) setEntity({...entity, ...updated});
                                onActionSuccess?.(updated);
                                setAction("");
                            }}
                        />
                    )}
                </>
            )}
        >
            {({entity, setAction}) => (
                <>
                    <EntityCard.Header
                        titlePath="name"
                        title={entity.name}
                        subtitle={entity.lease?.name}
                        subtitlePath="lease"
                    >
                        <MarkRentalPaymentPaid payment={entity} onAction={setAction} />
                    </EntityCard.Header>
                    <EntityCard.Body>
                        <DisplayRow
                            icon={IconLabel}
                            label={resolveLanguageKey("statusLabel")}
                            tooltip={resolveLanguageKey("statusLabel")}
                            path="status"
                            type="enum"
                            languageKeyCategory="fields.!enums.status"
                            value={entity.status}
                        />
                        <DisplayRow
                            icon={IconCurrencyDollar}
                            label={resolveLanguageKey("fields.amount")}
                            tooltip={resolveLanguageKey("fields.amount")}
                            path="amount"
                            type="currency"
                            value={{amount: entity.amount, currency: entity.currency}}
                        />
                        <DisplayRow
                            icon={IconDoor}
                            label={resolveLanguageKey("fields.unit")}
                            tooltip={resolveLanguageKey("fields.unit")}
                            path="unit"
                            value={entity.unit?.name || entity.unit?.unitNumber}
                        />
                        <DisplayRow
                            icon={IconCalendar}
                            label={resolveLanguageKey("fields.dueDate")}
                            tooltip={resolveLanguageKey("fields.dueDate")}
                            path="dueDate"
                            type="date"
                            value={entity.dueDate}
                        />
                        <DisplayRow
                            icon={IconCalendar}
                            label={resolveLanguageKey("fields.paidDate")}
                            tooltip={resolveLanguageKey("fields.paidDate")}
                            path="paidDate"
                            type="date"
                            value={entity.paidDate}
                        />
                    </EntityCard.Body>
                </>
            )}
        </EntityCard>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/rentalPayments/center/cardView/rentalPaymentCard.tsx"),
    withDebug(true, true),
)(RentalPaymentCard);
