import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage from "@coreModule/components/entityPage/EntityListPage.tsx";
import {IconFilePlus} from "@tabler/icons-react";
import type {Lease} from "armonia/src/modules/propertyManagement/api/realEstate/private/lease/lease.dto.ts";
import TerminateLease, {TERMINATE_LEASE_ACTION} from "@propertyManagementModule/clients/panel/private/leases/center/actions/terminate.tsx";
import ReturnDeposit, {RETURN_DEPOSIT_ACTION} from "@propertyManagementModule/clients/panel/private/leases/center/actions/returnDeposit.tsx";
import ViewLeasePayments from "@propertyManagementModule/clients/panel/private/leases/center/actions/viewPayments.tsx";
import TerminateLeaseDialog from "@propertyManagementModule/components/custom/leases/terminateLeaseDialog.tsx";
import ReturnDepositDialog from "@propertyManagementModule/components/custom/leases/returnDepositDialog.tsx";

interface AllLeasesProps extends WithLanguageType {
    unitId?: string;
    unitName?: string;
}

function buildLeaseEditPath(lease: Lease) {
    const params = new URLSearchParams();
    params.set("leaseId", lease._id);
    if (lease.name) params.set("leaseName", lease.name);
    return `/realEstate/leases/edit?${params.toString()}`;
}

function AllLeases({resolveLanguageKey, unitId, unitName}: AllLeasesProps) {
    const extraFilters = unitId ? {unitId} : undefined;

    return (
        <EntityListPage<Lease>
            apiUrl="/api/realEstate/lease"
            collectionName="leases"
            accessModel="leases"
            tableConfigKey="leases"
            createPath={unitId
                ? `/realEstate/leases/create?unitId=${unitId}${unitName ? `&unitName=${encodeURIComponent(unitName)}` : ""}`
                : "/realEstate/leases/create"
            }
            createIcon={<IconFilePlus className="h-4 w-4" />}
            createLanguageKey="createLease"
            buildEditPath={buildLeaseEditPath}
            resolveLanguageKey={resolveLanguageKey}
            sheetLanguagePath="src/modules/propertyManagement/clients/panel/private/leases/index.tsx"
            cardViewClassName="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            extraFilters={extraFilters}
            rowActionMenu={{allowMenuForCustomChildren: true}}
            renderActionMenuChildren={(lease, bindRowAction) => (
                <>
                    <ViewLeasePayments lease={lease} />
                    <TerminateLease lease={lease} onAction={bindRowAction} />
                    <ReturnDeposit lease={lease} onAction={bindRowAction} />
                </>
            )}
            renderFloatingModals={({action, entity, resetAction, listRef}) => {
                const onSuccess = (updated?: Lease) => {
                    if (updated?._id) listRef.current?.updateRow?.(updated._id, updated);
                    resetAction();
                };
                if (action === TERMINATE_LEASE_ACTION)
                    return <TerminateLeaseDialog open onClose={resetAction} lease={entity} onSuccess={onSuccess} />;
                if (action === RETURN_DEPOSIT_ACTION)
                    return <ReturnDepositDialog open onClose={resetAction} lease={entity} onSuccess={onSuccess} />;
                return null;
            }}
        />
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/leases/index.tsx"),
    withDebug(true, true),
)(AllLeases);
