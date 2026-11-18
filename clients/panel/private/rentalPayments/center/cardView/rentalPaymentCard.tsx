import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import type {RentalPayment} from "armonia/src/modules/propertyManagement/api/realEstate/private/rentalPayment/rentalPayment.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import {IconCalendar, IconCurrencyDollar, IconDoor} from "@tabler/icons-react";
import RentalPaymentSheetView, {
    rentalPaymentTitle,
} from "@propertyManagementModule/clients/panel/private/rentalPayments/center/sheetView/rentalPaymentSheetView.tsx";
import {RentalPaymentActionDialogs, RentalPaymentMenuItems} from "@propertyManagementModule/clients/panel/private/rentalPayments/center/actions/rentalPaymentSheetActions.tsx";
import EntityCardRow from "@coreModule/components/entityPage/list/card/entityCardRow.tsx";
import EntityCard from "@coreModule/components/entityPage/list/card/entityCard.tsx";
import StatusBadge from "@coreModule/components/entityPage/sheet/statusBadge.tsx";
import {displayPlainText} from "@coreModule/components/viewEngine/widgets/display/displayValue.tsx";
import {getName} from "@coreModule/helpers/general/names.ts";
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
            failedTitle={resolveLanguageKey("failedTitle")}
            failedDescription={resolveLanguageKey("failedDescription")}
            titlePath="name"
            innerRef={innerRef}
            sheetProps={({entity, setAction}) => ({
                fetchId,
                actionMenuAllowCustomChildren: true,
                onActionMenuAction: setAction,
                actionMenuChildren: <RentalPaymentMenuItems payment={entity} onAction={setAction} />,
            })}
            extraDialogs={({action, setAction, entity, setEntity}) => (
                <RentalPaymentActionDialogs
                    action={action}
                    payment={entity}
                    onClose={() => setAction("")}
                    onSuccess={(updated?: RentalPayment) => {
                        if (updated) setEntity({...entity, ...updated});
                        onActionSuccess?.(updated);
                        setAction("");
                    }}
                />
            )}
        >
            {({entity, setAction}) => {
                const title = rentalPaymentTitle(entity);
                const titledByTenant = Boolean(getName(entity.lease?.tenant));
                // The open balance only adds something once part is paid or a late fee is on top (UX-02).
                const showRemaining = entity.remaining > 0 && entity.remaining !== entity.amount;
                return (
                    <>
                        {/* Named by the tenant, the code beside it, the state as a badge (UX-01, UX-02, D151). */}
                        <EntityCard.Header
                            titlePath={["lease", "unit", "name"]}
                            title={title || entity.name || "—"}
                            subtitlePath="name"
                            subtitle={title ? entity.name : undefined}
                            badgesBesideTitle
                            badges={
                                <StatusBadge
                                    tableConfigKey="rentalpayments"
                                    field="status"
                                    value={entity.status}
                                    label={String(resolveLanguageKey(`fields.!enums.status.${entity.status}`))}
                                />
                            }
                        >
                            <RentalPaymentMenuItems payment={entity} onAction={setAction} />
                        </EntityCard.Header>
                        <EntityCard.Body>
                            <EntityCardRow
                                icon={IconCurrencyDollar}
                                label={resolveLanguageKey("fields.amount")}
                                tooltip={resolveLanguageKey("fields.amount")}
                                path="amount"
                                type="currency"
                                value={{amount: entity.amount, currency: entity.currency}}
                            >
                                {(formatted) =>
                                    showRemaining ? (
                                        <>
                                            {formatted} · {resolveLanguageKey("fields.remaining")}{" "}
                                            {displayPlainText({amount: entity.remaining, currency: entity.currency}, "currency")}
                                        </>
                                    ) : (
                                        formatted
                                    )
                                }
                            </EntityCardRow>
                            <EntityCardRow
                                icon={IconCalendar}
                                label={resolveLanguageKey("fields.dueDate")}
                                tooltip={resolveLanguageKey("fields.dueDate")}
                                path="dueDate"
                                type="date"
                                value={entity.dueDate}
                            />
                            {/* Without a readable tenant the unit is already the title. */}
                            {titledByTenant ? (
                                <EntityCardRow
                                    icon={IconDoor}
                                    label={resolveLanguageKey("fields.unit")}
                                    tooltip={resolveLanguageKey("fields.unit")}
                                    path="unit"
                                    value={entity.unit?.name || entity.unit?.unitNumber}
                                />
                            ) : null}
                            {entity.lateFeeAmount ? (
                                <EntityCardRow
                                    icon={IconCurrencyDollar}
                                    label={resolveLanguageKey("fields.lateFeeAmount")}
                                    tooltip={resolveLanguageKey("fields.lateFeeAmount")}
                                    path="lateFeeAmount"
                                    type="currency"
                                    value={{amount: entity.lateFeeAmount, currency: entity.currency}}
                                />
                            ) : null}
                        </EntityCard.Body>
                    </>
                );
            }}
        </EntityCard>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/rentalPayments/center/cardView/rentalPaymentCard.tsx"),
    withDebug(true, true, "rentalpayments"),
)(RentalPaymentCard);
