import {DEFAULT_DECIMAL_PLACES, minorToNumber, multiplyMinor, sumMinor, toMinor} from "armonia/src/modules/core/helpers/money.ts";

type ExpenditureLine = {amount?: unknown; pricePerUnit?: unknown};

/** A number typed in a line, or undefined while it is empty or half typed. */
function typedNumber(value: unknown): string | undefined {
    if (typeof value !== "number" && typeof value !== "string") return undefined;
    const text = String(value).trim();
    return text !== "" && Number.isFinite(Number(text)) ? text : undefined;
}

/**
 * A line's total in minor units, by the server's rule (`computeUnitCostSubtotal`): the unit price rounded to the
 * currency's precision, times the quantity, rounded once (D35). Undefined until both numbers are typed.
 */
export function expenditureLineMinor(line: ExpenditureLine, decimals: number = DEFAULT_DECIMAL_PLACES): bigint | undefined {
    const quantity = typedNumber(line.amount);
    const price = typedNumber(line.pricePerUnit);
    if (quantity === undefined || price === undefined) return undefined;
    return multiplyMinor(toMinor(price, decimals), quantity);
}

/**
 * The line totals and their exact sum, as amounts, for the form's running totals (UX-07), at the picked currency's
 * decimal places (cents until it is picked, as the server does for a currency it cannot read).
 */
export function expenditureTotals(
    lines: readonly ExpenditureLine[],
    decimals: number = DEFAULT_DECIMAL_PLACES,
): {lineTotals: (number | undefined)[]; subtotal: number} {
    const minors = lines.map((line) => expenditureLineMinor(line, decimals));
    return {
        lineTotals: minors.map((minor) => (minor === undefined ? undefined : minorToNumber(minor, decimals))),
        subtotal: minorToNumber(sumMinor(minors.filter((minor): minor is bigint => minor !== undefined)), decimals),
    };
}
