/** Format card decimals (avoids float noise like 370.78999999999996). */
export function formatCardDecimal(value: number, digits = 2): string {
    if (!Number.isFinite(value)) return "";
    return value.toFixed(digits);
}

/** Area for card InfoRows, e.g. `370.79m²`. */
export function formatCardAreaM2(value: number, digits = 2): string {
    return `${formatCardDecimal(value, digits)}m²`;
}
