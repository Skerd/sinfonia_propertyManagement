import {developersAssets} from "@propertyManagementModule/clients/client/public/developers/developersAssets.ts";
import {PublicLanguageProps} from "@propertyManagementModule/clients/client/public/shared/publicTypes.ts";
import {FIGMA_DEVELOPERS_FEATURE_CARD} from "@propertyManagementModule/clients/client/public/shared/layout/figmaDimensions.ts";
import {
    PUBLIC_CONTAINER,
    PUBLIC_GRID_CELL,
    PUBLIC_GRID_DEVELOPERS_FEATURES,
    PUBLIC_TITLE,
} from "@propertyManagementModule/clients/client/public/shared/layout/publicLayoutTokens.ts";

const {copyPadXRatio, imageRowRatio, copyRowRatio} = FIGMA_DEVELOPERS_FEATURE_CARD;

type FeatureCardProps = {
    titleKey: string;
    bodyKey: string;
    nodeId: string;
    imageSrc: string;
    resolveLanguageKey: (key: string) => string;
};

function FeatureCard({titleKey, bodyKey, nodeId, imageSrc, resolveLanguageKey}: FeatureCardProps) {
    return (
        <div
            className="relative flex w-full min-w-0 flex-col overflow-hidden rounded-[12px] border border-[rgba(24,24,24,0.2)] bg-white aspect-[783/670] @container"
            data-node-id={nodeId}
        >
            <div
                className="relative min-h-0 w-full overflow-hidden rounded-t-[12px] border-b border-[rgba(24,24,24,0.2)] bg-[#f9f9f9]"
                style={{flex: `${imageRowRatio} 0 0`}}
            >
                <img alt="" aria-hidden className="absolute inset-0 size-full object-contain" src={imageSrc} />
            </div>
            <div
                className="flex min-h-0 flex-col justify-center gap-3 pt-4"
                style={{
                    flex: `${copyRowRatio} 0 0`,
                    paddingLeft: `${copyPadXRatio * 100}%`,
                    paddingRight: `${copyPadXRatio * 100}%`,
                    paddingBottom: `${copyPadXRatio * 100}%`,
                }}
            >
                <p className="cursor-default font-aeonik-medium text-[20px] leading-[1.2] tracking-normal text-pronix-ink not-italic md:text-2xl lg:text-[24px]">
                    {resolveLanguageKey(titleKey)}
                </p>
                <p className="cursor-default font-aeonik-light text-[16px] leading-[1.2] tracking-normal text-pronix-ink-muted not-italic md:text-lg lg:text-[20px]">
                    {resolveLanguageKey(bodyKey)}
                </p>
            </div>
        </div>
    );
}

function DevelopersFeaturesSection({resolveLanguageKey}: PublicLanguageProps) {
    const featureCards: Array<{
        titleKey: string;
        bodyKey: string;
        nodeId: string;
        imageSrc: string;
    }> = [
        {
            titleKey: "feature1Title",
            bodyKey: "feature1Body",
            nodeId: "387:29594",
            imageSrc: developersAssets.featureSales,
        },
        {
            titleKey: "feature2Title",
            bodyKey: "feature2Body",
            nodeId: "387:29919",
            imageSrc: developersAssets.featureCrm,
        },
        {
            titleKey: "feature3Title",
            bodyKey: "feature3Body",
            nodeId: "387:30267",
            imageSrc: developersAssets.featureFinance,
        },
        {
            titleKey: "feature4Title",
            bodyKey: "feature4Body",
            nodeId: "387:30542",
            imageSrc: developersAssets.feature3d,
        },
        {
            titleKey: "feature5Title",
            bodyKey: "feature5Body",
            nodeId: "387:30806",
            imageSrc: developersAssets.featureData,
        },
        {
            titleKey: "feature6Title",
            bodyKey: "feature6Body",
            nodeId: "387:31015",
            imageSrc: developersAssets.featureConstruction,
        },
    ];

    return (
        <div className={`${PUBLIC_CONTAINER} relative flex w-full flex-col items-start gap-8 md:items-center md:gap-11`} data-node-id="388:1265">
            <div className="w-full text-left text-pronix-ink not-italic md:text-center" data-node-id="388:1259">
                <h2
                    className={`${PUBLIC_TITLE} !text-[40px] !leading-[1.2] md:!text-5xl lg:!text-[56px]`}
                    data-node-id="388:1262"
                >
                    {resolveLanguageKey("featuresTitle")}
                </h2>
                <p className="mt-3 max-w-3xl cursor-default font-aeonik-light text-[18px] leading-[1.2] tracking-normal text-pronix-ink not-italic md:mx-auto md:text-2xl md:leading-[1.4] lg:text-[24px]" data-node-id="388:1263">
                    {resolveLanguageKey("featuresSubtitle")}
                </p>
            </div>
            <div className="flex w-full flex-col gap-8 lg:gap-10" data-node-id="387:29592">
                {[0, 2, 4].map((rowStart) => (
                    <div key={rowStart} className={PUBLIC_GRID_DEVELOPERS_FEATURES} data-node-id={rowStart === 0 ? "387:29593" : rowStart === 2 ? "387:30266" : "387:30805"}>
                        {featureCards.slice(rowStart, rowStart + 2).map((card) => (
                            <div key={card.nodeId} className={PUBLIC_GRID_CELL}>
                                <FeatureCard {...card} resolveLanguageKey={resolveLanguageKey} />
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default DevelopersFeaturesSection;
