import {compose} from "redux";
import {useMemo} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage, {type QuickFilterDef} from "@coreModule/components/entityPage/EntityListPage.tsx";
import {IconFilePlus} from "@tabler/icons-react";
import type {Lease} from "armonia/src/modules/propertyManagement/api/realEstate/private/lease/lease.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import TerminateLease, {TERMINATE_LEASE_ACTION} from "@propertyManagementModule/clients/panel/private/leases/center/actions/terminate.tsx";
import ReturnDeposit, {RETURN_DEPOSIT_ACTION} from "@propertyManagementModule/clients/panel/private/leases/center/actions/returnDeposit.tsx";
import ViewLeasePayments from "@propertyManagementModule/clients/panel/private/leases/center/actions/viewPayments.tsx";
import TerminateLeaseDialog from "@propertyManagementModule/components/custom/leases/terminateLeaseDialog.tsx";
import ReturnDepositDialog from "@propertyManagementModule/components/custom/leases/returnDepositDialog.tsx";
import LeaseCard from "@propertyManagementModule/clients/panel/private/leases/center/cardView/leaseCard.tsx";
import {GRID_TRANSACTIONAL} from "@propertyManagementModule/components/custom/cards/entityCard.constants.ts";
import {COLUMN_TYPE} from "armonia/src/modules/core/database/filter/typeOperators";
import {buildPageTitle} from "@coreModule/helpers/general";

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
    const extraFilters = useMemo(() => (unitId ? {unit: unitId} : undefined), [unitId]);
    const headerTitle = buildPageTitle(
        String(resolveLanguageKey("title")),
        unitName ? [unitName] : [],
    );

    const quickFilters = useMemo<QuickFilterDef[]>(() => {
        if (unitId) return [];
        return [
            {
                field: "project",
                label: resolveLanguageKey("fields.project") as string,
                type: COLUMN_TYPE.OBJECT_ID,
                apiUrl: "/api/realEstate/project/select",
                asExtraParam: true,
            },
            {
                field: "edifice",
                label: resolveLanguageKey("fields.edifice") as string,
                type: COLUMN_TYPE.OBJECT_ID,
                apiUrl: "/api/realEstate/edifice/select",
                dependsOn: "project",
                asExtraParam: true,
            },
            {
                field: "floor",
                label: resolveLanguageKey("fields.floor") as string,
                type: COLUMN_TYPE.OBJECT_ID,
                apiUrl: "/api/realEstate/floor/select",
                dependsOn: ["edifice", "project"],
                asExtraParam: true,
            },
            {
                field: "unit",
                label: resolveLanguageKey("fields.unit") as string,
                type: COLUMN_TYPE.OBJECT_ID,
                apiUrl: "/api/realEstate/unit/select",
                dependsOn: ["floor", "edifice", "project"],
            },
            {
                field: "status",
                label: resolveLanguageKey("fields.status") as string,
                type: COLUMN_TYPE.ENUM,
                enumValues: [
                    {value: "active", label: resolveLanguageKey("fields.!enums.status.active") as string},
                    {value: "expired", label: resolveLanguageKey("fields.!enums.status.expired") as string},
                    {value: "terminated", label: resolveLanguageKey("fields.!enums.status.terminated") as string},
                ],
            },
        ];
    }, [resolveLanguageKey, unitId]);

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
            sheetLanguagePath="src/modules/propertyManagement/clients/panel/private/leases/center/sheetView/leaseSheetView.tsx"
            cardViewClassName={GRID_TRANSACTIONAL}
            extraFilters={extraFilters}
            quickFilters={quickFilters}
            headerTitle={headerTitle}
            rowActionMenu={{allowMenuForCustomChildren: true}}
            renderCard={(lease, onDelete, onRestore, listRef) => (
                <LeaseCard
                    lease={lease}
                    onDelete={(row: Lease | undefined, response?: DeletedData) => onDelete(row, response)}
                    onRestore={() => onRestore(lease)}
                    onActionSuccess={(updated?: Lease) =>
                        updated && listRef.current?.updateRow?.(updated._id, updated)
                    }
                />
            )}
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
