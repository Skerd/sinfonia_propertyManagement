import {compose} from "redux";
import {useCallback, useState} from "react";
import {useSelector} from "react-redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import Header from "@coreModule/components/custom/header.tsx";
import apiClient from "@coreModule/helpers/axiosClients/apiClient.ts";
import type {RootState} from "@coreModule/helpers/redux/store/generalStore.ts";
import type {LeaseRegistryRow} from "armonia/src/modules/propertyManagement/api/realEstate/private/rentalsHub/rentalsHub.lease.dto.ts";
import type {RentalPaymentRegistryRow} from "armonia/src/modules/propertyManagement/api/realEstate/private/rentalsHub/rentalsHub.payment.dto.ts";
import type {Lease} from "armonia/src/modules/propertyManagement/api/realEstate/private/lease/lease.dto.ts";
import type {RentalPayment} from "armonia/src/modules/propertyManagement/api/realEstate/private/rentalPayment/rentalPayment.dto.ts";
import LeaseSheetView from "@propertyManagementModule/clients/panel/private/leases/center/sheetView/leaseSheetView.tsx";
import RentalPaymentSheetView from "@propertyManagementModule/clients/panel/private/rentalPayments/center/sheetView/rentalPaymentSheetView.tsx";
import TerminateLease, {TERMINATE_LEASE_ACTION} from "@propertyManagementModule/clients/panel/private/leases/center/actions/terminate.tsx";
import MarkDepositPaid, {MARK_DEPOSIT_PAID_ACTION} from "@propertyManagementModule/clients/panel/private/leases/center/actions/markDepositPaid.tsx";
import ReturnDeposit, {RETURN_DEPOSIT_ACTION} from "@propertyManagementModule/clients/panel/private/leases/center/actions/returnDeposit.tsx";
import ViewLeasePayments from "@propertyManagementModule/clients/panel/private/leases/center/actions/viewPayments.tsx";
import TerminateLeaseDialog from "@propertyManagementModule/components/custom/leases/terminateLeaseDialog.tsx";
import MarkDepositPaidDialog from "@propertyManagementModule/components/custom/leases/markDepositPaidDialog.tsx";
import ReturnDepositDialog from "@propertyManagementModule/components/custom/leases/returnDepositDialog.tsx";
import MarkRentalPaymentPaid, {MARK_RENTAL_PAYMENT_PAID_ACTION} from "@propertyManagementModule/clients/panel/private/rentalPayments/center/actions/markPaid.tsx";
import MarkRentalPaymentPaidDialog from "@propertyManagementModule/components/custom/rentalPayments/markRentalPaymentPaidDialog.tsx";
import LeasesTableSection from "./LeasesTableSection.tsx";
import RentalPaymentsTableSection from "./RentalPaymentsTableSection.tsx";

type SheetState =
    | {type: "lease"; entity: Lease}
    | {type: "rentalPayment"; entity: RentalPayment}
    | null;

