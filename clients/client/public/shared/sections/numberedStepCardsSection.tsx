import {FIGMA_NUMBERED_STEP_CARD} from "@propertyManagementModule/clients/client/public/shared/layout/figmaDimensions.ts";
import {
    PUBLIC_GRID_CELL,
    PUBLIC_GRID_NUMBERED_STEPS,
    PUBLIC_TITLE_FIGMA,
} from "@propertyManagementModule/clients/client/public/shared/layout/publicLayoutTokens.ts";

const {
    numberTopRatio,
    numberFontCqwCap,
    contentTopRatio,
    contentWidthRatio,
    titleFontCqwCap,
    bodyFontCqwCap,
    contentGapCqhCap,
} = FIGMA_NUMBERED_STEP_CARD;

export type NumberedStepCardProps = {
    number: string;
    numberLeftRatio: number;
    titleLeftRatio: number;
    title: string;
    body: string;
    nodeId: string;
};

export function NumberedStepCard({number, numberLeftRatio, titleLeftRatio, title, body, nodeId}: NumberedStepCardProps) {
    return (
        <div
            className="group relative aspect-[386.75/535] w-full min-w-0 cursor-default overflow-hidden rounded-[5px] border border-[rgba(24,24,24,0.2)] bg-white transition-all duration-500 hover:border-[rgba(24,24,24,0.1)] hover:bg-pronix-blue @container"
            data-node-id={nodeId}
        >
            <p
                className="pointer-events-none absolute whitespace-nowrap font-aeonik-light not-italic leading-[1.2] text-[rgba(24,24,24,0.1)] transition-colors duration-500 group-hover:text-white/15"
                style={{
                    top: `${numberTopRatio * 100}%`,
                    left: `${numberLeftRatio * 100}%`,
                    fontSize: `min(${numberFontCqwCap}cqw, 331.156px)`,
                }}
                aria-hidden
            >
                {number}
            </p>
            <div
                className="absolute z-10 flex flex-col items-start not-italic"
                style={{
                    top: `${contentTopRatio * 100}%`,
                    left: `${titleLeftRatio * 100}%`,
                    width: `${contentWidthRatio * 100}%`,
                    gap: `min(${contentGapCqhCap}cqh, 12px)`,
                }}
            >
                <p
                    className="w-full min-w-0 font-aeonik-medium leading-[1.2] text-pronix-ink transition-colors duration-500 group-hover:text-white"
                    style={{fontSize: `min(${titleFontCqwCap}cqw, 24px)`}}
                >
                    {title}
                </p>
                <p
                    className="w-full min-w-0 font-aeonik-light leading-none text-pronix-ink-muted transition-colors duration-500 group-hover:text-white/80"
                    style={{fontSize: `min(${bodyFontCqwCap}cqw, 20px)`}}
                >
                    {body}
                </p>
            </div>
        </div>
    );
}

type NumberedStepCardsSectionProps = {
    title: string;
    cards: NumberedStepCardProps[];
    sectionNodeId: string;
    titleNodeId: string;
    rowNodeId: string;
};

export function NumberedStepCardsSection({title, cards, sectionNodeId, titleNodeId, rowNodeId}: NumberedStepCardsSectionProps) {
    return (
        <div className="relative min-w-0 w-full overflow-x-hidden" data-node-id={sectionNodeId}>
            <p className={`mb-11 text-center ${PUBLIC_TITLE_FIGMA}`} data-node-id={titleNodeId}>
                {title}
            </p>
            <div className={PUBLIC_GRID_NUMBERED_STEPS} data-node-id={rowNodeId}>
                {cards.map((card) => (
                    <div key={card.nodeId} className={PUBLIC_GRID_CELL}>
                        <NumberedStepCard {...card} />
                    </div>
                ))}
            </div>
        </div>
    );
}
