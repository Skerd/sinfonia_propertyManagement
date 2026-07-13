export type ProjectFinancePricePoint = {
    label: string;
    value: number;
};

export const FINANCE_PRICE_HIGHLIGHT_LABEL = "Nov 2027";

export const FINANCE_Y_SCALE_LABELS = [
    "€1000K",
    "€50K",
    "€20K",
    "€10K",
    "€5K",
    "€3K",
    "€2K",
    "€1K",
    "0",
] as const;

export const FINANCE_X_LABELS = [
    "Feb 2026",
    "Apr 2026",
    "May 2026",
    "Nov 2026",
    "May 2027",
    "Nov 2027",
    "May 2028",
    "Nov 2028",
    "May 2029",
    "Nov 2029",
] as const;

export const PROJECT_FINANCE_PRICE_HISTORY: ProjectFinancePricePoint[] = [
    {label: "Feb 2026", value: 15},
    {label: "Apr 2026", value: 55},
    {label: "May 2026", value: 55},
    {label: "Nov 2026", value: 45},
    {label: "May 2027", value: 45},
    {label: "Nov 2027", value: 65},
    {label: "May 2028", value: 65},
    {label: "Nov 2028", value: 78},
    {label: "May 2029", value: 88},
    {label: "Nov 2029", value: 100},
];

export const FINANCE_CHART_VIEWBOX = {width: 963, height: 605} as const;

export const FINANCE_HORIZONTAL_GRID_LINES = [
    {y: 0.5, width: 926},
    {y: 82.5, width: 907},
    {y: 167.5, width: 808},
    {y: 252.5, width: 739},
    {y: 337.5, width: 421},
    {y: 422.5, width: 106},
    {y: 507.5, width: 19},
] as const;

const GRID_SOURCE_HEIGHT = 677.5;
const GRID_SOURCE_WIDTH = 926.5;

export function scaleFinanceGridLine(y: number, width: number) {
    const scaledY = (y / GRID_SOURCE_HEIGHT) * FINANCE_CHART_VIEWBOX.height;
    const scaledWidth = (width / GRID_SOURCE_WIDTH) * FINANCE_CHART_VIEWBOX.width;
    return {y: scaledY, width: scaledWidth};
}

export function formatFinanceScaleLabel(normalizedValue: number): string {
    const clamped = Math.min(100, Math.max(0, normalizedValue));
    const index = Math.round((1 - clamped / 100) * (FINANCE_Y_SCALE_LABELS.length - 1));
    return FINANCE_Y_SCALE_LABELS[index] ?? "0";
}

export function formatFinanceTooltipValue(label: string, normalizedValue: number): string {
    return `${label} — ${formatFinanceScaleLabel(normalizedValue)}`;
}

export type FinanceChartPoint = {
    label: string;
    value: number;
    x: number;
    y: number;
};

const PLOT_INSET_X = FINANCE_CHART_VIEWBOX.width * 0.04;
const PLOT_INSET_Y = FINANCE_CHART_VIEWBOX.height * 0.04;
const PLOT_WIDTH = FINANCE_CHART_VIEWBOX.width - PLOT_INSET_X * 2;
const PLOT_HEIGHT = FINANCE_CHART_VIEWBOX.height - PLOT_INSET_Y * 2;
const PLOT_BOTTOM = FINANCE_CHART_VIEWBOX.height - PLOT_INSET_Y;

export function mapFinanceHistoryToPlot(): FinanceChartPoint[] {
    const count = PROJECT_FINANCE_PRICE_HISTORY.length;
    return PROJECT_FINANCE_PRICE_HISTORY.map((point, index) => ({
        ...point,
        x: PLOT_INSET_X + (index / Math.max(1, count - 1)) * PLOT_WIDTH,
        y: PLOT_BOTTOM - (point.value / 100) * PLOT_HEIGHT,
    }));
}

export function buildFinanceSmoothPath(points: FinanceChartPoint[]): string {
    if (points.length === 0) {
        return "";
    }
    if (points.length === 1) {
        return `M ${points[0].x} ${points[0].y}`;
    }

    let path = `M ${points[0].x} ${points[0].y}`;
    for (let index = 0; index < points.length - 1; index += 1) {
        const previous = points[index - 1] ?? points[index];
        const current = points[index];
        const next = points[index + 1];
        const afterNext = points[index + 2] ?? next;

        const controlPoint1X = current.x + (next.x - previous.x) / 6;
        const controlPoint1Y = current.y + (next.y - previous.y) / 6;
        const controlPoint2X = next.x - (afterNext.x - current.x) / 6;
        const controlPoint2Y = next.y - (afterNext.y - current.y) / 6;

        path += ` C ${controlPoint1X} ${controlPoint1Y}, ${controlPoint2X} ${controlPoint2Y}, ${next.x} ${next.y}`;
    }

    return path;
}