function RentalsHubPage({resolveLanguageKey}: WithLanguageType) {
    const {timezone} = useSelector((state: RootState) => state.authentication.user);
    const [sheet, setSheet] = useState<SheetState>(null);
    const [action, setAction] = useState("");

    const closeSheet = useCallback(() => {
        setSheet(null);
        setAction("");
    }, []);

    const openLeaseRow = useCallback(async (row: LeaseRegistryRow) => {
        const res = await apiClient.post<Lease>("/api/realEstate/lease/single", {_id: row._id});
        setAction("");
        setSheet({type: "lease", entity: res.data});
    }, []);

    const openPaymentRow = useCallback(async (row: RentalPaymentRegistryRow) => {
        const res = await apiClient.post<RentalPayment>("/api/realEstate/rentalPayment/single", {_id: row._id});
        setAction("");
        setSheet({type: "rentalPayment", entity: res.data});
    }, []);

    const patchLease = useCallback((updated?: Lease) => {
        if (!updated?._id) return;
        setSheet((prev) =>
            prev?.type === "lease" && prev.entity._id === updated._id
                ? {type: "lease", entity: {...prev.entity, ...updated}}
                : prev,
        );
    }, []);

    const patchPayment = useCallback((updated?: RentalPayment) => {
        if (!updated?._id) return;
        setSheet((prev) =>
            prev?.type === "rentalPayment" && prev.entity._id === updated._id
                ? {type: "rentalPayment", entity: {...prev.entity, ...updated}}
                : prev,
        );
    }, []);

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <Header
                title={String(resolveLanguageKey("title"))}
                description={String(resolveLanguageKey("description"))}
            />

            <div className="flex-1 overflow-auto p-4 gap-y-10">
                <LeasesTableSection
                    resolveLanguageKey={resolveLanguageKey}
                    timezone={timezone}
                    onViewRow={(row) => void openLeaseRow(row)}
                />
                <RentalPaymentsTableSection
                    resolveLanguageKey={resolveLanguageKey}
                    timezone={timezone}
                    onViewRow={(row) => void openPaymentRow(row)}
                />
            </div>

            {sheet?.type === "lease" && (
                <>
                    <LeaseSheetView
                        open
                        onOpenChange={(open: boolean) => { if (!open) closeSheet(); }}
                        lease={sheet.entity}
                        actionMenuAllowCustomChildren
                        onActionMenuAction={setAction}
                        actionMenuChildren={(
                            <>
                                <ViewLeasePayments lease={sheet.entity} />
                                <TerminateLease lease={sheet.entity} onAction={setAction} />
                                <MarkDepositPaid lease={sheet.entity} onAction={setAction} />
                                <ReturnDeposit lease={sheet.entity} onAction={setAction} />
                            </>
                        )}
                        onSheetRowPatched={(row) => patchLease(row as Lease)}
                    />
                    {action === TERMINATE_LEASE_ACTION && (
                        <TerminateLeaseDialog
                            open
                            onClose={() => setAction("")}
                            lease={sheet.entity}
                            onSuccess={(updated?: Lease) => {
                                patchLease(updated);
                                setAction("");
                            }}
                        />
                    )}
                    {action === MARK_DEPOSIT_PAID_ACTION && (
                        <MarkDepositPaidDialog
                            open
                            onClose={() => setAction("")}
                            lease={sheet.entity}
                            onSuccess={(updated?: Lease) => {
                                patchLease(updated);
                                setAction("");
                            }}
                        />
                    )}
                    {action === RETURN_DEPOSIT_ACTION && (
                        <ReturnDepositDialog
                            open
                            onClose={() => setAction("")}
                            lease={sheet.entity}
                            onSuccess={(updated?: Lease) => {
                                patchLease(updated);
                                setAction("");
                            }}
                        />
                    )}
                </>
            )}

            {sheet?.type === "rentalPayment" && (
                <>
                    <RentalPaymentSheetView
                        open
                        onOpenChange={(open: boolean) => { if (!open) closeSheet(); }}
                        rentalPayment={sheet.entity}
                        actionMenuAllowCustomChildren
                        onActionMenuAction={setAction}
                        actionMenuChildren={(
                            <MarkRentalPaymentPaid payment={sheet.entity} onAction={setAction} />
                        )}
                        onSheetRowPatched={(row) => patchPayment(row as RentalPayment)}
                    />
                    {action === MARK_RENTAL_PAYMENT_PAID_ACTION && (
                        <MarkRentalPaymentPaidDialog
                            open
                            onClose={() => setAction("")}
                            payment={sheet.entity}
                            onSuccess={(updated?: RentalPayment) => {
                                patchPayment(updated);
                                setAction("");
                            }}
                        />
                    )}
                </>
            )}
        </div>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/rentalsHub/index.tsx"),
    withDebug(true, true, ["leases", "rentalpayments"]),
)(RentalsHubPage);
