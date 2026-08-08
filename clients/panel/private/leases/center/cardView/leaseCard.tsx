import {compose} from "redux";
import {InfoRowGroup} from "@coreModule/components/custom/infoRowGroup.tsx";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import HiddenElement from "@coreModule/components/custom/hiddenElement.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import TooltipDisplayer from "@coreModule/components/custom/tooltipDisplayer.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import {formatCardDecimal} from "@propertyManagementModule/helpers/general/formatCardNumber.ts";
import type {Lease} from "armonia/src/modules/propertyManagement/api/realEstate/private/lease/lease.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import {Separator} from "@coreModule/components/ui/separator.tsx";
import {Badge} from "@coreModule/components/ui/badge.tsx";
import {withDeletedDrawer} from "@coreModule/helpers/hocs/withDeletedDrawer.tsx";
import InfoRow from "@coreModule/components/custom/infoRow.tsx";
import {IconCalendar, IconCurrencyDollar, IconUser} from "@tabler/icons-react";
import LeaseSheetView from "@propertyManagementModule/clients/panel/private/leases/center/sheetView/leaseSheetView.tsx";
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
import TerminateLease, {TERMINATE_LEASE_ACTION} from "@propertyManagementModule/clients/panel/private/leases/center/actions/terminate.tsx";
import ReturnDeposit, {RETURN_DEPOSIT_ACTION} from "@propertyManagementModule/clients/panel/private/leases/center/actions/returnDeposit.tsx";
import ViewLeasePayments from "@propertyManagementModule/clients/panel/private/leases/center/actions/viewPayments.tsx";
import TerminateLeaseDialog from "@propertyManagementModule/components/custom/leases/terminateLeaseDialog.tsx";
import ReturnDepositDialog from "@propertyManagementModule/components/custom/leases/returnDepositDialog.tsx";

type LeaseCardProps = WithLanguageType & {
    lease: Lease;
    onDelete?: (deletedLease?: Lease, response?: DeletedData) => void;
    onRestore?: () => void;
    onActionSuccess?: (updated?: Lease) => void;
    hideActions?: boolean;
};

function buildEditPath(lease: Lease) {
    const params = new URLSearchParams();
    params.set("leaseId", lease._id);
    if (lease.name) params.set("leaseName", lease.name);
    return `/realEstate/leases/edit?${params.toString()}`;
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
    if (s === "active") return STATUS_BADGE_SUCCESS;
    if (s === "expired") return STATUS_BADGE_WARNING;
    if (s === "terminated") return STATUS_BADGE_DANGER;
    return STATUS_BADGE_NEUTRAL;
}

