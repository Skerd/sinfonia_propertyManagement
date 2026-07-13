import {figmaNumberedStepLeftRatio} from "@propertyManagementModule/clients/client/public/shared/layout/figmaDimensions.ts";
import {NumberedStepCard} from "@propertyManagementModule/clients/client/public/shared/sections/numberedStepCardsSection.tsx";
import {
    PUBLIC_GRID_CELL,
    PUBLIC_GRID_NUMBERED_STEPS,
    PUBLIC_TITLE_FIGMA,
} from "@propertyManagementModule/clients/client/public/shared/layout/publicLayoutTokens.ts";

const CAPABILITY_CARDS = [
    {
        nodeId: "142:1026",
        number: "01",
        numberLeftPx: -68,
        titleLeftPx: 24,
        title: "Choose how you want in",
        body: "Browse properties across Albania and pick the entry that fits your capital and your timeline. Buy a unit outright. Co-own a share with other investors. Or, from Q3 2026, hold a tokenized stake in the same underlying structure.",
    },
    {
        nodeId: "142:1033",
        number: "02",
        numberLeftPx: -67.75,
        titleLeftPx: 24.25,
        title: "We structure the ownership",
        body: "Every property sits inside a dedicated SPV — a standalone legal entity that holds the title. Your name, or your fractional claim, is recorded with the Albanian land registry. Not a nominee arrangement, not an off-register IOU. Real, registered ownership.",
    },
    {
        nodeId: "142:1044",
        number: "03",
        numberLeftPx: -67.5,
        titleLeftPx: 24.5,
        title: "The property earns",
        body: "Units are leased and managed. Rent flows into the SPV, expenses are paid, and net yield is distributed to owners on a quarterly schedule — whether you own the whole building or a single share.",
    },
    {
        nodeId: "142:1055",
        number: "04",
        numberLeftPx: -68.25,
        titleLeftPx: 23.75,
        title: "Exit when you're ready",
        body: "Sell the full property, trade your share on our secondary marketplace, or hold for appreciation. The structure doesn't lock you in — the terms you signed for do.",
    },
] as const;

function CapabilitiesSection() {
    return (
        <div className="relative min-w-0 w-full overflow-x-hidden" data-node-id="80:3907">
            <h2 className={`mb-11 text-center ${PUBLIC_TITLE_FIGMA}`} data-node-id="80:3908">
                Everything you can do on Pronix
            </h2>
            <div className={PUBLIC_GRID_NUMBERED_STEPS} data-node-id="80:3913">
                {CAPABILITY_CARDS.map((card) => (
                    <div key={card.nodeId} className={PUBLIC_GRID_CELL}>
                        <NumberedStepCard
                            nodeId={card.nodeId}
                            number={card.number}
                            numberLeftRatio={figmaNumberedStepLeftRatio(card.numberLeftPx)}
                            titleLeftRatio={figmaNumberedStepLeftRatio(card.titleLeftPx)}
                            title={card.title}
                            body={card.body}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default CapabilitiesSection;
