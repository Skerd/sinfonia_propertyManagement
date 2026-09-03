import {compose} from "redux";
import {useSearchParams} from "react-router-dom";
import {useMemo} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {IconCash} from "@tabler/icons-react";
import {buildPageTitle, buildUrlWithExistingParams} from "@coreModule/helpers/general";
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
import CompleteHandoverDialog from "@propertyManagementModule/components/custom/sales/completeHandoverDialog.tsx";
import {GRID_COLS_MAX_4, GRID_TRANSACTIONAL} from "@propertyManagementModule/components/custom/cards/entityCard.constants.ts";
import {cn} from "@coreModule/components/lib/utils.ts";

function AllSales({resolveLanguageKey}: WithLanguageType) {
    const [searchParams] = useSearchParams();
    const unitId   = searchParams.get("unitId")   || undefined;
    const unitName = searchParams.get("unitName") || undefined;
    const edificeId = searchParams.get("edificeId") || undefined;
    const edificeName = searchParams.get("edificeName") || undefined;

    const headerTitle = useMemo(
        () => buildPageTitle(resolveLanguageKey("title") as string, [edificeName, unitName]),
        [resolveLanguageKey, edificeName, unitName],
    );

    const headerDescription = useMemo(
        () => (unitId ? resolveLanguageKey("descriptionWithContext") : resolveLanguageKey("description")) as string,
        [resolveLanguageKey, unitId],
    );

    const createPath = buildUrlWithExistingParams(window.location.href, "/realEstate/sales/create");

    const extraFilters = useMemo(() => (unitId ? {unit: unitId} : undefined), [unitId]);
    const extraParams = useMemo(() => (edificeId ? {edifice: edificeId} : undefined), [edificeId]);

    const quickFilters = useMemo<QuickFilterDef[]>(() => [
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
            field: "paymentType",
            label: resolveLanguageKey("paymentType") as string,
            type: COLUMN_TYPE.ENUM,
            enumValues: [
                {value: "cash",         label: resolveLanguageKey("fields.!enums.paymentType.cash")         as string},
                {value: "payment_plan", label: resolveLanguageKey("fields.!enums.paymentType.payment_plan") as string},
            ],
        },
        {
            field: "approvalStatus",
            label: resolveLanguageKey("fields.approvalStatus") as string,
            type: COLUMN_TYPE.ENUM,
            enumValues: [
                {value: "pending_approval", label: resolveLanguageKey("fields.!enums.approvalStatus.pending_approval") as string},
                {value: "approved",         label: resolveLanguageKey("fields.!enums.approvalStatus.approved")         as string},
                {value: "rejected",         label: resolveLanguageKey("fields.!enums.approvalStatus.rejected")         as string},
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
            renderSheet={({entity: sale, open, onOpenChange, onDelete, onRestore, listRef}) => (
                <SaleSheetView
                    open={open}
                    onOpenChange={(o: boolean) => { if (!o) onOpenChange(); }}
                    sale={sale}
                    unitId={unitId ?? sale.unit?._id ?? ""}
                    unitName={unitName ?? sale.unit?.name ?? (sale.unit?.unitNumber != null ? String(sale.unit.unitNumber) : undefined)}
                    onDelete={onDelete}
                    onRestore={onRestore}
                    onModifySuccess={(updated?: Sale) => {
                        if (updated?._id) listRef.current?.updateRow?.(updated._id, updated);
                    }}
                />
            )}
            cardViewClassName={cn(GRID_TRANSACTIONAL, GRID_COLS_MAX_4)}
            rowActionMenu={{allowMenuForCustomChildren: true}}
            renderCard={(sale, onDelete, onRestore, listRef) => (
                <SaleCard
                    sale={sale}
                    unitId={unitId ?? sale.unit?._id ?? ""}
                    unitName={unitName ?? sale.unit?.name ?? (sale.unit?.unitNumber != null ? String(sale.unit.unitNumber) : undefined)}
                    onDelete={(row: any, response?: DeletedData) => onDelete(row ?? sale, response)}
                    onRestore={() => onRestore(sale)}
                    onModifySuccess={(updated?: Sale) => {
                        if (updated?._id) listRef.current?.updateRow?.(updated._id, updated);
                    }}
                />
            )}
            renderActionMenuChildren={(sale, bindRowAction) => (
                <SaleRowMenuExtras sale={sale} onAction={bindRowAction} />
            )}
            renderFloatingModals={({action, entity, resetAction, listRef}) => {
                const onSuccess = (updated?: Sale) => {
                    if (updated?._id) listRef.current?.updateRow?.(updated._id, updated);
                    resetAction();
                };
                return action === "completeHandover" ? (
                    <CompleteHandoverDialog
                        open
                        onClose={resetAction}
                        sale={entity}
                        onSuccess={onSuccess}
                    />
                ) : null;
            }}
        />
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/sales/index.tsx"),
    withDebug(true, true, "sales"),
)(AllSales);
