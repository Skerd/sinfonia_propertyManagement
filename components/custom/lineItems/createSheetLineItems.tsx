import {createElement, type ComponentType, type ReactNode} from "react";
import type {FieldBinding} from "armonia/src/modules/core/api/auxiliary/private/viewConfig";
import type {ViewRendererContext} from "@coreModule/components/viewEngine/viewRendererHelpers.ts";
import {resolvePath} from "@coreModule/components/viewEngine/viewRendererHelpers.ts";
import ValueNotSet from "@coreModule/components/custom/valueNotSet.tsx";
import type {Media} from "armonia/src/modules/core/types";
import type {SheetLineItem} from "./sheetLineItems.tsx";

type LineItemsVariant = "materialsPlan" | "costBreakdown" | "expenditureItems";

function parseQty(row: Record<string, unknown>): number | undefined {
    const v = row.amount ?? row.quantity;
    if (typeof v === "number" && Number.isFinite(v)) return v;
    if (typeof v === "string" && v.trim() !== "") {
        const n = Number(v);
        return Number.isFinite(n) ? n : undefined;
    }
    return undefined;
}

function parseCost(row: Record<string, unknown>): number | undefined {
    const v = row.pricePerUnit ?? row.cost;
    if (typeof v === "number" && Number.isFinite(v)) return v;
    if (typeof v === "string" && v.trim() !== "") {
        const n = Number(v);
        return Number.isFinite(n) ? n : undefined;
    }
    return undefined;
}

function resolveVariant(wp: Record<string, unknown>): LineItemsVariant {
    if (wp.variant === "costBreakdown") return "costBreakdown";
    if (wp.variant === "expenditureItems") return "expenditureItems";
    return "materialsPlan";
}

/**
 * Normalizes materials / cost / expenditure arrays and renders `#SheetModificationLineItems`.
 */
export function createSheetLineItems(
    data: Record<string, unknown> | undefined,
    binding: FieldBinding,
    ctx: ViewRendererContext,
    wp: Record<string, unknown>,
    Component: ComponentType<any> | null,
    index?: number,
): ReactNode {
    if (!data || !Component) return null;
    const raw = resolvePath(data, binding.name);
    const items = Array.isArray(raw) ? (raw as Record<string, unknown>[]) : [];
    const variant = resolveVariant(wp);
    let currencyPrefix = "";
    if (
        (variant === "costBreakdown" || variant === "expenditureItems") &&
        typeof wp.currencyPath === "string" &&
        wp.currencyPath.length > 0
    ) {
        const cur = resolvePath(data, wp.currencyPath);
        if (cur != null && typeof cur === "object") {
            const c = cur as Record<string, unknown>;
            const sym = c.symbol ?? c.abbreviation;
            currencyPrefix = typeof sym === "string" && sym.length > 0 ? sym : "";
        }
    }
    if (items.length === 0) return createElement(ValueNotSet, index != null ? {key: index} : undefined);

    const normalized: SheetLineItem[] = items.map((row) => {
        if (variant === "expenditureItems") {
            const titleVal = row.title ?? row.item;
            const rawMedia = row.media;
            const lineMedia =
                Array.isArray(rawMedia) && rawMedia.length > 0
                    ? (rawMedia.filter((m) => m != null && typeof m === "object") as Media[])
                    : undefined;
            return {
                item: typeof titleVal === "string" ? titleVal : undefined,
                quantity: parseQty(row),
                measureUnitKey: typeof row.unit === "string" ? row.unit : undefined,
                categoryKey: typeof row.category === "string" ? row.category : undefined,
                cost: parseCost(row),
                media: lineMedia,
            };
        }
        const titleVal = row.title ?? row.item;
        return {
            item: typeof titleVal === "string" ? titleVal : undefined,
            quantity: parseQty(row),
            unit: typeof row.unit === "string" ? row.unit : undefined,
            notes: typeof row.notes === "string" ? row.notes : undefined,
            cost: parseCost(row),
            source: typeof row.source === "string" ? row.source : undefined,
        };
    });

    const formatLineItemMoney = (n: number) =>
        Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    let footerTotalLabel: string | undefined;
    let footerTotalFormatted: string | undefined;
    if (variant === "expenditureItems" || variant === "costBreakdown") {
        let displayTotal: number | undefined;
        if (typeof wp.totalPath === "string" && wp.totalPath.length > 0) {
            const tv = resolvePath(data, wp.totalPath);
            if (typeof tv === "number" && Number.isFinite(tv)) displayTotal = tv;
        }
        if (displayTotal === undefined) {
            let sum = 0;
            let any = false;
            for (const row of items) {
                const q = parseQty(row);
                const c = parseCost(row);
                if (q !== undefined && c !== undefined) {
                    sum += q * c;
                    any = true;
                }
            }
            if (any) displayTotal = sum;
        }
        if (displayTotal !== undefined && Number.isFinite(displayTotal)) {
            const labelKey =
                typeof wp.totalLabelKey === "string" && wp.totalLabelKey.length > 0
                    ? wp.totalLabelKey
                    : "documentSubtotal";
            footerTotalLabel = String(ctx.resolveLanguageKey(labelKey));
            footerTotalFormatted = `${currencyPrefix}${formatLineItemMoney(displayTotal)}`;
        }
    }

    return createElement(Component, {
        ...(index != null ? {key: index} : {}),
        items: normalized,
        variant,
        resolveLanguageKey: ctx.resolveLanguageKey,
        className: typeof wp.className === "string" ? wp.className : undefined,
        currencyPrefix,
        footerTotalLabel,
        footerTotalFormatted,
    });
}