function LeaseCard({
    lease: leaseProp,
    resolveLanguageKey,
    onDelete: onDeleteProp,
    onRestore: onRestoreProp,
    onActionSuccess,
    hideActions = false,
}: LeaseCardProps) {
    const {action, setAction, entity: lease, setEntity, hideAfterDeletion, onDelete, onRestore} = useEntityCard({
        entityProp: leaseProp,
        onDeleteProp,
        onRestoreProp,
    });

    const handleActionSuccess = (updated?: Lease) => {
        if (updated) setEntity(updated);
        onActionSuccess?.(updated);
        setAction("");
    };

    const {read, write, restore} = useAccess("leases");

    if (hideAfterDeletion || !restore) {
        return <></>;
    }
    if (!read || !Object.keys(read).length) {
        return <HiddenElement />;
    }

    const editPath = buildEditPath(lease);
    const rentDisplay =
        lease.monthlyRent != null
            ? `${formatCardDecimal(lease.monthlyRent)}${lease.rentCurrency?.symbol ? ` ${lease.rentCurrency.symbol}` : ""}`
            : null;
    const tenantName = [lease.tenant?.name, lease.tenant?.surname].filter(Boolean).join(" ");

    return (
        <>
            <EntityCardShell onClick={() => setAction("view")}>
                <EntityTextCardHeader
                    title={lease.name || "—"}
                    subtitle={lease.unit?.name || lease.unit?.unitNumber}
                    badges={lease.status ? (
                        <TooltipDisplayer tooltip={resolveLanguageKey("statusLabel") as string}>
                            <Badge variant="secondary" className={cn("text-xs", statusBadgeClass(lease.status))}>
                                {resolveLanguageKey(`fields.!enums.status.${lease.status}`) as string}
                            </Badge>
                        </TooltipDisplayer>
                    ) : null}
                    showTitle={!!read?.name}
                    showSubtitle={!!read?.unit}
                    showBadges={!!read?.status}
                    hideActions={hideActions}
                    actionMenu={
                        <ActionMenu
                            accessModel="leases"
                            deletedData={lease}
                            onAction={(a: string) => setAction(a)}
                            editPath={editPath}
                            allowMenuForCustomChildren={!!write && !lease.deletedAt}
                        >
                            <ViewLeasePayments lease={lease} />
                            <TerminateLease lease={lease} onAction={(a: string) => setAction(a)} />
                            <ReturnDeposit lease={lease} onAction={(a: string) => setAction(a)} />
                        </ActionMenu>
                    }
                />
                <Separator />
                <div className={CARD_BODY_CLASS}>
                    <InfoRowGroup>
                        <InfoRow
                            icon={IconUser}
                            label={resolveLanguageKey("fields.tenant")}
                            show={!!read?.tenant}
                            value={tenantName || lease.tenant?.email}
                        />
                        <InfoRow
                            icon={IconCurrencyDollar}
                            label={resolveLanguageKey("fields.monthlyRent")}
                            show={!!read?.monthlyRent}
                            value={rentDisplay}
                        />
                        <InfoRow
                            icon={IconCalendar}
                            label={resolveLanguageKey("fields.startDate")}
                            show={!!read?.startDate}
                            value={formatDate(lease.startDate)}
                        />
                        <InfoRow
                            icon={IconCalendar}
                            label={resolveLanguageKey("fields.endDate")}
                            show={!!read?.endDate}
                            value={formatDate(lease.endDate)}
                        />
                    </InfoRowGroup>
                </div>
            </EntityCardShell>

            {!!action && (
                <>
                    {action === "view" && (
                        <LeaseSheetView
                            open={action === "view"}
                            onOpenChange={() => setAction("")}
                            lease={lease}
                            onDelete={onDelete}
                            onRestore={onRestore}
                            actionMenuAllowCustomChildren
                            onActionMenuAction={setAction}
                            actionMenuChildren={(
                                <>
                                    <ViewLeasePayments lease={lease} />
                                    <TerminateLease lease={lease} onAction={(a: string) => setAction(a)} />
                                    <ReturnDeposit lease={lease} onAction={(a: string) => setAction(a)} />
                                </>
                            )}
                        />
                    )}
                    {action === "delete" && (
                        <DeleteAction
                            accessModel="leases"
                            deleteId={lease._id}
                            openAlert={action === "delete"}
                            name={read?.name && lease.name}
                            confirmName={read?.name && lease.name}
                            onSuccess={onDelete}
                            onCancel={() => setAction("")}
                            url="/api/realEstate/lease"
                        />
                    )}
                    {action === "restore" && (
                        <RestoreAction
                            accessModel="leases"
                            deleteId={lease._id}
                            openAlert={action === "restore"}
                            name={read?.name && lease.name}
                            confirmName={read?.name && lease.name}
                            onSuccess={onRestore}
                            onCancel={() => setAction("")}
                            url="/api/realEstate/lease/restore"
                        />
                    )}
                    {action === TERMINATE_LEASE_ACTION && (
                        <TerminateLeaseDialog
                            open
                            onClose={() => setAction("")}
                            lease={lease}
                            onSuccess={handleActionSuccess}
                        />
                    )}
                    {action === RETURN_DEPOSIT_ACTION && (
                        <ReturnDepositDialog
                            open
                            onClose={() => setAction("")}
                            lease={lease}
                            onSuccess={handleActionSuccess}
                        />
                    )}
                </>
            )}
        </>
    );
}

export default compose(
    (Component: any) => withDeletedDrawer(Component, (props: any) => props.lease),
    withLanguage("src/modules/propertyManagement/clients/panel/private/leases/center/cardView/leaseCard.tsx"),
    withDebug(true, true),
)(LeaseCard);
