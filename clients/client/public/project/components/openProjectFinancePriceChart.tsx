import {useMemo, useState, type MouseEvent} from "react";
import {
    buildFinanceSmoothPath,
    FINANCE_CHART_VIEWBOX,
    FINANCE_HORIZONTAL_GRID_LINES,
    FINANCE_PRICE_HIGHLIGHT_LABEL,
    FINANCE_X_LABELS,
    FINANCE_Y_SCALE_LABELS,
    formatFinanceScaleLabel,
    mapFinanceHistoryToPlot,
    scaleFinanceGridLine,
    type FinanceChartPoint,
} from "@propertyManagementModule/clients/client/public/project/shared/projectFinancePriceHistoryData.ts";

const PRONIX_BLUE = "#0247fe";
const STRIPE_SPACING = 14;

type OpenProjectFinancePriceChartProps = {
    ariaLabel: string;
    formatTooltip: (label: string, scaleLabel: string) => string;
};

function findNearestPoint(points: FinanceChartPoint[], clientX: number, svgRect: DOMRect): FinanceChartPoint | null {
    if (points.length === 0) {
        return null;
    }

    const relativeX = ((clientX - svgRect.left) / svgRect.width) * FINANCE_CHART_VIEWBOX.width;
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

function OpenProjectFinancePriceChart({ariaLabel, formatTooltip}: OpenProjectFinancePriceChartProps) {
    const plotPoints = useMemo(() => mapFinanceHistoryToPlot(), []);
    const linePath = useMemo(() => buildFinanceSmoothPath(plotPoints), [plotPoints]);
    const highlightPoint = plotPoints.find((point) => point.label === FINANCE_PRICE_HIGHLIGHT_LABEL) ?? null;
    const [hoverPoint, setHoverPoint] = useState<FinanceChartPoint | null>(null);
    const activePoint = hoverPoint ?? highlightPoint;

    function handleMouseMove(event: MouseEvent<SVGSVGElement>) {
        const svg = event.currentTarget;
        const rect = svg.getBoundingClientRect();
        setHoverPoint(findNearestPoint(plotPoints, event.clientX, rect));
    }

    function handleMouseLeave() {
        setHoverPoint(null);
    }

    return (
        <div className="flex w-full flex-col">
            <div
                className="relative aspect-[963/605] min-h-[280px] w-full md:min-h-[400px]"
                data-node-id="475:1927"
            >
                <svg
                    viewBox={`0 0 ${FINANCE_CHART_VIEWBOX.width} ${FINANCE_CHART_VIEWBOX.height}`}
                    preserveAspectRatio="none"
                    className="size-full"
                    role="img"
                    aria-label={ariaLabel}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                >
                    <defs>
                        <pattern
                            id="financeVerticalStripes"
                            patternUnits="userSpaceOnUse"
                            width={STRIPE_SPACING}
                            height={FINANCE_CHART_VIEWBOX.height}
                        >
                            <line
                                x1={STRIPE_SPACING / 2}
                                x2={STRIPE_SPACING / 2}
                                y1={0}
                                y2={FINANCE_CHART_VIEWBOX.height}
                                stroke="rgba(2, 71, 254, 0.1)"
                                strokeWidth={1}
                            />
                        </pattern>
                        <linearGradient id="financeStripeFade" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#ffffff" stopOpacity={1} />
                            <stop offset="55%" stopColor="#ffffff" stopOpacity={1} />
                            <stop offset="100%" stopColor="#ffffff" stopOpacity={0} />
                        </linearGradient>
                        <mask id="financeStripeMask">
                            <rect
                                width={FINANCE_CHART_VIEWBOX.width}
                                height={FINANCE_CHART_VIEWBOX.height}
                                fill="url(#financeStripeFade)"
                            />
                        </mask>
                        <linearGradient id="financeHighlightLine" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={PRONIX_BLUE} stopOpacity={0.85} />
                            <stop offset="100%" stopColor={PRONIX_BLUE} stopOpacity={0} />
                        </linearGradient>
                    </defs>

                    <rect
                        width={FINANCE_CHART_VIEWBOX.width}
                        height={FINANCE_CHART_VIEWBOX.height}
                        fill="url(#financeVerticalStripes)"
                        mask="url(#financeStripeMask)"
                    />

                    <g data-node-id="475:1990">
                        {FINANCE_HORIZONTAL_GRID_LINES.map((line) => {
                            const scaled = scaleFinanceGridLine(line.y, line.width);
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
                            y2={FINANCE_CHART_VIEWBOX.height}
                            stroke={PRONIX_BLUE}
                            strokeOpacity={0.2}
                            strokeWidth={1.5}
                        />
                    ) : null}

                    {highlightPoint ? (
                        <line
                            x1={highlightPoint.x}
                            x2={highlightPoint.x}
                            y1={highlightPoint.y}
                            y2={FINANCE_CHART_VIEWBOX.height}
                            stroke="url(#financeHighlightLine)"
                            strokeWidth={1.5}
                        />
                    ) : null}

                    <path
                        d={linePath}
                        fill="none"
                        stroke={PRONIX_BLUE}
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
                            stroke={PRONIX_BLUE}
                            strokeWidth={2}
                        />
                    ) : null}

                    {highlightPoint ? (
                        <circle
                            cx={highlightPoint.x}
                            cy={highlightPoint.y}
                            r={7}
                            fill="#ffffff"
                            stroke={PRONIX_BLUE}
                            strokeWidth={2}
                        />
                    ) : null}
                </svg>

                {activePoint ? (
                    <div
                        className="pointer-events-none absolute z-10 rounded-[5px] border border-pronix-border bg-white px-3 py-2 font-aeonik-light text-sm text-pronix-ink not-italic shadow-sm md:text-base"
                        style={{
                            left: `${(activePoint.x / FINANCE_CHART_VIEWBOX.width) * 100}%`,
                            top: `${(activePoint.y / FINANCE_CHART_VIEWBOX.height) * 100}%`,
                            transform: "translate(-50%, calc(-100% - 12px))",
                        }}
                    >
                        {formatTooltip(activePoint.label, formatFinanceScaleLabel(activePoint.value))}
                    </div>
                ) : null}
            </div>

            <div
                className="hidden px-0 pb-4 font-aeonik-light text-sm text-pronix-ink-muted not-italic md:block lg:text-lg"
                data-node-id="475:1967"
            >
                {FINANCE_Y_SCALE_LABELS.join(" · ")}
            </div>

            <div
                className="flex flex-wrap justify-between gap-2 px-0 pb-4 font-aeonik-light text-xs text-pronix-ink-muted not-italic md:text-lg"
                data-node-id="475:1942"
            >
                {FINANCE_X_LABELS.map((month) => (
                    <span key={month}>{month}</span>
                ))}
            </div>
        </div>
    );
}

export default OpenProjectFinancePriceChart;
