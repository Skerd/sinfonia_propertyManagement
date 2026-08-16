import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import {Sale} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/sale/sale.dto.ts";
import {useViewConfig} from "@coreModule/helpers/hooks/useViewConfig.ts";
import SheetViewRenderer from "@coreModule/components/viewEngine/SheetViewRenderer.tsx";
import {useEffect, useState} from "react";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import SaleRowMenuExtras from "@propertyManagementModule/clients/panel/private/sales/center/actions/saleRowMenuExtras.tsx";

/** List route with optional unit filter (sidebar / units menu parity). */
export function salesListPath(unitId?: string, unitName?: string): string {
    const params = new URLSearchParams();
    if (unitId) params.set("unitId", unitId);
    if (unitName) params.set("unitName", unitName);
    const q = params.toString();
    return q ? `/realEstate/sales?${q}` : "/realEstate/sales";
}

export function buildSaleEditPath(sale: Sale, unitId: string, unitName?: string): string {
    const params = new URLSearchParams();
    params.set("saleId", sale._id);
    params.set("unitId", unitId);
    if (unitName) params.set("unitName", unitName);
    return `/realEstate/sales/edit?${params.toString()}`;
}

/**
 * Delete/restore dialogs: same identity users see on the card (`sale.name` / SALE-… code when allowed via `read.name`),
 * never the unit label alone (that was wrong for list + sheet actions).
 */
export function saleDeleteRestoreConfirmLabel(
    sale: Sale,
    read: { name?: unknown } | null | undefined | false,
): string | undefined {
    const r = read && typeof read === "object" ? read : null;
    if (!r?.name) return undefined;
    const code = sale.name?.trim();
    if (code) return code;
    const fallback = [sale.unit?.name, sale.unit?.unitNumber].filter(Boolean).join(" · ").trim();
    return fallback || sale._id;
}

export type SaleSheetViewOwnProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    /** Full row from list/card, or bootstrap from DisplayCard while `/single` loads. */
    sale?: Sale;
    unitId?: string;
    unitName?: string;
    hideActions?: boolean;
    /** Same contract as {@link SheetViewRenderer}: delete modal passes {@link DeletedData} only. */
    onDelete?: (response?: DeletedData) => void;
    onRestore?: () => void;
    fetchId?: string;
};

function SaleSheetView({
    open,
    onOpenChange,
    sale: saleProp,
    unitId: unitIdProp,
    unitName: unitNameProp,
    hideActions = false,
    onDelete,
    onRestore,
    resolveLanguageKey,
    fetchId,
}: SaleSheetViewOwnProps & WithLanguageType) {
    const access = useAccess("sales");
    const viewConfig = useViewConfig("sales", "sheet");
    const [sheetData, setSheetData] = useState<Record<string, any>>(saleProp || {_id: fetchId});

    useEffect(() => {
        if (!saleProp) return;
        setSheetData(saleProp);
    }, [saleProp]);

    const entityId = saleProp?._id ?? fetchId;
    const asSale = sheetData as Sale;
    const resolvedUnitId = unitIdProp ?? asSale.unit?._id ?? "";
    const resolvedUnitName =
        unitNameProp ?? asSale.unit?.name ?? (asSale.unit?.unitNumber != null ? String(asSale.unit.unitNumber) : undefined);

    const editPath =
        resolvedUnitId && entityId ? buildSaleEditPath(asSale, resolvedUnitId, resolvedUnitName) : "";

    if (!viewConfig) return null;
    if (!entityId) return null;

    return (
        <SheetViewRenderer
            config={viewConfig}
            url="/api/realEstate/unit/sale/single"
            fetchId={fetchId}
            onDataFetched={(data) => {
                setSheetData(data);
            }}
            data={sheetData}
            open={open}
            onOpenChange={onOpenChange}
            resolveLanguageKey={resolveLanguageKey}
            access={access}
            hideActions={hideActions}
            onDelete={onDelete}
            onRestore={onRestore}
            editPath={editPath}
            deleteRestoreConfirmLabel={saleDeleteRestoreConfirmLabel(asSale, access.read)}
            actionMenuChildren={<SaleRowMenuExtras sale={asSale} />}
            actionMenuAllowCustomChildren={true}
        />
    );
}

const ComposedSaleSheetView = compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/sales/center/sheetView/saleSheetView.tsx"),
    withDebug(true, true),
)(SaleSheetView);

export default ComposedSaleSheetView;
