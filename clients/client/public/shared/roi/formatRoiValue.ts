export function formatEuro(value: number, maximumFractionDigits = 0) {
    return `€${value.toLocaleString(undefined, {maximumFractionDigits})}`;
}

export function formatPercent(value: number, maximumFractionDigits = 1) {
    return `${value.toLocaleString(undefined, {maximumFractionDigits})}%`;
}

export type YearUnitLabels = {
    singular: string;
    plural: string;
};

const DEFAULT_YEAR_LABELS: YearUnitLabels = {singular: "Year", plural: "Years"};
const DEFAULT_YEAR_LABELS_SHORT: YearUnitLabels = {singular: "year", plural: "years"};

export function formatYears(value: number, labels: YearUnitLabels = DEFAULT_YEAR_LABELS) {
    const rounded = Math.round(value);
    return `${rounded} ${rounded === 1 ? labels.singular : labels.plural}`;
}

export function formatYearsShort(value: number, labels: YearUnitLabels = DEFAULT_YEAR_LABELS_SHORT) {
    const rounded = Math.round(value);
    return `${rounded} ${rounded === 1 ? labels.singular : labels.plural}`;
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
