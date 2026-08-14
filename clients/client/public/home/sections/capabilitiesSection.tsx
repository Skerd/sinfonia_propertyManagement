import {figmaNumberedStepLeftRatio} from "@propertyManagementModule/clients/client/public/shared/layout/figmaDimensions.ts";
import {NumberedStepCardsRow} from "@propertyManagementModule/clients/client/public/shared/sections/numberedStepCardsSection.tsx";
import type {PublicLanguageProps} from "@propertyManagementModule/clients/client/public/shared/publicTypes.ts";

const CAPABILITY_CARDS = [
    {
        nodeId: "142:1026",
        number: "01",
        numberLeftPx: -68,
        titleLeftPx: 24,
        titleKey: "cap1Title",
        bodyKey: "cap1Body",
    },
    {
        nodeId: "142:1033",
        number: "02",
        numberLeftPx: -67.75,
        titleLeftPx: 24.25,
        titleKey: "cap2Title",
        bodyKey: "cap2Body",
    },
    {
        nodeId: "142:1044",
        number: "03",
        numberLeftPx: -67.5,
        titleLeftPx: 24.5,
        titleKey: "cap3Title",
        bodyKey: "cap3Body",
    },
    {
        nodeId: "142:1055",
        number: "04",
        numberLeftPx: -68.25,
        titleLeftPx: 23.75,
        titleKey: "cap4Title",
        bodyKey: "cap4Body",
    },
] as const;

type CapabilitiesSectionProps = Pick<PublicLanguageProps, "resolveLanguageKey">;

function CapabilitiesSection({resolveLanguageKey}: CapabilitiesSectionProps) {
    const cards = CAPABILITY_CARDS.map((card) => ({
        nodeId: card.nodeId,
        number: card.number,
        numberLeftRatio: figmaNumberedStepLeftRatio(card.numberLeftPx),
        titleLeftRatio: figmaNumberedStepLeftRatio(card.titleLeftPx),
        title: String(resolveLanguageKey(card.titleKey)),
        body: String(resolveLanguageKey(card.bodyKey)),
    }));

    return (
        <div className="relative min-w-0 w-full overflow-x-hidden" data-node-id="80:3907">
            <h2
                className="mb-11 text-left font-aeonik-medium text-[40px] font-medium leading-[1.2] tracking-normal text-pronix-ink not-italic md:text-center md:text-5xl lg:text-[56px]"
                data-node-id="80:3908"
                style={{fontWeight: 500}}
            >
                {String(resolveLanguageKey("capabilitiesTitle"))}
            </h2>
            <NumberedStepCardsRow rowNodeId="80:3913" cards={cards} />
        </div>
    );
}

export default CapabilitiesSection;
