import {PublicLanguageProps} from "@propertyManagementModule/clients/client/public/shared/publicTypes.ts";
import {
    PUBLIC_BODY,
    PUBLIC_GRID_CELL,
    PUBLIC_GRID_SALES,
    PUBLIC_SUBTITLE,
    PUBLIC_TITLE,
} from "@propertyManagementModule/clients/client/public/shared/layout/publicLayoutTokens.ts";

type OwnershipCardAssets = {
    cardBuy: string;
    cardCoown: string;
    cardToken: string;
    checkCircle: string;
};

type OwnershipCardsSectionProps = PublicLanguageProps & {
    assets: OwnershipCardAssets;
    nodeId?: string;
};

const CARDS = [
    {imageKey: "cardBuy" as const, titleKey: "cardBuyTitle", bodyKey: "cardBuyBody", ctaKey: "cardBuyCta"},
    {imageKey: "cardCoown" as const, titleKey: "cardCoownTitle", bodyKey: "cardCoownBody", ctaKey: "cardCoownCta"},
    {imageKey: "cardToken" as const, titleKey: "cardTokenTitle", bodyKey: "cardTokenBody", ctaKey: "cardTokenCta"},
] as const;

const IMAGE_ASPECT_CLASS = "aspect-[344/213]";

function OwnershipCardsSection({resolveLanguageKey, assets, nodeId = "368:4869"}: OwnershipCardsSectionProps) {
    return (
        <div className="relative min-w-0 w-full py-12 md:py-16" data-node-id={nodeId}>
            <div className="text-center">
                <h2 className={PUBLIC_TITLE}>{resolveLanguageKey("cardsTitle")}</h2>
                <p className={`mx-auto mt-2 max-w-3xl ${PUBLIC_SUBTITLE}`}>{resolveLanguageKey("cardsSubtitle")}</p>
            </div>
            <div className={`mt-11 ${PUBLIC_GRID_SALES}`}>
                {CARDS.map((card) => (
                    <div key={card.titleKey} className={PUBLIC_GRID_CELL}>
                        <div
                            className="flex aspect-[406/837] w-full min-w-0 flex-col justify-between rounded-[5px] border border-pronix-border p-6 sm:p-8"
                        >
                            <div>
                                <div className={`relative mb-6 w-full min-w-0 overflow-hidden rounded-[4px] ${IMAGE_ASPECT_CLASS}`}>
                                    <img
                                        alt=""
                                        aria-hidden
                                        className="size-full object-cover"
                                        src={assets[card.imageKey]}
                                    />
                                </div>
                                <h3 className={`${PUBLIC_SUBTITLE} text-pronix-ink`}>
                                    {resolveLanguageKey(card.titleKey)}
                                </h3>
                                <p className={`mt-3 ${PUBLIC_BODY} text-pronix-ink`}>
                                    {resolveLanguageKey(card.bodyKey)}
                                </p>
                                <div className="mt-6 flex items-start gap-2">
                                    <img alt="" aria-hidden className="mt-1 size-6 shrink-0" src={assets.checkCircle} />
                                    <p className="font-aeonik-light text-base text-pronix-ink not-italic leading-[1.3] sm:text-lg">
                                        {resolveLanguageKey("cardsIncluded")}
                                    </p>
                                </div>
                            </div>
                            <div className={`mt-8 flex w-full items-center justify-center rounded-[2px] border border-pronix-ink py-3 font-aeonik-medium ${PUBLIC_BODY} text-pronix-ink`}>
                                {resolveLanguageKey(card.ctaKey)}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default OwnershipCardsSection;
