import {compose} from "redux";
import {useMemo} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage, {EntityListCreateButton, EntityListHeader, type QuickFilterDef} from "@coreModule/components/entityPage/pages/entityListPage.tsx";
import {IconFilePlus} from "@tabler/icons-react";
import type {Lease} from "armonia/src/modules/propertyManagement/api/realEstate/private/lease/lease.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import TerminateLease from "@propertyManagementModule/clients/panel/private/leases/center/actions/terminate.tsx";
import MarkDepositPaid from "@propertyManagementModule/clients/panel/private/leases/center/actions/markDepositPaid.tsx";
import ReturnDeposit from "@propertyManagementModule/clients/panel/private/leases/center/actions/returnDeposit.tsx";
import RecordRentPayment from "@propertyManagementModule/clients/panel/private/leases/center/actions/recordRentPayment.tsx";
import ViewLeasePayments from "@propertyManagementModule/clients/panel/private/leases/center/actions/viewPayments.tsx";
import LeaseCard from "@propertyManagementModule/clients/panel/private/leases/center/cardView/leaseCard.tsx";
import {LeaseActionDialogs, LeaseTableSheet} from "@propertyManagementModule/clients/panel/private/leases/center/actions/leaseSheetActions.tsx";
import {
    GRID_COLS_MAX_4,
    GRID_TRANSACTIONAL
} from "@propertyManagementModule/components/custom/cards/entityCard.constants.ts";
import {COLUMN_TYPE} from "armonia/src/modules/core/database/filter/typeOperators";
import {buildPageTitle} from "@coreModule/helpers/general/pageTitle.ts";
import {cn} from "@coreModule/components/lib/utils.ts";

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
        const statusTenantAndDates: QuickFilterDef[] = [
            {
                field: "tenant",
                label: resolveLanguageKey("fields.tenant"),
                type: COLUMN_TYPE.OBJECT_ID,
                apiUrl: "/api/company/users/select",
                postBodyKeys: ["administration"],
                asExtraParam: true,
            },
            {
                field: "rentCurrency",
                label: resolveLanguageKey("fields.rentCurrency"),
                type: COLUMN_TYPE.OBJECT_ID,
                apiUrl: "/api/finance/currency/select",
            },
            {
                field: "startDate",
                label: resolveLanguageKey("fields.startDate"),
                type: COLUMN_TYPE.DATE,
            },
            {
                field: "endDate",
                label: resolveLanguageKey("fields.endDate"),
                type: COLUMN_TYPE.DATE,
            },
            {
                field: "depositPaid",
                label: resolveLanguageKey("fields.depositPaid"),
                type: COLUMN_TYPE.BOOLEAN,
            },
            {
                field: "status",
                label: resolveLanguageKey("fields.status"),
                type: COLUMN_TYPE.ENUM,
                asExtraParam: true,
                enumValues: [
                    {value: "active", label: resolveLanguageKey("fields.!enums.status.active")},
                    {value: "expired", label: resolveLanguageKey("fields.!enums.status.expired")},
                    {value: "terminated", label: resolveLanguageKey("fields.!enums.status.terminated")},
                ],
            },
        ];
        if (unitId) return statusTenantAndDates;
        return [
            {
                field: "project",
                label: resolveLanguageKey("fields.project"),
                type: COLUMN_TYPE.OBJECT_ID,
                apiUrl: "/api/realEstate/project/select",
                asExtraParam: true,
            },
            {
                field: "edifice",
                label: resolveLanguageKey("fields.edifice"),
                type: COLUMN_TYPE.OBJECT_ID,
                apiUrl: "/api/realEstate/edifice/select",
                dependsOn: "project",
                asExtraParam: true,
            },
            {
                field: "floor",
                label: resolveLanguageKey("fields.floor"),
                type: COLUMN_TYPE.OBJECT_ID,
                apiUrl: "/api/realEstate/floor/select",
                dependsOn: ["edifice", "project"],
                asExtraParam: true,
            },
            {
                field: "unit",
                label: resolveLanguageKey("fields.unit"),
                type: COLUMN_TYPE.OBJECT_ID,
                apiUrl: "/api/realEstate/unit/select",
                dependsOn: ["floor", "edifice", "project"],
            },
            ...statusTenantAndDates,
        ];
    }, [resolveLanguageKey, unitId]);

    return (
        <EntityListPage<Lease>
            apiUrl="/api/realEstate/lease"
            collectionName="leases"
            accessModel="leases"
            tableConfigKey="leases"
            header={(ctx) => (
                <EntityListHeader ctx={ctx} title={headerTitle}>
                    <EntityListCreateButton
                        ctx={ctx}
                        path={unitId
                            ? `/realEstate/leases/create?unitId=${unitId}${unitName ? `&unitName=${encodeURIComponent(unitName)}` : ""}`
                            : "/realEstate/leases/create"
                        }
                        icon={<IconFilePlus className="h-4 w-4" />}
                        labelKey="createLease"
                    />
                </EntityListHeader>
            )}
            buildEditPath={buildLeaseEditPath}
            resolveLanguageKey={resolveLanguageKey}
            sheetLanguagePath="src/modules/propertyManagement/clients/panel/private/leases/center/sheetView/leaseSheetView.tsx"
            cardViewClassName={cn(GRID_TRANSACTIONAL, GRID_COLS_MAX_4)}
            extraFilters={extraFilters}
            extraParams={{administration: false}}
            quickFilters={quickFilters}
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
                    <RecordRentPayment lease={lease} onAction={bindRowAction} />
                    <TerminateLease lease={lease} onAction={bindRowAction} />
                    <MarkDepositPaid lease={lease} onAction={bindRowAction} />
                    <ReturnDeposit lease={lease} onAction={bindRowAction} />
                </>
            )}
            renderFloatingModals={({action, entity, resetAction, listRef}) => (
                <LeaseActionDialogs
                    action={action}
                    lease={entity}
                    onClose={resetAction}
                    onSuccess={(updated?: Lease) => {
                        if (updated?._id) listRef.current?.updateRow?.(updated._id, updated);
                        resetAction();
                    }}
                />
            )}
            renderSheet={({entity, open, onOpenChange, onDelete, onRestore, listRef}) => (
                <LeaseTableSheet
                    lease={entity}
                    open={open}
                    onClose={onOpenChange}
                    onDelete={onDelete}
                    onRestore={onRestore}
                    onUpdated={(updated: Lease) => listRef.current?.updateRow?.(updated._id, updated)}
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/leases/index.tsx"),
    withDebug(true, true, "leases"),
)(AllLeases);
