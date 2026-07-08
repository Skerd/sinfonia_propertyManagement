import {compose} from "redux";
import {useSearchParams} from "react-router-dom";
import {useMemo} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {IconCash} from "@tabler/icons-react";
import {buildTitleBreadcrumb, buildUrlWithExistingParams} from "@coreModule/helpers/general";
import EntityListPage, {type QuickFilterDef} from "@coreModule/components/entityPage/EntityListPage.tsx";
import {COLUMN_TYPE} from "armonia/src/modules/core/database/filter/typeOperators";
import {Sale} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/sale/sale.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import SaleCard from "@propertyManagementModule/clients/panel/private/sales/center/cardView/saleCard.tsx";
import SaleSheetView, {
    buildSaleEditPath,
    saleDeleteRestoreConfirmLabel,
} from "@propertyManagementModule/clients/panel/private/sales/center/sheetView/saleSheetView.tsx";
import SaleRowMenuExtras from "@propertyManagementModule/clients/panel/private/sales/center/actions/saleRowMenuExtras.tsx";
import {GRID_TRANSACTIONAL} from "@propertyManagementModule/components/custom/cards/entityCard.constants.ts";

function AllSales({resolveLanguageKey}: WithLanguageType) {
    const [searchParams] = useSearchParams();
    const unitId   = searchParams.get("unitId")   || undefined;
    const unitName = searchParams.get("unitName") || undefined;
    const edificeId = searchParams.get("edificeId") || undefined;
    const edificeName = searchParams.get("edificeName") || undefined;

    const headerTitle = useMemo(
        () => buildTitleBreadcrumb(resolveLanguageKey("title") as string, [edificeName, unitName]),
        [resolveLanguageKey, edificeName, unitName],
    );

    const headerDescription = useMemo(
        () => (unitId ? resolveLanguageKey("descriptionWithContext") : resolveLanguageKey("description")) as string,
        [resolveLanguageKey, unitId],
    );

    const createPath = buildUrlWithExistingParams(window.location.href, "/realEstate/sales/create");

    const extraFilters = useMemo(() => (unitId ? {unit: unitId} : undefined), [unitId]);
    const extraParams = useMemo(() => (edificeId ? {edificeId} : undefined), [edificeId]);

    const quickFilters = useMemo<QuickFilterDef[]>(() => [
        {
            field: "paymentType",
            label: resolveLanguageKey("paymentType") as string,
            type: COLUMN_TYPE.ENUM,
            enumValues: [
                {value: "cash",         label: resolveLanguageKey("fields.!enums.paymentType.cash")         as string},
                {value: "payment_plan", label: resolveLanguageKey("fields.!enums.paymentType.payment_plan") as string},
            ],
        },
    ], [resolveLanguageKey]);

    return (
        <EntityListPage<Sale>
            apiUrl="/api/realEstate/unit/sale"
            collectionName="sales"
            accessModel="sales"
            tableConfigKey="sales"
            extraParams={extraParams}
            createPath={createPath}
            createIcon={<IconCash className="h-4 w-4" />}
            createLanguageKey="createSale"
            buildEditPath={(sale) =>
                buildSaleEditPath(
                    sale,
                    unitId ?? sale.unit?._id ?? "",
                    unitName ?? sale.unit?.name ?? (sale.unit?.unitNumber != null ? String(sale.unit.unitNumber) : undefined),
                )
            }
            resolveLanguageKey={resolveLanguageKey}
            headerTitle={headerTitle}
            headerDescription={headerDescription}
            extraFilters={extraFilters}
            quickFilters={quickFilters}
            buildDeleteConfirmLabel={(sale, read) => saleDeleteRestoreConfirmLabel(sale, read as {name?: unknown})}
            renderSheet={({entity: sale, open, onOpenChange, onDelete, onRestore}) => (
                <SaleSheetView
                    open={open}
                    onOpenChange={(o: boolean) => { if (!o) onOpenChange(); }}
                    sale={sale}
                    unitId={unitId ?? sale.unit?._id ?? ""}
                    unitName={unitName ?? sale.unit?.name ?? (sale.unit?.unitNumber != null ? String(sale.unit.unitNumber) : undefined)}
                    onDelete={onDelete}
                    onRestore={onRestore}
                />
            )}
            cardViewClassName={GRID_TRANSACTIONAL}
            rowActionMenu={{allowMenuForCustomChildren: true}}
            renderCard={(sale, onDelete, onRestore) => (
                <SaleCard
                    sale={sale}
                    unitId={unitId ?? sale.unit?._id ?? ""}
                    unitName={unitName ?? sale.unit?.name ?? (sale.unit?.unitNumber != null ? String(sale.unit.unitNumber) : undefined)}
                    onDelete={(row: any, response?: DeletedData) => onDelete(row ?? sale, response)}
                    onRestore={() => onRestore(sale)}
                />
            )}
            renderActionMenuChildren={(sale) => <SaleRowMenuExtras sale={sale} />}
        />
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/sales/index.tsx"),
    withDebug(true, true),
)(AllSales);
