import {useMemo} from "react";
import {useAiChat} from "@propertyManagementModule/clients/client/public/shared/aiChat/aiChatContext.tsx";
import {FIGMA_PLATFORM_SECTION} from "@propertyManagementModule/clients/client/public/shared/layout/figmaDimensions.ts";
import {PUBLIC_CARD_TITLE} from "@propertyManagementModule/clients/client/public/shared/layout/publicLayoutTokens.ts";
import type {PublicLanguageProps} from "@propertyManagementModule/clients/client/public/shared/publicTypes.ts";
import AiOrbVisual from "@propertyManagementModule/clients/client/public/shared/sections/aiOrbVisual.tsx";
import type {CSSProperties} from "react";

const {orbWidthRatio, orbRemCap, descriptionRemCap} = FIGMA_PLATFORM_SECTION;
const ORB_SLOT = `min(${orbWidthRatio * 100}%, ${orbRemCap}rem)`;
const DESC_MAX_WIDTH = `min(100%, ${descriptionRemCap}rem)`;

type PlatformFeature = {
    nodeId: string;
    index: string;
    title: string;
    description: string;
};

function FeatureHead({index, title, nodeId}: Pick<PlatformFeature, "index" | "title" | "nodeId">) {
    return (
        <div className="relative flex min-w-0 cursor-default items-start gap-4 md:gap-7" data-node-id={nodeId}>
            <p className="font-aeonik-medium min-w-[2.75rem] shrink-0 cursor-default whitespace-nowrap text-[28px] not-italic leading-[1.2] tracking-normal text-pronix-ink md:min-w-[2rem] md:text-xl">
                {index}
            </p>
            <p className={`${PUBLIC_CARD_TITLE} relative min-w-0 max-md:text-[28px]`}>
                {title}
            </p>
        </div>
    );
}

function FeatureDescription({description}: Pick<PlatformFeature, "description">) {
    return (
        <p
            className="relative min-w-0 cursor-default font-aeonik-light text-[20.2px] not-italic leading-[1.2] tracking-normal text-pronix-ink md:text-lg lg:text-[20px]"
            style={{maxWidth: DESC_MAX_WIDTH}}
        >
            {description}
        </p>
    );
}

const PLATFORM_FEATURE_KEYS = [
    {nodeId: "150:1410", index: "01/", titleKey: "platform1Title", bodyKey: "platform1Body"},
    {nodeId: "150:1416", index: "02/", titleKey: "platform2Title", bodyKey: "platform2Body"},
    {nodeId: "150:1422", index: "03/", titleKey: "platform3Title", bodyKey: "platform3Body"},
    {nodeId: "156:1479", index: "04/", titleKey: "platform4Title", bodyKey: "platform4Body"},
] as const;

type PlatformOrbButtonProps = {
    onClick: () => void;
    className?: string;
    ariaLabel: string;
};

function PlatformOrbButton({onClick, className, ariaLabel}: PlatformOrbButtonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-label={ariaLabel}
            data-node-id="150:1469"
            className={`aspect-square w-[min(72vw,100%)] max-w-full shrink-0 cursor-pointer border-0 bg-transparent p-0 md:w-[min(100cqw,100cqh)] ${className ?? ""}`}
        >
            <AiOrbVisual variant="platform" className="size-full" />
        </button>
    );
}

type PlatformSectionProps = Pick<PublicLanguageProps, "resolveLanguageKey">;

function PlatformSection({resolveLanguageKey}: PlatformSectionProps) {
    const {open} = useAiChat();
    const t = (key: string) => String(resolveLanguageKey(key));
    const openAiLabel = t("platformOpenAi");

    const features = useMemo(
        () =>
            PLATFORM_FEATURE_KEYS.map((feature) => ({
                nodeId: feature.nodeId,
                index: feature.index,
                title: t(feature.titleKey),
                description: t(feature.bodyKey),
            })),
        [resolveLanguageKey],
    );

    return (
        <div className="relative min-w-0 w-full overflow-x-clip overflow-y-clip py-12 md:py-0">
            <p
                className="mb-2 max-w-3xl cursor-default text-left font-aeonik-medium text-[40px] not-italic leading-none tracking-normal text-pronix-ink md:mx-auto md:mb-3 md:text-center md:text-5xl lg:mb-4 lg:text-[56px]"
                data-node-id="94:609"
            >
                {t("platformTitle")}
            </p>

            <div className="mb-8 flex justify-center md:hidden">
                <PlatformOrbButton onClick={open} ariaLabel={openAiLabel} />
            </div>

            <div
                className="grid w-full min-w-0 grid-cols-1 gap-y-8 md:grid-cols-[minmax(0,1fr)_var(--platform-orb-slot)_minmax(0,1fr)] md:items-stretch md:gap-x-2 lg:gap-x-3"
                data-node-id="150:1409"
                style={{"--platform-orb-slot": ORB_SLOT} as CSSProperties}
            >
                {features.map((feature) => (
                    <div key={feature.nodeId} className="flex min-w-0 flex-col gap-3 md:hidden">
                        <FeatureHead index={feature.index} title={feature.title} nodeId={feature.nodeId} />
                        <FeatureDescription description={feature.description} />
                    </div>
                ))}

                <div className="hidden min-h-0 min-w-0 md:col-start-1 md:flex md:items-center md:justify-end">
                    <div className="flex h-[70%] w-max max-w-full flex-col justify-between">
                        {features.map((feature) => (
                            <FeatureHead
                                key={feature.nodeId}
                                index={feature.index}
                                title={feature.title}
                                nodeId={feature.nodeId}
                            />
                        ))}
                    </div>
                </div>

                <div className="@container hidden min-h-0 min-w-0 items-center justify-center md:col-start-2 md:flex">
                    <PlatformOrbButton onClick={open} ariaLabel={openAiLabel} />
                </div>

                <div className="hidden min-h-0 min-w-0 md:col-start-3 md:flex md:items-center md:justify-start">
                    <div className="flex h-[70%] w-max max-w-full flex-col justify-between">
                        {features.map((feature) => (
                            <FeatureDescription key={feature.nodeId} description={feature.description} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PlatformSection;
