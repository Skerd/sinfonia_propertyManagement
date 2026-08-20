import {useMemo, useState, type MouseEvent} from "react";
import type {MarketingUnitPriceHistoryEntry} from "@propertyManagementModule/clients/client/public/shared/publicTypes.ts";
import {
    buildPriceHistorySmoothPath,
    buildPropertyPriceHistoryPlot,
    PRICE_HISTORY_CHART_VIEWBOX,
    PRICE_HISTORY_HORIZONTAL_GRID_LINES,
    scalePriceHistoryGridLine,
    type PropertyPriceHistoryPoint,
} from "@propertyManagementModule/clients/client/public/property/shared/propertyPriceHistoryData.ts";

const PRONIX_BLUE = "#0247fe";
const STRIPE_SPACING = 14;

type PropertyPriceHistoryChartProps = {
    entries: MarketingUnitPriceHistoryEntry[];
    ariaLabel: string;
    formatTooltip: (label: string, value: string) => string;
    fillHeight?: boolean;
    showCaptions?: boolean;
    accentColor?: string;
    tooltipClassName?: string;
    captionClassName?: string;
};

function findNearestPoint(
    points: PropertyPriceHistoryPoint[],
    clientX: number,
    svgRect: DOMRect,
): PropertyPriceHistoryPoint | null {
    if (points.length === 0) {
        return null;
    }

    const relativeX = ((clientX - svgRect.left) / svgRect.width) * PRICE_HISTORY_CHART_VIEWBOX.width;
    let nearest = points[0];
    let nearestDistance = Math.abs(relativeX - nearest.x);

    for (const point of points) {
        const distance = Math.abs(relativeX - point.x);
        if (distance < nearestDistance) {
            nearest = point;
            nearestDistance = distance;
        }
    }

    return nearest;
}

