import {useMemo} from "react";
import type {MarketingUnitPriceHistoryEntry} from "@propertyManagementModule/clients/client/public/shared/publicTypes.ts";
import {buildPropertyPriceHistoryPlot} from "@propertyManagementModule/clients/client/public/property/shared/propertyPriceHistoryData.ts";
import PropertyPriceHistoryChart from "@propertyManagementModule/clients/client/public/property/components/propertyPriceHistoryChart.tsx";

type OpenProjectFigmaFinanceChartProps = {
    title: string;
    emptyLabel: string;
    ariaLabel: string;
    pricePerSqmTemplate: string;
    formatTooltip: (label: string, value: string) => string;
    entries: MarketingUnitPriceHistoryEntry[];
};

function formatChangePercent(first: number, last: number): string | null {
    if (!Number.isFinite(first) || first === 0 || !Number.isFinite(last)) {
        return null;
    }
    const change = ((last - first) / first) * 100;
    if (Math.abs(change) < 0.05) {
        return null;
    }
    const rounded = Math.abs(change) >= 10 ? change.toFixed(0) : change.toFixed(1);
    const sign = change > 0 ? "+" : "";
    return `${sign}${rounded}%`;
}

function OpenProjectFigmaFinanceChart({
    title,
    emptyLabel,
    ariaLabel,
    pricePerSqmTemplate,
    formatTooltip,
    entries,
}: OpenProjectFigmaFinanceChartProps) {
    const plot = useMemo(() => buildPropertyPriceHistoryPlot(entries), [entries]);
    const priceLabel = plot
        ? pricePerSqmTemplate.replace("{{price}}", plot.latestDisplayPrice)
        : null;
    const firstPrice = plot?.points[0]?.price;
    const lastPrice = plot?.points[plot.points.length - 1]?.price;
    const changeLabel =
        firstPrice != null && lastPrice != null && plot.points.length > 1
            ? formatChangePercent(firstPrice, lastPrice)
            : null;
    const changePositive = changeLabel != null && !changeLabel.startsWith("-");

    return (
        <div
            className="relative flex h-full min-h-[28rem] w-full flex-col rounded-[5px] border border-[rgba(24,24,24,0.2)] p-6 md:p-8"
            data-node-id="475:1259"
        >
            <div className="flex flex-wrap items-center justify-between gap-4" data-node-id="475:1752">
                <p className="font-aeonik-medium text-2xl leading-[1.2] tracking-[-0.5px] text-pronix-ink md:text-[32px]">
                    {title}
                </p>
                {plot ? (
                    <div className="flex items-center gap-3">
                        <p className="font-aeonik-medium text-xl text-[#242424] md:text-2xl">{priceLabel}</p>
                        {changeLabel ? (
                            <span
                                className={`inline-flex items-center gap-0.5 rounded-[5px] px-3 py-2 font-aeonik-medium text-lg ${
                                    changePositive
                                        ? "bg-[rgba(31,190,106,0.1)] text-[#1fbe6a]"
                                        : "bg-[rgba(220,38,38,0.08)] text-[#dc2626]"
                                }`}
                            >
                                {changeLabel}
                                <span aria-hidden>{changePositive ? "↑" : "↓"}</span>
                            </span>
                        ) : null}
                    </div>
                ) : null}
            </div>

            {plot ? (
                <div className="mt-8 flex min-h-0 min-w-0 flex-1 gap-3">
                    <div className="flex shrink-0 flex-col justify-between font-aeonik-light text-[13px] leading-[1.2] text-pronix-ink md:text-[15px]">
                        {plot.yLabels.map((label, index) => (
                            <span key={`${label}-${index}`}>{label}</span>
                        ))}
                    </div>
                    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
                        <div className="min-h-0 flex-1">
                            <PropertyPriceHistoryChart
                                entries={entries}
                                ariaLabel={ariaLabel}
                                formatTooltip={formatTooltip}
                                fillHeight
                                showCaptions={false}
                            />
                        </div>
                        <div className="mt-4 flex justify-between gap-1 overflow-hidden font-aeonik-light text-[11px] text-pronix-ink sm:text-[15px]">
                            {plot.xLabels.map((label, index) => (
                                <span key={`${label}-${index}`} className="shrink-0">
                                    {label}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="mt-8 flex min-h-[240px] flex-1 items-center justify-center">
                    <p className="font-aeonik-light text-lg text-pronix-ink-muted">{emptyLabel}</p>
                </div>
            )}
        </div>
    );
}

export default OpenProjectFigmaFinanceChart;
