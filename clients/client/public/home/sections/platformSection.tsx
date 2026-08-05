import {useAiChat} from "@propertyManagementModule/clients/client/public/shared/aiChat/aiChatContext.tsx";
import {FIGMA_PLATFORM_SECTION} from "@propertyManagementModule/clients/client/public/shared/layout/figmaDimensions.ts";
import {PUBLIC_BODY, PUBLIC_CARD_TITLE, PUBLIC_TITLE} from "@propertyManagementModule/clients/client/public/shared/layout/publicLayoutTokens.ts";
import AiOrbVisual from "@propertyManagementModule/clients/client/public/shared/sections/aiOrbVisual.tsx";
import type {CSSProperties} from "react";

const {orbWidthRatio, orbRemCap, descriptionRemCap} = FIGMA_PLATFORM_SECTION;
const ORB_SLOT = `min(${orbWidthRatio * 100}%, ${orbRemCap}rem)`;
const DESC_MAX_WIDTH = `min(100%, ${descriptionRemCap}rem)`;

type PlatformFeature = (typeof PLATFORM_FEATURES)[number];

function FeatureHead({index, title, nodeId}: Pick<PlatformFeature, "index" | "title" | "nodeId">) {
    return (
        <div className="relative flex min-w-0 cursor-default items-start gap-4 md:gap-7" data-node-id={nodeId}>
            <p className="font-aeonik-medium min-w-[2rem] shrink-0 cursor-default whitespace-nowrap text-base not-italic leading-[1.2] text-pronix-ink md:text-xl">
                {index}
            </p>
            <p className={`${PUBLIC_CARD_TITLE} relative min-w-0`}>
                {title}
            </p>
        </div>
    );
}

function FeatureDescription({description}: Pick<PlatformFeature, "description">) {
    return (
        <p
            className={`font-aeonik-light relative min-w-0 not-italic leading-[1.2] text-pronix-ink md:justify-self-end ${PUBLIC_BODY}`}
            style={{maxWidth: DESC_MAX_WIDTH}}
        >
            {description}
        </p>
    );
}

const PLATFORM_FEATURES = [
    {
        nodeId: "150:1410",
        index: "01/",
        title: "AI property advisor",
        description:
            "Tell it your budget, timeline, and goals — get matched properties with projected returns, instantly.",
    },
    {
        nodeId: "150:1416",
        index: "02/",
        title: "Live deal intelligence",
        description:
            "Ask anything about a property, the market, or how co-ownership works. Real answers, drawn from real deal data.",
    },
    {
        nodeId: "150:1422",
        index: "03/",
        title: "Always on, always learning",
        description:
            "The platform improves with every question, every transaction, every new property listed.",
    },
    {
        nodeId: "156:1479",
        index: "04/",
        title: " Multilingual by default",
        description: "Ask in Albanian, English, or Italian. The platform answers in the language you use.",
    },
] as const;

type PlatformOrbButtonProps = {
    onClick: () => void;
    className?: string;
};

function PlatformOrbButton({onClick, className}: PlatformOrbButtonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-label="Open AI assistant"
            data-node-id="150:1469"
            className={`aspect-square w-[min(72vw,100%)] max-w-full shrink-0 cursor-pointer border-0 bg-transparent p-0 md:w-[min(100cqw,100cqh)] ${className ?? ""}`}
        >
            <AiOrbVisual variant="platform" className="size-full" />
        </button>
    );
}

function PlatformSection() {
    const {open} = useAiChat();

    return (
        <div className="relative min-w-0 w-full overflow-x-clip overflow-y-clip">
            <p
                className={`mx-auto mb-6 max-w-3xl text-center md:mb-8 lg:mb-10 ${PUBLIC_TITLE}`}
                data-node-id="94:609"
            >
                Built on a platform that does the work for you.
            </p>

            <div
                className="grid w-full min-w-0 grid-cols-1 gap-y-8 md:grid-cols-[minmax(0,1fr)_var(--platform-orb-slot)_minmax(0,1fr)] md:grid-rows-[repeat(4,minmax(0,auto))] md:items-center md:gap-x-6 md:gap-y-10 lg:gap-y-11"
                data-node-id="150:1409"
                style={{"--platform-orb-slot": ORB_SLOT} as CSSProperties}
            >
                {PLATFORM_FEATURES.map((feature, index) => (
                    <div key={feature.nodeId} className="contents">
                        <div className="flex min-w-0 flex-col gap-3 md:hidden">
                            <FeatureHead index={feature.index} title={feature.title} nodeId={feature.nodeId} />
                            <FeatureDescription description={feature.description} />
                        </div>

                        <div className="hidden min-w-0 md:col-start-1 md:block" style={{gridRow: index + 1}}>
                            <FeatureHead index={feature.index} title={feature.title} nodeId={feature.nodeId} />
                        </div>
                        <div className="hidden min-w-0 md:col-start-3 md:block md:justify-self-end" style={{gridRow: index + 1}}>
                            <FeatureDescription description={feature.description} />
                        </div>

                        {index === 1 && (
                            <div className="flex justify-center md:hidden">
                                <PlatformOrbButton onClick={open} />
                            </div>
                        )}
                    </div>
                ))}

                <div className="@container hidden min-h-0 min-w-0 items-center justify-center md:col-start-2 md:row-start-1 md:row-span-4 md:flex">
                    <PlatformOrbButton onClick={open} />
                </div>
            </div>
        </div>
    );
}

export default PlatformSection;