function PropertyPriceHistoryChart({
    entries,
    ariaLabel,
    formatTooltip,
    fillHeight = false,
    showCaptions = true,
    accentColor = PRONIX_BLUE,
    tooltipClassName,
    captionClassName,
}: PropertyPriceHistoryChartProps) {
    const plot = useMemo(() => buildPropertyPriceHistoryPlot(entries), [entries]);
    const plotPoints = plot?.points ?? [];
    const linePath = useMemo(() => buildPriceHistorySmoothPath(plotPoints), [plotPoints]);
    const highlightPoint = plotPoints.length > 0 ? plotPoints[plotPoints.length - 1] : null;
    const [hoverPoint, setHoverPoint] = useState<PropertyPriceHistoryPoint | null>(null);
    const activePoint = hoverPoint ?? highlightPoint;

    if (!plot || plotPoints.length === 0) {
        return null;
    }

    function handleMouseMove(event: MouseEvent<SVGSVGElement>) {
        const svg = event.currentTarget;
        const rect = svg.getBoundingClientRect();
        setHoverPoint(findNearestPoint(plotPoints, event.clientX, rect));
    }

    function handleMouseLeave() {
        setHoverPoint(null);
    }

    return (
        <div className={`flex w-full flex-col gap-1 ${fillHeight ? "h-full min-h-0" : ""}`}>
            <div className={`relative w-full ${fillHeight ? "min-h-0 flex-1" : "h-[140px] sm:h-[160px] md:h-[180px]"}`}>
                <svg
                    viewBox={`0 0 ${PRICE_HISTORY_CHART_VIEWBOX.width} ${PRICE_HISTORY_CHART_VIEWBOX.height}`}
                    preserveAspectRatio="none"
                    className="size-full"
                    role="img"
                    aria-label={ariaLabel}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                >
                    <defs>
                        <pattern
                            id="propertyPriceVerticalStripes"
                            patternUnits="userSpaceOnUse"
                            width={STRIPE_SPACING}
                            height={PRICE_HISTORY_CHART_VIEWBOX.height}
                        >
                            <line
                                x1={STRIPE_SPACING / 2}
                                x2={STRIPE_SPACING / 2}
                                y1={0}
                                y2={PRICE_HISTORY_CHART_VIEWBOX.height}
                                stroke={accentColor}
                                strokeOpacity={0.1}
                                strokeWidth={1}
                            />
                        </pattern>
                        <linearGradient id="propertyPriceStripeFade" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#ffffff" stopOpacity={1} />
                            <stop offset="55%" stopColor="#ffffff" stopOpacity={1} />
                            <stop offset="100%" stopColor="#ffffff" stopOpacity={0} />
                        </linearGradient>
                        <mask id="propertyPriceStripeMask">
                            <rect
                                width={PRICE_HISTORY_CHART_VIEWBOX.width}
                                height={PRICE_HISTORY_CHART_VIEWBOX.height}
                                fill="url(#propertyPriceStripeFade)"
                            />
                        </mask>
                        <linearGradient id="propertyPriceHighlightLine" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={accentColor} stopOpacity={0.85} />
                            <stop offset="100%" stopColor={accentColor} stopOpacity={0} />
                        </linearGradient>
                    </defs>

                    <rect
                        width={PRICE_HISTORY_CHART_VIEWBOX.width}
                        height={PRICE_HISTORY_CHART_VIEWBOX.height}
                        fill="url(#propertyPriceVerticalStripes)"
                        mask="url(#propertyPriceStripeMask)"
                    />

                    <g>
                        {PRICE_HISTORY_HORIZONTAL_GRID_LINES.map((line) => {
                            const scaled = scalePriceHistoryGridLine(line.y, line.width);
                            return (
                                <line
                                    key={`${line.y}-${line.width}`}
                                    x1={0}
                                    x2={scaled.width}
                                    y1={scaled.y}
                                    y2={scaled.y}
                                    stroke="rgba(24, 24, 24, 0.1)"
                                    strokeDasharray="72 72"
                                />
                            );
                        })}
                    </g>

                    {activePoint && activePoint !== highlightPoint ? (
                        <line
                            x1={activePoint.x}
                            x2={activePoint.x}
                            y1={activePoint.y}
                            y2={PRICE_HISTORY_CHART_VIEWBOX.height}
                            stroke={accentColor}
                            strokeOpacity={0.2}
                            strokeWidth={1.5}
                        />
                    ) : null}

                    {highlightPoint ? (
                        <line
                            x1={highlightPoint.x}
                            x2={highlightPoint.x}
                            y1={highlightPoint.y}
                            y2={PRICE_HISTORY_CHART_VIEWBOX.height}
                            stroke="url(#propertyPriceHighlightLine)"
                            strokeWidth={1.5}
                        />
                    ) : null}

                    <path
                        d={linePath}
                        fill="none"
                        stroke={accentColor}
                        strokeWidth={2.5}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />

                    {activePoint && activePoint !== highlightPoint ? (
                        <circle
                            cx={activePoint.x}
                            cy={activePoint.y}
                            r={5}
                            fill="#ffffff"
                            stroke={accentColor}
                            strokeWidth={2}
                        />
                    ) : null}

                    {highlightPoint ? (
                        <circle
                            cx={highlightPoint.x}
                            cy={highlightPoint.y}
                            r={7}
                            fill="#ffffff"
                            stroke={accentColor}
                            strokeWidth={2}
                        />
                    ) : null}
                </svg>

                {activePoint ? (
                    <div
                        className={`pointer-events-none absolute z-10 rounded-[5px] border px-2 py-1 shadow-sm ${
                            tooltipClassName ??
                            "border-pronix-border bg-white font-aeonik-light text-xs text-pronix-ink not-italic"
                        }`}
                        style={{
                            left: `${(activePoint.x / PRICE_HISTORY_CHART_VIEWBOX.width) * 100}%`,
                            top: `${(activePoint.y / PRICE_HISTORY_CHART_VIEWBOX.height) * 100}%`,
                            transform: "translate(-50%, calc(-100% - 8px))",
                        }}
                    >
                        {formatTooltip(activePoint.label, activePoint.displayPrice)}
                    </div>
                ) : null}
            </div>

            {showCaptions ? (
                <>
            <div className={`hidden px-0 md:block ${captionClassName ?? "font-aeonik-light text-[11px] leading-4 text-pronix-ink-muted not-italic"}`}>
                {plot.yLabels.join(" · ")}
            </div>

            <div className={`flex flex-wrap justify-between gap-2 px-0 ${captionClassName ?? "font-aeonik-light text-[11px] leading-4 text-pronix-ink-muted not-italic"}`}>
                {plot.xLabels.map((month, index) => (
                    <span key={`${month}-${index}`}>{month}</span>
                ))}
            </div>
                </>
            ) : null}
        </div>
    );
}

export default PropertyPriceHistoryChart;
