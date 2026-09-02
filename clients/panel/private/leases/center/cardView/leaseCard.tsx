import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import type {Lease} from "armonia/src/modules/propertyManagement/api/realEstate/private/lease/lease.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import {IconCalendar, IconCurrencyDollar, IconLabel, IconUser} from "@tabler/icons-react";
import LeaseSheetView from "@propertyManagementModule/clients/panel/private/leases/center/sheetView/leaseSheetView.tsx";
import TerminateLease, {TERMINATE_LEASE_ACTION} from "@propertyManagementModule/clients/panel/private/leases/center/actions/terminate.tsx";
import MarkDepositPaid, {MARK_DEPOSIT_PAID_ACTION} from "@propertyManagementModule/clients/panel/private/leases/center/actions/markDepositPaid.tsx";
import ReturnDeposit, {RETURN_DEPOSIT_ACTION} from "@propertyManagementModule/clients/panel/private/leases/center/actions/returnDeposit.tsx";
import RecordRentPayment, {RECORD_RENT_PAYMENT_ACTION} from "@propertyManagementModule/clients/panel/private/leases/center/actions/recordRentPayment.tsx";
import ViewLeasePayments from "@propertyManagementModule/clients/panel/private/leases/center/actions/viewPayments.tsx";
import TerminateLeaseDialog from "@propertyManagementModule/components/custom/leases/terminateLeaseDialog.tsx";
import MarkDepositPaidDialog from "@propertyManagementModule/components/custom/leases/markDepositPaidDialog.tsx";
import ReturnDepositDialog from "@propertyManagementModule/components/custom/leases/returnDepositDialog.tsx";
import RecordRentPaymentDialog from "@propertyManagementModule/components/custom/leases/recordRentPaymentDialog.tsx";
import DisplayRow from "@coreModule/components/custom/displayValue/displayRow.tsx";
import EntityCard from "@coreModule/components/custom/systemCards/entityCard.tsx";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {RefObject} from "react";

function leaseEditPath(lease: Lease) {
    const params = new URLSearchParams();
    params.set("leaseId", lease._id);
    if (lease.name) params.set("leaseName", lease.name);
    return `/realEstate/leases/edit?${params.toString()}`;
}

type LeaseCardProps = WithLanguageType & {
    lease: Lease;
    fetchId?: string;
    hideActions?: boolean;
    onDelete?: (deletedLease?: Lease, response?: DeletedData) => void;
    onRestore?: () => void;
    onActionSuccess?: (updated?: Lease) => void;
    sheetOnly?: boolean;
    innerRef?: RefObject<WithAxiosLifecycleRef<Lease> | null>;
};

function LeaseCard({
    lease,
    resolveLanguageKey,
    fetchId,
    hideActions = false,
    onDelete,
    onRestore,
    onActionSuccess,
    sheetOnly = false,
    innerRef,
}: LeaseCardProps) {
    return (
        <EntityCard
            resource="leases"
            entity={lease}
            fetchId={fetchId}
            singleUrl="/api/realEstate/lease/single"
            onDelete={onDelete}
            onRestore={onRestore}
            hideActions={hideActions}
            sheetOnly={sheetOnly}
            editPath={leaseEditPath}
            Sheet={LeaseSheetView}
            sheetEntityProp="lease"
            deleteUrl="/api/realEstate/lease"
            restoreUrl="/api/realEstate/lease/restore"
            failedTitle={String(resolveLanguageKey("failedTitle") || "")}
            failedDescription={String(resolveLanguageKey("failedDescription") || "")}
            titlePath="name"
            innerRef={innerRef}
            sheetProps={({entity, setAction}) => ({
                fetchId,
                actionMenuAllowCustomChildren: true,
                onActionMenuAction: setAction,
                actionMenuChildren: (
                    <>
                        <ViewLeasePayments lease={entity} />
                        <TerminateLease lease={entity} onAction={setAction} />
                        <MarkDepositPaid lease={entity} onAction={setAction} />
                        <ReturnDeposit lease={entity} onAction={setAction} />
                    </>
                ),
            })}
            extraDialogs={({action, setAction, entity, setEntity}) => {
                const handleSuccess = (updated?: Lease) => {
                    if (updated) setEntity({...entity, ...updated});
                    onActionSuccess?.(updated);
                    setAction("");
                };
                return (
                    <>
                        {action === TERMINATE_LEASE_ACTION && (
                            <TerminateLeaseDialog open onClose={() => setAction("")} lease={entity} onSuccess={handleSuccess} />
                        )}
                        {action === MARK_DEPOSIT_PAID_ACTION && (
                            <MarkDepositPaidDialog open onClose={() => setAction("")} lease={entity} onSuccess={handleSuccess} />
                        )}
                        {action === RETURN_DEPOSIT_ACTION && (
                            <ReturnDepositDialog open onClose={() => setAction("")} lease={entity} onSuccess={handleSuccess} />
                        )}
                        {action === RECORD_RENT_PAYMENT_ACTION && (
                            <RecordRentPaymentDialog open onClose={() => setAction("")} lease={entity} onSuccess={handleSuccess} />
                        )}
                    </>
                );
            }}
        >
            {({entity, setAction}) => (
                <>
                    <EntityCard.Header
                        titlePath="name"
                        title={entity.name}
                        subtitle={entity.unit?.name || entity.unit?.unitNumber}
                        subtitlePath="unit"
                    >
                        <ViewLeasePayments lease={entity} />
                        <RecordRentPayment lease={entity} onAction={setAction} />
                        <TerminateLease lease={entity} onAction={setAction} />
                        <MarkDepositPaid lease={entity} onAction={setAction} />
                        <ReturnDeposit lease={entity} onAction={setAction} />
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
                            icon={IconUser}
                            label={resolveLanguageKey("fields.tenant")}
                            tooltip={resolveLanguageKey("fields.tenant")}
                            path="tenant"
                            type="user"
                            value={entity.tenant}
                        />
                        <DisplayRow
                            icon={IconCurrencyDollar}
                            label={resolveLanguageKey("fields.monthlyRent")}
                            tooltip={resolveLanguageKey("fields.monthlyRent")}
                            path="monthlyRent"
                            type="currency"
                            value={{amount: entity.monthlyRent, currency: entity.rentCurrency}}
                        />
                        <DisplayRow
                            icon={IconCalendar}
                            label={resolveLanguageKey("fields.startDate")}
                            tooltip={resolveLanguageKey("fields.startDate")}
                            path="startDate"
                            type="date"
                            value={entity.startDate}
                        />
                        <DisplayRow
                            icon={IconCalendar}
                            label={resolveLanguageKey("fields.endDate")}
                            tooltip={resolveLanguageKey("fields.endDate")}
                            path="endDate"
                            type="date"
                            value={entity.endDate}
                        />
                    </EntityCard.Body>
                </>
            )}
        </EntityCard>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/leases/center/cardView/leaseCard.tsx"),
    withDebug(true, true, "leases"),
)(LeaseCard);
