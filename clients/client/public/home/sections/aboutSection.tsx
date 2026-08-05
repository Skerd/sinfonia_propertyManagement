import {useMemo, useState} from "react";
import {figmaAssets} from "@propertyManagementModule/clients/client/public/shared/figmaAssets.ts";
import {FIGMA_STAT_CARD, figmaImageCropStyle, FIGMA_IMAGE_CROPS} from "@propertyManagementModule/clients/client/public/shared/layout/figmaDimensions.ts";
import {
    PUBLIC_GRID_CELL,
    PUBLIC_TITLE_FIGMA,
} from "@propertyManagementModule/clients/client/public/shared/layout/publicLayoutTokens.ts";
import type {MarketingStatsResponse} from "@propertyManagementModule/clients/client/public/shared/publicTypes.ts";
import type {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";

type StatCardData = {
    number: string;
    label: string;
    hoverText: string;
    nodeId: string;
};

const STAT_CARD_META: Omit<StatCardData, "number">[] = [
    {
        nodeId: "I142:1192;142:1073",
        label: "Total projects",
        hoverText:
            "Across Albania's growing development pipeline — apartments, villas, and commercial units — every property structured under the same SPV framework.",
    },
    {
        nodeId: "I142:1192;142:1160",
        label: "Total units",
        hoverText:
            "Individual residential and commercial units available for full purchase or co-ownership, with detailed floor plans, projected yields, and unit-level documentation on every listing.",
    },
    {
        nodeId: "I142:1192;142:1082",
        label: "Total value",
        hoverText:
            "Combined market value of every property structured through Pronix — entry-level co-ownership shares and full developments alike, all routed through the same regulated SPV framework.",
    },
];

const {
    numberFontCqwCap,
    labelFontCqwCap,
    hoverTextFontCqwCap,
    logoLeftRatio,
    logoTopRatio,
    logoWidthRatio,
    logoHeightRatio,
    hoverTextLeftRatio,
    hoverTextTopRatio,
    statBlockLeftRatio,
    statBlockTopRatio,
} = FIGMA_STAT_CARD;

const STAT_BLOCK_EXPANDED_LEFT_RATIO = 23 / FIGMA_STAT_CARD.defaultWidth;
const STAT_BLOCK_EXPANDED_TOP_RATIO = 30 / FIGMA_STAT_CARD.height;

function currencyPrefix(symbol?: string, abbreviation?: string): string {
    return symbol?.trim() || (abbreviation ? `${abbreviation} ` : "€");
}

/** Marketing-style compact number: 55 → "55", 1200 → "1K+", 25709145 → "€26M". */
function formatCompactMagnitude(value: number, opts?: {currency?: boolean; symbol?: string; abbreviation?: string}): string {
    const prefix = opts?.currency ? currencyPrefix(opts.symbol, opts.abbreviation) : "";
    if (!Number.isFinite(value) || value <= 0) {
        return `${prefix}0`;
    }
    const abs = Math.abs(value);
    if (abs >= 1_000_000_000) {
        return `${prefix}${Math.round(abs / 1_000_000_000)}B`;
    }
    if (abs >= 1_000_000) {
        return `${prefix}${Math.round(abs / 1_000_000)}M`;
    }
    if (abs >= 1_000) {
        return `${prefix}${Math.round(abs / 1_000)}K${opts?.currency ? "" : "+"}`;
    }
    return `${prefix}${Math.round(abs)}`;
}

function buildStatCards(stats: MarketingStatsResponse | null | undefined, loading: boolean): StatCardData[] {
    const currency = stats?.valueCurrency;
    const numbers = loading && !stats
        ? ["—", "—", "—"]
        : [
            formatCompactMagnitude(stats?.totalProjects ?? 0),
            formatCompactMagnitude(stats?.totalUnits ?? 0),
            formatCompactMagnitude(stats?.totalValue ?? 0, {
                currency: true,
                symbol: currency?.symbol,
                abbreviation: currency?.abbreviation,
            }),
        ];

    return STAT_CARD_META.map((meta, index) => ({
        ...meta,
        number: numbers[index]!,
    }));
}

function StatCard({
    card,
    isExpanded,
    onHover,
    onLeave,
}: {
    card: StatCardData;
    isExpanded: boolean;
    onHover: () => void;
    onLeave: () => void;
}) {
    return (
        <div
            className={`group relative aspect-[525/515] w-full min-w-0 cursor-default select-none overflow-hidden rounded-[5px] border border-[rgba(24,24,24,0.2)] transition-all duration-500 @container ${
                isExpanded ? "bg-[#0247fe]" : "bg-white"
            }`}
            data-node-id={card.nodeId}
            onMouseEnter={onHover}
            onMouseLeave={onLeave}
        >
            <div
                className="absolute flex flex-col items-start not-italic leading-[1.2] transition-all duration-500"
                style={{
                    left: isExpanded ? `${STAT_BLOCK_EXPANDED_LEFT_RATIO * 100}%` : `${statBlockLeftRatio * 100}%`,
                    top: isExpanded ? `${STAT_BLOCK_EXPANDED_TOP_RATIO * 100}%` : `${statBlockTopRatio * 100}%`,
                }}
            >
                <p
                    className={`font-aeonik-medium whitespace-nowrap ${isExpanded ? "text-white" : "text-pronix-ink"}`}
                    style={{fontSize: `min(${numberFontCqwCap}cqw, 64px)`}}
                >
                    {card.number}
                </p>
                <p
                    className={`font-aeonik-medium whitespace-nowrap ${isExpanded ? "text-white" : "text-pronix-ink-muted"}`}
                    style={{fontSize: `min(${labelFontCqwCap}cqw, 44px)`}}
                >
                    {card.label}
                </p>
            </div>

            {isExpanded && (
                <p
                    className="absolute break-words font-aeonik-medium leading-[1.2] text-white not-italic"
                    style={{
                        left: `${hoverTextLeftRatio * 100}%`,
                        top: `${hoverTextTopRatio * 100}%`,
                        right: `${statBlockLeftRatio * 100}%`,
                        fontSize: `min(${hoverTextFontCqwCap}cqw, 24px)`,
                    }}
                >
                    {card.hoverText}
                </p>
            )}

            <div
                className="absolute overflow-hidden"
                style={{
                    left: `${logoLeftRatio * 100}%`,
                    top: `${logoTopRatio * 100}%`,
                    width: `${logoWidthRatio * 100}%`,
                    height: `${logoHeightRatio * 100}%`,
                }}
            >
                <img
                    alt=""
                    aria-hidden
                    className={`absolute max-w-none transition-[filter] duration-500 ${isExpanded ? "invert" : ""}`}
                    src={figmaAssets.aboutLogo}
                    style={figmaImageCropStyle(FIGMA_IMAGE_CROPS.aboutHeroStrip)}
                />
            </div>
        </div>
    );
}

type AboutSectionProps = Pick<WithAxiosType<MarketingStatsResponse>, "data" | "loading">;

function AboutSection({data, loading}: AboutSectionProps) {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const statCards = useMemo(() => buildStatCards(data, loading), [data, loading]);

    const proseValue = formatCompactMagnitude(data?.totalValue ?? 0, {
        currency: true,
        symbol: data?.valueCurrency?.symbol,
        abbreviation: data?.valueCurrency?.abbreviation,
    });
    const proseProjects = formatCompactMagnitude(data?.totalProjects ?? 0);
    const proseCoOwners = formatCompactMagnitude(data?.totalCoOwners ?? 0);

    return (
        <div className="relative min-w-0 w-full overflow-x-clip" data-node-id="142:1209">
            <div
                className="grid min-w-0 grid-cols-1 gap-8 md:grid-cols-3 md:[grid-template-columns:repeat(3,minmax(0,1fr))]"
                data-node-id="142:1192"
                data-name="Component 16"
            >
                {statCards.map((card, index) => (
                    <div key={card.nodeId} className={PUBLIC_GRID_CELL}>
                        <StatCard
                            card={card}
                            isExpanded={hoveredIndex === index}
                            onHover={() => setHoveredIndex(index)}
                            onLeave={() => setHoveredIndex(null)}
                        />
                    </div>
                ))}
            </div>
            <p className={`mt-8 min-w-0 max-w-full cursor-default break-words md:mt-10 ${PUBLIC_TITLE_FIGMA}`} data-node-id="87:158">
                <span className="cursor-default text-pronix-ink leading-[1.1]">
                    {`Pronix is a real estate investment platform built for Albania. Since launch, we've structured over ${proseValue} in property, across ${proseProjects} developments, on behalf of ${proseCoOwners} co-owners`}
                </span>
                <span className="cursor-default text-pronix-ink-faded leading-[1.1]">
                    {` — with every share legally registered and quarterly rent paid without delay.`}
                </span>
            </p>
        </div>
    );
}

export default AboutSection;
