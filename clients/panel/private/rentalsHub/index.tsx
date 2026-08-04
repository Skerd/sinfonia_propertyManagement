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
import LeasesTableSection from "./LeasesTableSection.tsx";
import RentalPaymentsTableSection from "./RentalPaymentsTableSection.tsx";

type SheetState =
    | {type: "lease"; entity: Lease}
    | {type: "rentalPayment"; entity: RentalPayment}
    | null;

function RentalsHubPage({resolveLanguageKey}: WithLanguageType) {
    const {timezone} = useSelector((state: RootState) => state.authentication.user);
    const [sheet, setSheet] = useState<SheetState>(null);

    const openLeaseRow = useCallback(async (row: LeaseRegistryRow) => {
        const res = await apiClient.post<Lease>("/api/realEstate/lease/single", {_id: row._id});
        setSheet({type: "lease", entity: res.data});
    }, []);

    const openPaymentRow = useCallback(async (row: RentalPaymentRegistryRow) => {
        const res = await apiClient.post<RentalPayment>("/api/realEstate/rentalPayment/single", {_id: row._id});
        setSheet({type: "rentalPayment", entity: res.data});
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
                <LeaseSheetView
                    open
                    onOpenChange={(open: boolean) => { if (!open) setSheet(null); }}
                    lease={sheet.entity}
                    hideActions
                />
            )}

            {sheet?.type === "rentalPayment" && (
                <RentalPaymentSheetView
                    open
                    onOpenChange={(open: boolean) => { if (!open) setSheet(null); }}
                    rentalPayment={sheet.entity}
                    hideActions
                />
            )}
        </div>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/rentalsHub/index.tsx"),
    withDebug(true, true),
)(RentalsHubPage);
