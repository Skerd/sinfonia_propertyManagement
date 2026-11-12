import {minorToNumber, multiplyMinor, sumMinor, toMinor} from "armonia/src/modules/core/helpers/money.ts";

type ExpenditureLine = {amount?: unknown; pricePerUnit?: unknown};

/** A number typed in a line, or undefined while it is empty or half typed. */
function typedNumber(value: unknown): string | undefined {
    if (typeof value !== "number" && typeof value !== "string") return undefined;
    const text = String(value).trim();
    return text !== "" && Number.isFinite(Number(text)) ? text : undefined;
}

/**
 * A line's total in minor units, by the server's rule (`computeUnitCostSubtotal`): the unit price rounded to cents,
 * times the quantity, rounded once (D35). Undefined until both numbers are typed.
 */
export function expenditureLineMinor(line: ExpenditureLine): bigint | undefined {
    const quantity = typedNumber(line.amount);
    const price = typedNumber(line.pricePerUnit);
    if (quantity === undefined || price === undefined) return undefined;
    return multiplyMinor(toMinor(price), quantity);
}

/** The line totals and their exact sum, as amounts, for the form's running totals (UX-07). */
export function expenditureTotals(lines: readonly ExpenditureLine[]): {lineTotals: (number | undefined)[]; subtotal: number} {
    const minors = lines.map(expenditureLineMinor);
    return {
        lineTotals: minors.map((minor) => (minor === undefined ? undefined : minorToNumber(minor))),
        subtotal: minorToNumber(sumMinor(minors.filter((minor): minor is bigint => minor !== undefined))),
    };
}
