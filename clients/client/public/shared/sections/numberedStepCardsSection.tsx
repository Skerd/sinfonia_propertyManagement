import {FIGMA_NUMBERED_STEP_CARD} from "@propertyManagementModule/clients/client/public/shared/layout/figmaDimensions.ts";
import {
    PUBLIC_GRID_CELL,
} from "@propertyManagementModule/clients/client/public/shared/layout/publicLayoutTokens.ts";
import {PublicSnapCarousel} from "@propertyManagementModule/clients/client/public/shared/sections/publicSnapCarousel.tsx";

const {
    numberTopRatio,
    numberFontCqwCap,
    contentTopRatio,
    contentWidthRatio,
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
            className="group relative aspect-[386.75/535] w-full min-w-0 cursor-default overflow-hidden rounded-[5px] border border-[rgba(24,24,24,0.2)] bg-white transition-[background-color,border-color] duration-500 hover:border-[rgba(24,24,24,0.1)] hover:bg-pronix-blue @container"
            data-node-id={nodeId}
        >
            <p
                className="pointer-events-none absolute z-0 whitespace-nowrap font-aeonik-light not-italic leading-[1.2] text-[rgba(24,24,24,0.1)] transition-colors duration-150 ease-in group-hover:text-white"
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
                <p className="w-full min-w-0 font-aeonik-medium text-[24px] not-italic leading-[1.2] text-pronix-ink transition-colors duration-500 group-hover:text-white">
                    {title}
                </p>
                <p className="w-full min-w-0 font-aeonik-light text-[18px] not-italic leading-none tracking-normal text-pronix-ink-muted transition-colors duration-500 group-hover:text-white/80">
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

export function NumberedStepCardsRow({cards, rowNodeId}: {cards: NumberedStepCardProps[]; rowNodeId: string}) {
    return (
        <PublicSnapCarousel
            rowNodeId={rowNodeId}
            scrollerClassName="hide-scrollbar flex snap-x snap-mandatory gap-0 overflow-x-auto overflow-y-hidden overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:grid md:snap-none md:grid-cols-2 md:gap-8 md:overflow-visible xl:grid-cols-4"
            itemClassName={`${PUBLIC_GRID_CELL} max-md:w-full max-md:shrink-0 max-md:snap-start`}
        >
            {cards.map((card) => (
                <NumberedStepCard key={card.nodeId} {...card} />
            ))}
        </PublicSnapCarousel>
    );
}

export function NumberedStepCardsSection({title, cards, sectionNodeId, titleNodeId, rowNodeId}: NumberedStepCardsSectionProps) {
    return (
        <div className="relative min-w-0 w-full overflow-x-hidden" data-node-id={sectionNodeId}>
            <p className="mb-11 text-left font-aeonik-medium text-[40px] leading-[1.2] tracking-normal text-pronix-ink not-italic md:text-center md:text-5xl lg:text-[56px]" data-node-id={titleNodeId}>
                {title}
            </p>
            <NumberedStepCardsRow cards={cards} rowNodeId={rowNodeId} />
        </div>
    );
}
