import {figmaNumberedStepLeftRatio} from "@propertyManagementModule/clients/client/public/shared/layout/figmaDimensions.ts";
import {NumberedStepCard} from "@propertyManagementModule/clients/client/public/shared/sections/numberedStepCardsSection.tsx";
import {
    PUBLIC_GRID_CELL,
    PUBLIC_GRID_NUMBERED_STEPS,
    PUBLIC_TITLE_FIGMA,
} from "@propertyManagementModule/clients/client/public/shared/layout/publicLayoutTokens.ts";
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
    return (
        <div className="relative min-w-0 w-full overflow-x-hidden" data-node-id="80:3907">
            <h2 className={`mb-11 text-center ${PUBLIC_TITLE_FIGMA}`} data-node-id="80:3908">
                {String(resolveLanguageKey("capabilitiesTitle"))}
            </h2>
            <div className={PUBLIC_GRID_NUMBERED_STEPS} data-node-id="80:3913">
                {CAPABILITY_CARDS.map((card) => (
                    <div key={card.nodeId} className={PUBLIC_GRID_CELL}>
                        <NumberedStepCard
                            nodeId={card.nodeId}
                            number={card.number}
                            numberLeftRatio={figmaNumberedStepLeftRatio(card.numberLeftPx)}
                            titleLeftRatio={figmaNumberedStepLeftRatio(card.titleLeftPx)}
                            title={String(resolveLanguageKey(card.titleKey))}
                            body={String(resolveLanguageKey(card.bodyKey))}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default CapabilitiesSection;
