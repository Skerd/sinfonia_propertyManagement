import type { FilterGroup, FilterRule } from "armonia/src/modules/core/database/filter";
import { generateUUID } from "@coreModule/helpers/general";
import { isFilterGroupEmpty, mergeAndFilterDSL } from "@coreModule/helpers/filter/mergeFilterDsl.ts";

export { isFilterGroupEmpty, mergeAndFilterDSL };

export type FinanceToolbarDslInputs = {
    vendorContains?: string;
    purchasePersonId?: string;
    project?: string;
    edifice?: string;
    floor?: string;
    unit?: string;
    verificationStatus?: string;
    paymentStatus?: string;
};

function equalsRule(field: string, value: string): FilterRule {
    return {id: generateUUID(), field, operator: "equals", value};
}

/** Toolbar constraints as Filter DSL. */
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
    if (inputs.purchasePersonId?.trim()) rules.push(equalsRule("purchasePerson", inputs.purchasePersonId.trim()));
    const unit = inputs.unit?.trim();
    if (unit) {
        rules.push(equalsRule("unit", unit));
    } else {
        if (inputs.project?.trim()) rules.push(equalsRule("project", inputs.project.trim()));
        if (inputs.edifice?.trim()) rules.push(equalsRule("edifice", inputs.edifice.trim()));
        if (inputs.floor?.trim()) rules.push(equalsRule("floor", inputs.floor.trim()));
    }
    if (inputs.verificationStatus?.trim()) rules.push(equalsRule("verificationStatus", inputs.verificationStatus.trim()));
    if (inputs.paymentStatus?.trim()) rules.push(equalsRule("paymentStatus", inputs.paymentStatus.trim()));
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

export function buildFinanceCalendarFetchFilter(monthStartYmd: string, monthEndYmd: string, toolbar: FinanceToolbarDslInputs): FilterGroup {
    const monthGroup = buildPaymentDateMonthBetweenGroup(monthStartYmd, monthEndYmd);
    const tail = buildFinanceToolbarOnlyFilterGroup(toolbar);
    return mergeAndFilterDSL(monthGroup, tail) ?? monthGroup;
}
