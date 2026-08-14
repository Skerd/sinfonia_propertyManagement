import {format, isValid, parseISO, subMonths} from "date-fns";
import type {MarketingUnitPriceHistoryEntry} from "@propertyManagementModule/clients/client/public/shared/publicTypes.ts";

export const PRICE_HISTORY_CHART_VIEWBOX = {width: 963, height: 605} as const;

export const PRICE_HISTORY_HORIZONTAL_GRID_LINES = [
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

const PLOT_INSET_X = PRICE_HISTORY_CHART_VIEWBOX.width * 0.04;
const PLOT_INSET_Y = PRICE_HISTORY_CHART_VIEWBOX.height * 0.04;
const PLOT_WIDTH = PRICE_HISTORY_CHART_VIEWBOX.width - PLOT_INSET_X * 2;
const PLOT_HEIGHT = PRICE_HISTORY_CHART_VIEWBOX.height - PLOT_INSET_Y * 2;
const PLOT_BOTTOM = PRICE_HISTORY_CHART_VIEWBOX.height - PLOT_INSET_Y;

export type PropertyPriceHistoryChartPoint = {
    label: string;
    value: number;
    x: number;
    y: number;
};

export type PropertyPriceHistoryPoint = PropertyPriceHistoryChartPoint & {
    price: number;
    displayPrice: string;
};

export function scalePriceHistoryGridLine(y: number, width: number) {
    const scaledY = (y / GRID_SOURCE_HEIGHT) * PRICE_HISTORY_CHART_VIEWBOX.height;
    const scaledWidth = (width / GRID_SOURCE_WIDTH) * PRICE_HISTORY_CHART_VIEWBOX.width;
    return {y: scaledY, width: scaledWidth};
}

export function buildPriceHistorySmoothPath(points: PropertyPriceHistoryChartPoint[]): string {
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

function parseChangedAt(value?: string): Date | null {
    if (!value) return null;
    const date = parseISO(value);
    return isValid(date) ? date : null;
}

function currencyPrefix(entry?: MarketingUnitPriceHistoryEntry): string {
    return entry?.currency?.symbol?.trim()
        || entry?.currency?.abbreviation?.trim()
        || "€";
}

export function formatPropertyHistoryPrice(value: number, prefix: string): string {
    if (value >= 1_000_000) {
        const millions = value / 1_000_000;
        const formatted = millions >= 10
            ? millions.toFixed(0)
            : millions.toFixed(millions >= 1 ? 1 : 2).replace(/\.0$/, "");
        return `${prefix}${formatted}M`;
    }
    if (value >= 1_000) {
        const thousands = value / 1_000;
        const formatted = thousands >= 10
            ? thousands.toFixed(0)
            : thousands.toFixed(1).replace(/\.0$/, "");
        return `${prefix}${formatted}K`;
    }
    return `${prefix}${Math.round(value).toLocaleString()}`;
}

function niceStep(range: number, targetTicks: number): number {
    const rough = range / Math.max(1, targetTicks - 1);
    if (rough <= 0) return 1;
    const magnitude = 10 ** Math.floor(Math.log10(rough));
    const normalized = rough / magnitude;
    const step = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
    return step * magnitude;
}

function buildPriceAxisBounds(minPrice: number, maxPrice: number, tickCount: number) {
    const span = Math.max(maxPrice - minPrice, maxPrice * 0.12, 1);
    const paddedMin = Math.max(0, minPrice - span * 0.12);
    const paddedMax = maxPrice + span * 0.12;
    const step = niceStep(paddedMax - paddedMin, tickCount);
    const plotMin = Math.max(0, Math.floor(paddedMin / step) * step);
    const plotMax = Math.ceil(paddedMax / step) * step;
    return {
        plotMin,
        plotMax: Math.max(plotMax, plotMin + step),
        step,
    };
}

export function buildPropertyPriceHistoryPlot(entries: MarketingUnitPriceHistoryEntry[]): {
    points: PropertyPriceHistoryPoint[];
    xLabels: string[];
    yLabels: string[];
    currencyPrefix: string;
    latestDisplayPrice: string;
} | null {
    const sorted = [...entries]
        .map((entry) => ({
            ...entry,
            price: Number(entry.price) || 0,
            date: parseChangedAt(entry.changedAt),
        }))
        .sort((a, b) => (a.date?.getTime() ?? 0) - (b.date?.getTime() ?? 0));

    if (sorted.length === 0) {
        return null;
    }

    const first = sorted[0];
    const pastDate = first.date ? subMonths(first.date, 6) : null;
    const series = [
        {
            ...first,
            date: pastDate,
            changedAt: pastDate?.toISOString() ?? first.changedAt,
        },
        ...sorted,
    ];

    const prefix = currencyPrefix(series[series.length - 1] ?? series[0]);
    const prices = series.map((entry) => entry.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const yTickCount = 6;
    const {plotMin, plotMax} = buildPriceAxisBounds(minPrice, maxPrice, yTickCount);
    const plotRange = Math.max(plotMax - plotMin, 1);

    const sameMonth = series.every((entry) => {
        const start = series[0]?.date;
        return !entry.date || !start
            || (entry.date.getFullYear() === start.getFullYear() && entry.date.getMonth() === start.getMonth());
    });

    const points: PropertyPriceHistoryPoint[] = series.map((entry, index) => {
        const label = entry.date
            ? format(entry.date, sameMonth ? "dd MMM" : "MMM yyyy")
            : entry.changedAt ?? `Point ${index + 1}`;
        const normalized = (entry.price - plotMin) / plotRange;
        return {
            label,
            value: Math.min(100, Math.max(0, normalized * 100)),
            price: entry.price,
            displayPrice: formatPropertyHistoryPrice(entry.price, prefix),
            x: PLOT_INSET_X + (index / Math.max(1, series.length - 1)) * PLOT_WIDTH,
            y: PLOT_BOTTOM - normalized * PLOT_HEIGHT,
        };
    });

    const yLabels = Array.from({length: yTickCount}, (_, index) => {
        const ratio = index / (yTickCount - 1);
        const price = plotMax - ratio * plotRange;
        return formatPropertyHistoryPrice(price, prefix);
    });

    const maxXLabels = 8;
    const step = Math.max(1, Math.ceil(points.length / maxXLabels));
    const xLabels = points
        .filter((_, index) => index === 0 || index === points.length - 1 || index % step === 0)
        .map((point) => point.label);

    const latest = points[points.length - 1];

    return {
        points,
        xLabels: xLabels.length > 0 ? xLabels : points.map((point) => point.label),
        yLabels,
        currencyPrefix: prefix,
        latestDisplayPrice: latest?.displayPrice ?? formatPropertyHistoryPrice(0, prefix),
    };
}
