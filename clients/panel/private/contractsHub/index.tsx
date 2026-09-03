import {compose} from "redux";
import {useCallback, useState} from "react";
import {useSelector} from "react-redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import Header from "@coreModule/components/custom/header.tsx";
import {readPageHelp} from "@coreModule/components/custom/pageHelp.tsx";
import apiClient from "@coreModule/helpers/axiosClients/apiClient.ts";
import type {RootState} from "@coreModule/helpers/redux/store/generalStore.ts";
import type {ContractRegistryRow} from "armonia/src/modules/propertyManagement/api/realEstate/private/contractsHub/contractsHub.contract.dto.ts";
import type {ClientRegistryRow} from "armonia/src/modules/propertyManagement/api/realEstate/private/contractsHub/contractsHub.client.dto.ts";
import type {Sale} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/sale/sale.dto.ts";
import type {Reservation} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/reservation/reservation.dto.ts";
import SaleSheetView from "@propertyManagementModule/clients/panel/private/sales/center/sheetView/saleSheetView.tsx";
import ReservationSheetView from "@propertyManagementModule/clients/panel/private/reservations/center/sheetView/reservationSheetView.tsx";
import ContractsTableSection from "./ContractsTableSection.tsx";
import ClientsTableSection from "./ClientsTableSection.tsx";

type SheetState =
    | {type: "sale"; entity: Sale; unitId: string; unitName?: string}
    | {type: "reservation"; entity: Reservation; unitId: string; unitName?: string}
    | null;

function ContractsHubPage({resolveLanguageKey}: WithLanguageType) {
    const {timezone} = useSelector((state: RootState) => state.authentication.user);
    const [sheet, setSheet] = useState<SheetState>(null);

    const openContractRow = useCallback(async (row: ContractRegistryRow) => {
        if (row.sourceType === "sale") {
            const res = await apiClient.post<Sale>("/api/realEstate/unit/sale/single", {_id: row.sourceId});
            const sale = res.data;
            setSheet({
                type: "sale",
                entity: sale,
                unitId: row.unit?._id ?? sale.unit?._id ?? "",
                unitName: row.unit?.name ?? sale.unit?.name,
            });
            return;
        }

        const res = await apiClient.post<Reservation>(
            "/api/realEstate/unit/reservation/single",
            {_id: row.sourceId},
        );
        const reservation = res.data;
        setSheet({
            type: "reservation",
            entity: reservation,
            unitId: row.unit?._id ?? reservation.unit?._id ?? "",
            unitName: row.unit?.name ?? reservation.unit?.name,
        });
    }, []);

    const openClientRow = useCallback(async (row: ClientRegistryRow) => {
        if (!row.sourceId || !row.sourceType) return;

        if (row.sourceType === "sale") {
            const res = await apiClient.post<Sale>("/api/realEstate/unit/sale/single", {_id: row.sourceId});
            const sale = res.data;
            setSheet({
                type: "sale",
                entity: sale,
                unitId: row.unitId,
                unitName: row.unit?.name,
            });
            return;
        }

        const res = await apiClient.post<Reservation>(
            "/api/realEstate/unit/reservation/single",
            {_id: row.sourceId},
        );
        const reservation = res.data;
        setSheet({
            type: "reservation",
            entity: reservation,
            unitId: row.unitId,
            unitName: row.unit?.name,
        });
    }, []);

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <Header
                title={String(resolveLanguageKey("title"))}
                description={String(resolveLanguageKey("description"))}
                help={readPageHelp(resolveLanguageKey)}
            />

            <div className="flex-1 overflow-auto p-4 gap-y-10">
                <ContractsTableSection
                    resolveLanguageKey={resolveLanguageKey}
                    timezone={timezone}
                    onViewRow={(row) => void openContractRow(row)}
                />
                <ClientsTableSection
                    resolveLanguageKey={resolveLanguageKey}
                    timezone={timezone}
                    onViewRow={(row) => void openClientRow(row)}
                />
            </div>

            {sheet?.type === "sale" && (
                <SaleSheetView
                    open
                    onOpenChange={(open: boolean) => { if (!open) setSheet(null); }}
                    sale={sheet.entity}
                    unitId={sheet.unitId}
                    unitName={sheet.unitName}
                    hideActions
                />
            )}

            {sheet?.type === "reservation" && (
                <ReservationSheetView
                    open
                    onOpenChange={(open: boolean) => { if (!open) setSheet(null); }}
                    reservation={sheet.entity}
                    unitId={sheet.unitId}
                    unitName={sheet.unitName}
                    hideActions
                />
            )}
        </div>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/contractsHub/index.tsx"),
    withDebug(true, true, ["sales", "reservations"]),
)(ContractsHubPage);
