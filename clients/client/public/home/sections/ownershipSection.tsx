import {figmaAssets} from "@propertyManagementModule/clients/client/public/shared/figmaAssets.ts";
import {
    PUBLIC_GRID_CELL,
    PUBLIC_GRID_SALES,
    PUBLIC_SUBTITLE,
    PUBLIC_TITLE_FIGMA,
} from "@propertyManagementModule/clients/client/public/shared/layout/publicLayoutTokens.ts";
import OwnershipInteractiveCard, {
    type OwnershipCardContent,
} from "@propertyManagementModule/clients/client/public/shared/sections/ownershipInteractiveCard.tsx";

const OWNERSHIP_CARDS: OwnershipCardContent[] = [
    {
        nodeId: "142:764",
        layoutVariant: "1",
        image: figmaAssets.ownership1,
        imageCrop: "default" as const,
        title: "Buy a property",
        body: "Purchase an apartment, villa, or commercial unit outright. Standard sale, standard title, full control — no platform in between once the deal closes.",
        includedLabel: "What's included:",
        checklist: [
            "Full legal title in your name",
            "Digital contracts and reservation in minutes",
            "0% buyer commission",
            "Full access to floor plans and unit documentation",
            "Direct line to the developer",
            "Keys at completion",
        ],
        ctaLabel: "Browse properties",
    },
    {
        nodeId: "142:801",
        layoutVariant: "2",
        image: figmaAssets.ownership2,
        imageCrop: "coown" as const,
        title: "Co-own ",
        body: "Fund 40% of your share. An SPV covers the remaining 60% through a mortgage. Your ownership is recorded with the Albanian land registry.",
        includedLabel: "What's included:",
        checklist: [
            "Legal co-ownership through a dedicated SPV",
            "Your share recorded with the land registry",
            "40% equity / 60% mortgage structure",
            "Quarterly rent distribution",
            "Professional property management",
        ],
        ctaLabel: "Browse properties",
    },
    {
        nodeId: "142:837",
        layoutVariant: "3",
        image: figmaAssets.ownership3,
        imageCrop: "default" as const,
        title: "Tokenize",
        body: "A tokenized version of the same co-ownership structure — smaller entry points, faster secondary trades, identical legal backing. Launching Q3 2026.",
        includedLabel: "What's included:",
        checklist: [
            "Same SPV and land registry structure as co-ownership",
            "Lower entry point",
            "24/7 secondary trading",
            "Digital asset wallet and distribution",
            "Regulated under [framework, to confirm]",
        ],
        ctaLabel: "Learn more",
    },
];

function OwnershipSection() {
    return (
        <div className="relative min-w-0 w-full overflow-hidden bg-[#181818]" data-node-id="80:1918">
            <video
                autoPlay
                loop
                muted
                playsInline
                aria-hidden
                className="pointer-events-none absolute inset-0 h-full w-full object-cover"
                src={figmaAssets.ownershipBgVideo}
                data-node-id="94:332"
            />
            <img
                alt=""
                aria-hidden
                className="pointer-events-none absolute inset-0 h-full w-full object-cover mix-blend-soft-light opacity-80"
                src={figmaAssets.ownershipOverlay}
                data-node-id="150:1258"
            />
            <div
                className="pointer-events-none absolute inset-0 bg-[rgba(2,71,254,0.2)] mix-blend-soft-light"
                data-node-id="150:1255"
            />
            <div className="relative z-10 min-w-0 w-full overflow-x-hidden px-4 py-16 sm:px-6 lg:px-[52px] lg:py-24" data-node-id="94:349">
                <div className="mx-auto flex w-full min-w-0 max-w-[1728px] flex-col items-center gap-8 lg:gap-11">
                    <div
                        className="flex flex-col items-center gap-2 text-center text-white not-italic leading-[1.2]"
                        data-node-id="94:350"
                    >
                        <p className={`${PUBLIC_TITLE_FIGMA} text-white`}>Three ways to own </p>
                        <p className={`${PUBLIC_SUBTITLE} max-w-[824px] text-white/90`}>
                            Full property, a fractional share, or — soon — a digital stake.{" "}
                        </p>
                    </div>
                    <div className={`w-full min-w-0 ${PUBLIC_GRID_SALES}`} data-node-id="94:353">
                        {OWNERSHIP_CARDS.map((card) => (
                            <div key={card.nodeId} className={PUBLIC_GRID_CELL}>
                                <OwnershipInteractiveCard
                                    card={card}
                                    checkCircle={figmaAssets.checkCircle}
                                    variant="dark"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default OwnershipSection;
