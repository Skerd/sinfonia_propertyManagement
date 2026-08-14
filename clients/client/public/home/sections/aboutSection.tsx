import {useMemo, useRef, useState} from "react";
import {figmaAssets} from "@propertyManagementModule/clients/client/public/shared/figmaAssets.ts";
import {FIGMA_STAT_CARD, figmaImageCropStyle, FIGMA_IMAGE_CROPS} from "@propertyManagementModule/clients/client/public/shared/layout/figmaDimensions.ts";
import type {
    MarketingStatsResponse,
    PublicLanguageProps,
} from "@propertyManagementModule/clients/client/public/shared/publicTypes.ts";
import {fillLanguageTemplate} from "@propertyManagementModule/clients/client/public/shared/publicTypes.ts";
import type {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";

type StatCardData = {
    number: string;
    label: string;
    hoverText: string;
    nodeId: string;
};

const STAT_CARD_KEYS = [
    {
        nodeId: "I142:1192;142:1073",
        labelKey: "statProjectsLabel",
        hoverKey: "statProjectsHover",
    },
    {
        nodeId: "I142:1192;142:1160",
        labelKey: "statUnitsLabel",
        hoverKey: "statUnitsHover",
    },
    {
        nodeId: "I142:1192;142:1082",
        labelKey: "statValueLabel",
        hoverKey: "statValueHover",
    },
] as const;

const {
    numberFontCqwCap,
    labelFontCqwCap,
    logoLeftRatio,
    logoTopRatio,
    logoWidthRatio,
    logoHeightRatio,
    statBlockLeftRatio,
    statBlockTopRatio,
} = FIGMA_STAT_CARD;

const STAT_BLOCK_EXPANDED_LEFT_RATIO = 23 / FIGMA_STAT_CARD.defaultWidth;
const STAT_BLOCK_EXPANDED_TOP_RATIO = 30 / FIGMA_STAT_CARD.height;
const STAT_ROW_GROW_TOTAL = FIGMA_STAT_CARD.expandedWidth + FIGMA_STAT_CARD.collapsedWidth * 2;
const HOVER_TEXT_WIDTH_ROW_RATIO =
    (FIGMA_STAT_CARD.hoverTextWidthRatio * FIGMA_STAT_CARD.defaultWidth) / STAT_ROW_GROW_TOTAL;
const HOVER_TEXT_LEFT_ROW_RATIO = 23 / STAT_ROW_GROW_TOTAL;

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

function buildStatCards(
    stats: MarketingStatsResponse | null | undefined,
    loading: boolean,
    resolveLanguageKey: PublicLanguageProps["resolveLanguageKey"],
): StatCardData[] {
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

    return STAT_CARD_KEYS.map((meta, index) => ({
        nodeId: meta.nodeId,
        label: String(resolveLanguageKey(meta.labelKey)),
        hoverText: String(resolveLanguageKey(meta.hoverKey)),
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
    const touchStart = useRef<{x: number; y: number} | null>(null);

    return (
        <div
            className={`group relative w-full min-w-0 cursor-default select-none overflow-hidden rounded-[5px] border border-[rgba(24,24,24,0.2)] transition-[background-color,filter] duration-500 max-md:aspect-[525/515] md:h-full ${
                isExpanded ? "bg-[#0247fe]" : "bg-white"
            }`}
            data-node-id={card.nodeId}
            onPointerEnter={(event) => {
                if (event.pointerType === "mouse") {
                    onHover();
                }
            }}
            onPointerLeave={(event) => {
                if (event.pointerType === "mouse") {
                    onLeave();
                }
            }}
            onPointerDown={(event) => {
                if (event.pointerType === "mouse") {
                    return;
                }
                touchStart.current = {x: event.clientX, y: event.clientY};
            }}
            onPointerUp={(event) => {
                if (event.pointerType === "mouse") {
                    return;
                }
                const start = touchStart.current;
                touchStart.current = null;
                if (!start) {
                    return;
                }
                if (Math.abs(event.clientX - start.x) > 10 || Math.abs(event.clientY - start.y) > 10) {
                    return;
                }
                onHover();
            }}
        >
            <div className="@container pointer-events-none absolute inset-0">
            <div
                className="absolute flex flex-col items-start not-italic leading-[1.2] transition-all duration-500"
                style={{
                    left: isExpanded ? `${STAT_BLOCK_EXPANDED_LEFT_RATIO * 100}%` : `${statBlockLeftRatio * 100}%`,
                    top: isExpanded ? `${STAT_BLOCK_EXPANDED_TOP_RATIO * 100}%` : `${statBlockTopRatio * 100}%`,
                }}
            >
                <p
                    className={`font-aeonik-medium whitespace-nowrap ${isExpanded ? "text-white" : "text-pronix-ink"}`}
                    style={{fontSize: `min(${isExpanded ? 18 : numberFontCqwCap}cqw, ${isExpanded ? 96 : 64}px)`}}
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
                    className={`absolute max-w-none transition-[filter] duration-500 ${
                        isExpanded ? "brightness-0 invert" : ""
                    }`}
                    src={figmaAssets.aboutLogo}
                    style={figmaImageCropStyle(FIGMA_IMAGE_CROPS.aboutHeroStrip)}
                />
            </div>
            </div>

            <div
                className="pointer-events-none absolute inset-x-0 overflow-hidden max-md:top-auto max-md:bottom-[6%] max-md:max-h-[55%] max-md:flex max-md:items-end md:top-auto md:bottom-[5.83%] md:max-h-none"
            >
                <p
                    className="font-aeonik-medium leading-[1.2] text-white not-italic max-md:ml-4 max-md:w-[calc(100%-2rem)] max-md:text-[14px] max-md:leading-[1.25] md:text-[24px] md:leading-[1.2] md:w-[var(--stat-hover-w)] md:ml-[var(--stat-hover-ml)]"
                    style={{
                        ["--stat-hover-w" as string]: `calc((100cqw - ${FIGMA_STAT_CARD.gap * 2}px) * ${HOVER_TEXT_WIDTH_ROW_RATIO})`,
                        ["--stat-hover-ml" as string]: `calc((100cqw - ${FIGMA_STAT_CARD.gap * 2}px) * ${HOVER_TEXT_LEFT_ROW_RATIO})`,
                        transform: isExpanded ? "translateX(0)" : "translateX(-110%)",
                        transition: "transform 500ms ease-in-out",
                    }}
                >
                    {card.hoverText}
                </p>
            </div>
        </div>
    );
}

type AboutSectionProps = Pick<WithAxiosType<MarketingStatsResponse>, "data" | "loading"> &
    Pick<PublicLanguageProps, "resolveLanguageKey">;

function AboutSection({data, loading, resolveLanguageKey}: AboutSectionProps) {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const statCards = useMemo(
        () => buildStatCards(data, loading, resolveLanguageKey),
        [data, loading, resolveLanguageKey],
    );

    const proseValue = formatCompactMagnitude(data?.totalValue ?? 0, {
        currency: true,
        symbol: data?.valueCurrency?.symbol,
        abbreviation: data?.valueCurrency?.abbreviation,
    });
    const proseProjects = formatCompactMagnitude(data?.totalProjects ?? 0);
    const proseCoOwners = formatCompactMagnitude(data?.totalCoOwners ?? 0);
    const aboutPrimary = fillLanguageTemplate(String(resolveLanguageKey("aboutProsePrimary")), {
        value: proseValue,
        projects: proseProjects,
        coOwners: proseCoOwners,
    });
    const aboutMuted = String(resolveLanguageKey("aboutProseMuted"));

    return (
        <div className="relative min-w-0 w-full md:overflow-x-clip" data-node-id="142:1209">
            <div className="relative min-w-0 w-full">
                <div
                    aria-hidden
                    className="pointer-events-none invisible hidden md:block"
                    style={{
                        width: `calc((100% - ${FIGMA_STAT_CARD.gap * 2}px) / 3)`,
                        aspectRatio: `${FIGMA_STAT_CARD.defaultWidth} / ${FIGMA_STAT_CARD.height}`,
                    }}
                />
                <div
                    className="@container hide-scrollbar flex min-w-0 snap-x snap-mandatory flex-row items-stretch gap-4 overflow-x-auto overflow-y-hidden overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:absolute md:inset-0 md:snap-none md:gap-8 md:overflow-visible"
                    data-node-id="142:1192"
                    data-name="Component 16"
                >
                    {statCards.map((card, index) => (
                        <div
                            key={card.nodeId}
                            className={`min-h-0 min-w-0 max-md:w-[80%] max-md:shrink-0 max-md:snap-start md:h-full md:w-full md:basis-0 md:transition-[flex-grow] md:duration-500 md:ease-in-out ${
                                hoveredIndex === index
                                    ? "md:grow-[869]"
                                    : hoveredIndex !== null
                                      ? "md:grow-[353]"
                                      : "md:grow-[525]"
                            }`}
                        >
                            <StatCard
                                card={card}
                                isExpanded={hoveredIndex === index}
                                onHover={() => setHoveredIndex(index)}
                                onLeave={() => setHoveredIndex(null)}
                            />
                        </div>
                    ))}
                </div>
            </div>
            <p
                className="mt-8 ml-auto min-w-0 w-full cursor-default break-words font-aeonik-medium not-italic leading-[1.1] text-3xl sm:text-4xl md:mt-10 md:w-2/3 md:text-5xl lg:text-[64px]"
                data-node-id="87:158"
                style={{fontWeight: 500}}
            >
                <span className="cursor-default text-pronix-ink" style={{fontWeight: 500}}>
                    {aboutPrimary}
                </span>
                <span className="cursor-default text-pronix-ink-faded" style={{fontWeight: 500}}>
                    {aboutMuted}
                </span>
            </p>
        </div>
    );
}

export default AboutSection;
