import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import type {Lease} from "armonia/src/modules/propertyManagement/api/realEstate/private/lease/lease.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import {IconCalendar, IconCurrencyDollar, IconDoor} from "@tabler/icons-react";
import LeaseSheetView from "@propertyManagementModule/clients/panel/private/leases/center/sheetView/leaseSheetView.tsx";
import TerminateLease from "@propertyManagementModule/clients/panel/private/leases/center/actions/terminate.tsx";
import MarkDepositPaid from "@propertyManagementModule/clients/panel/private/leases/center/actions/markDepositPaid.tsx";
import ReturnDeposit from "@propertyManagementModule/clients/panel/private/leases/center/actions/returnDeposit.tsx";
import RecordRentPayment from "@propertyManagementModule/clients/panel/private/leases/center/actions/recordRentPayment.tsx";
import ViewLeasePayments from "@propertyManagementModule/clients/panel/private/leases/center/actions/viewPayments.tsx";
import {LeaseActionDialogs, LeaseSheetMenuItems} from "@propertyManagementModule/clients/panel/private/leases/center/actions/leaseSheetActions.tsx";
import EntityCardRow from "@coreModule/components/entityPage/list/card/entityCardRow.tsx";
import EntityCard from "@coreModule/components/entityPage/list/card/entityCard.tsx";
import StatusBadge from "@coreModule/components/entityPage/sheet/statusBadge.tsx";
import {getName} from "@coreModule/helpers/general/names.ts";
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
            failedTitle={resolveLanguageKey("failedTitle")}
            failedDescription={resolveLanguageKey("failedDescription")}
            titlePath="name"
            innerRef={innerRef}
            sheetProps={({entity, setAction}) => ({
                fetchId,
                actionMenuAllowCustomChildren: true,
                onActionMenuAction: setAction,
                actionMenuChildren: <LeaseSheetMenuItems lease={entity} onAction={setAction} />,
            })}
            extraDialogs={({action, setAction, entity, setEntity}) => (
                <LeaseActionDialogs
                    action={action}
                    lease={entity}
                    onClose={() => setAction("")}
                    onSuccess={(updated?: Lease) => {
                        if (updated) setEntity({...entity, ...updated});
                        onActionSuccess?.(updated);
                        setAction("");
                    }}
                />
            )}
        >
            {({entity, setAction}) => (
                <>
                    {/* Named by the tenant, the code beside it, the state as a badge (UX-01, UX-02, D151). */}
                    <EntityCard.Header
                        titlePath={["tenant", "name"]}
                        title={getName(entity.tenant) || entity.name || "—"}
                        subtitlePath="name"
                        subtitle={getName(entity.tenant) ? entity.name : undefined}
                        badgesBesideTitle
                        badges={
                            <StatusBadge
                                tableConfigKey="leases"
                                field="status"
                                value={entity.status}
                                label={String(resolveLanguageKey(`fields.!enums.status.${entity.status}`))}
                            />
                        }
                    >
                        <ViewLeasePayments lease={entity} />
                        <RecordRentPayment lease={entity} onAction={setAction} />
                        <TerminateLease lease={entity} onAction={setAction} />
                        <MarkDepositPaid lease={entity} onAction={setAction} />
                        <ReturnDeposit lease={entity} onAction={setAction} />
                    </EntityCard.Header>
                    {/* What is rented, until when, for how much (UX-02). */}
                    <EntityCard.Body>
                        <EntityCardRow
                            icon={IconDoor}
                            label={resolveLanguageKey("fields.unit")}
                            tooltip={resolveLanguageKey("fields.unit")}
                            path="unit"
                            // Unit names repeat across buildings, so the building goes with it (UX-01).
                            value={[entity.unit?.name || entity.unit?.unitNumber, entity.unit?.floor?.edifice?.name].filter(Boolean).join(" · ")}
                        />
                        <EntityCardRow
                            icon={IconCalendar}
                            label={resolveLanguageKey("fields.endDate")}
                            tooltip={resolveLanguageKey("fields.endDate")}
                            path="endDate"
                            type="date"
                            value={entity.endDate}
                        />
                        <EntityCardRow
                            icon={IconCurrencyDollar}
                            label={resolveLanguageKey("fields.monthlyRent")}
                            tooltip={resolveLanguageKey("fields.monthlyRent")}
                            path="monthlyRent"
                            type="currency"
                            value={{amount: entity.monthlyRent, currency: entity.rentCurrency}}
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
