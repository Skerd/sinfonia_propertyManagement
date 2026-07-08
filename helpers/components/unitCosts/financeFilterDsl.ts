import type { FilterGroup } from "armonia/src/modules/core/database/filter";
import { generateUUID } from "@coreModule/helpers/general";
import { isFilterGroupEmpty, mergeAndFilterDSL } from "@coreModule/helpers/filter/mergeFilterDsl.ts";

export { isFilterGroupEmpty, mergeAndFilterDSL };

export type FinanceToolbarDslInputs = {
    vendorContains?: string;
    purchasePersonId?: string;
};

/** Optional vendor / purchaser DSL merged with calendar month or expense table DSL (verification, payment & unit use flat body fields). */
export function buildFinanceToolbarOnlyFilterGroup(inputs: FinanceToolbarDslInputs): FilterGroup | undefined {
    const rules: FilterGroup["rules"] = [];
    const v = inputs.vendorContains?.trim();
    if (v) {
        rules.push({
            id: generateUUID(),
            field: "vendorName",
            operator: "contains",
            value: v,
        });
    }
    if (inputs.purchasePersonId?.trim()) {
        rules.push({
            id: generateUUID(),
            field: "purchasePerson",
            operator: "equals",
            value: inputs.purchasePersonId.trim(),
        });
    }
    if (rules.length === 0) return undefined;
    return {
        id: generateUUID(),
        operator: "and",
        rules,
        groups: [],
    };
}

export function buildPaymentDateMonthBetweenGroup(startYmd: string, endYmd: string): FilterGroup {
    return {
        id: generateUUID(),
        operator: "and",
        rules: [
            {
                id: generateUUID(),
                field: "paymentDate",
                operator: "between",
                value: [startYmd, endYmd],
            },
        ],
        groups: [],
    };
}

/** Calendar month constraint AND optional vendor/purchaser rules. */
export function buildFinanceCalendarFetchFilter(monthStartYmd: string, monthEndYmd: string, toolbar: FinanceToolbarDslInputs): FilterGroup {
    const monthGroup = buildPaymentDateMonthBetweenGroup(monthStartYmd, monthEndYmd);
    const tail = buildFinanceToolbarOnlyFilterGroup(toolbar);
    return mergeAndFilterDSL(monthGroup, tail) ?? monthGroup;
}
