export function formatEuro(value: number, maximumFractionDigits = 0) {
    return `€${value.toLocaleString(undefined, {maximumFractionDigits})}`;
}

export function formatPercent(value: number, maximumFractionDigits = 1) {
    return `${value.toLocaleString(undefined, {maximumFractionDigits})}%`;
}

export function formatYears(value: number) {
    const rounded = Math.round(value);
    return `${rounded} ${rounded === 1 ? "Year" : "Years"}`;
}

export function formatYearsShort(value: number) {
    const rounded = Math.round(value);
    return `${rounded} ${rounded === 1 ? "year" : "years"}`;
}

export function formatPaybackYears(payback: number) {
    if (!Number.isFinite(payback) || payback >= 100) {
        return "∞";
    }

    return payback.toFixed(1);
}

/** Thumb center / blue fill width — shared ratio math for ROI sliders. */
export function roiThumbCenterCss(ratio: number, thumbSizePx: number) {
    const radius = thumbSizePx / 2;
    return `calc(${radius}px + (100% - ${thumbSizePx}px) * ${ratio})`;
}
