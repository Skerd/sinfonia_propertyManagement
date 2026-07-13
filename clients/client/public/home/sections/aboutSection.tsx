import {useState} from "react";
import {figmaAssets} from "@propertyManagementModule/clients/client/public/shared/figmaAssets.ts";
import {FIGMA_STAT_CARD, figmaImageCropStyle, FIGMA_IMAGE_CROPS} from "@propertyManagementModule/clients/client/public/shared/layout/figmaDimensions.ts";
import {
    PUBLIC_GRID_CELL,
    PUBLIC_TITLE_FIGMA,
} from "@propertyManagementModule/clients/client/public/shared/layout/publicLayoutTokens.ts";

type StatCardData = {
    number: string;
    label: string;
    hoverText: string;
    nodeId: string;
};

const STAT_CARDS: StatCardData[] = [
    {
        nodeId: "I142:1192;142:1073",
        number: "50+",
        label: "Total projects",
        hoverText:
            "Across Albania's growing development pipeline — apartments, villas, and commercial units — every property structured under the same SPV framework.",
    },
    {
        nodeId: "I142:1192;142:1160",
        number: "2500+",
        label: "Total units",
        hoverText:
            "Individual residential and commercial units available for full purchase or co-ownership, with detailed floor plans, projected yields, and unit-level documentation on every listing.",
    },
    {
        nodeId: "I142:1192;142:1082",
        number: "500M$",
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
            className={`group relative aspect-[525/515] w-full min-w-0 overflow-hidden rounded-[5px] border border-[rgba(24,24,24,0.2)] transition-all duration-500 @container ${
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

function AboutSection() {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    return (
        <div className="relative min-w-0 w-full overflow-x-clip" data-node-id="142:1209">
            <div
                className="grid min-w-0 grid-cols-1 gap-8 md:grid-cols-3 md:[grid-template-columns:repeat(3,minmax(0,1fr))]"
                data-node-id="142:1192"
                data-name="Component 16"
            >
                {STAT_CARDS.map((card, index) => (
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
            <p className={`mt-14 min-w-0 max-w-full break-words ${PUBLIC_TITLE_FIGMA}`} data-node-id="87:158">
                <span className="text-pronix-ink leading-[1.1]">
                    {`Pronix is a real estate investment platform built for Albania. Since launch, we've structured over €X in property, across Y developments, on behalf of Z co-owners`}
                </span>
                <span className="text-pronix-ink-faded leading-[1.1]">
                    {` — with every share legally registered and quarterly rent paid without delay.`}
                </span>
            </p>
        </div>
    );
}

export default AboutSection;
