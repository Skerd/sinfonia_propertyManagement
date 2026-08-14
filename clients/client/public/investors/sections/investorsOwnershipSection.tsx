import {PublicLanguageProps} from "@propertyManagementModule/clients/client/public/shared/publicTypes.ts";
import {investorsAssets} from "@propertyManagementModule/clients/client/public/investors/investorsAssets.ts";
import {
    PUBLIC_GRID_CELL,
} from "@propertyManagementModule/clients/client/public/shared/layout/publicLayoutTokens.ts";
import {type OwnershipImageCropKey} from "@propertyManagementModule/clients/client/public/shared/layout/figmaDimensions.ts";
import OwnershipInteractiveCard, {
    type OwnershipCardContent,
} from "@propertyManagementModule/clients/client/public/shared/sections/ownershipInteractiveCard.tsx";
import {PublicSnapCarousel} from "@propertyManagementModule/clients/client/public/shared/sections/publicSnapCarousel.tsx";

type OwnershipAssets = Pick<typeof investorsAssets, "cardBuy" | "cardCoown" | "cardToken" | "checkCircle">;

type InvestorsOwnershipSectionProps = PublicLanguageProps & {
    assets?: OwnershipAssets;
};

type CardConfig = {
    image: string;
    titleKey: string;
    bodyKey: string;
    checklistKeys: readonly string[];
    ctaKey: string;
    ctaHref: string;
    nodeId: string;
    layoutVariant?: "1" | "2" | "3";
    imageCrop: OwnershipImageCropKey;
};

function InvestorsOwnershipSection({resolveLanguageKey, assets = investorsAssets}: InvestorsOwnershipSectionProps) {
    const cardConfigs: CardConfig[] = [
        {
            image: assets.cardBuy,
            titleKey: "cardBuyTitle",
            bodyKey: "cardBuyBody",
            ctaKey: "cardBuyCta",
            ctaHref: "/projects",
            checklistKeys: ["buyCheck1", "buyCheck2", "buyCheck3", "buyCheck4", "buyCheck5", "buyCheck6"],
            nodeId: "368:4874",
            layoutVariant: "1",
            imageCrop: "default",
        },
        {
            image: assets.cardCoown,
            titleKey: "cardCoownTitle",
            bodyKey: "cardCoownBody",
            ctaKey: "cardCoownCta",
            ctaHref: "/projects",
            checklistKeys: ["coownCheck1", "coownCheck2", "coownCheck3", "coownCheck4", "coownCheck5"],
            nodeId: "368:4875",
            layoutVariant: "2",
            imageCrop: "coown",
        },
        {
            image: assets.cardToken,
            titleKey: "cardTokenTitle",
            bodyKey: "cardTokenBody",
            ctaKey: "cardTokenCta",
            ctaHref: "#tokenization",
            checklistKeys: ["tokenCheck1", "tokenCheck2", "tokenCheck3", "tokenCheck4", "tokenCheck5"],
            nodeId: "368:4876",
            layoutVariant: "3",
            imageCrop: "default",
        },
    ];

    const cards: OwnershipCardContent[] = cardConfigs.map((config) => ({
        nodeId: config.nodeId,
        layoutVariant: config.layoutVariant,
        image: config.image,
        imageCrop: config.imageCrop,
        title: resolveLanguageKey(config.titleKey),
        body: resolveLanguageKey(config.bodyKey),
        includedLabel: resolveLanguageKey("cardsIncludedLabel"),
        checklist: config.checklistKeys.map((key) => resolveLanguageKey(key)),
        ctaLabel: resolveLanguageKey(config.ctaKey),
        ctaHref: config.ctaHref,
    }));

    return (
        <div className="relative min-w-0 w-full overflow-x-hidden" data-node-id="368:4869">
            <div className="flex w-full min-w-0 flex-col items-start gap-8 lg:items-center lg:gap-11">
                <div className="flex w-full flex-col items-start gap-2 text-left text-pronix-ink not-italic md:items-center md:text-center" data-node-id="368:4870">
                    <p className="cursor-default font-aeonik-medium text-[40px] leading-[1.2] tracking-normal text-pronix-ink not-italic md:text-5xl lg:text-[56px]" data-node-id="368:4871">
                        {resolveLanguageKey("cardsTitle")}
                    </p>
                    <p className="cursor-default font-aeonik-light text-[18px] leading-[1.2] tracking-normal text-pronix-ink not-italic md:text-2xl md:leading-[1.4] lg:text-[24px]" data-node-id="368:4872">
                        {resolveLanguageKey("cardsSubtitle")}
                    </p>
                </div>
                <PublicSnapCarousel
                    rowNodeId="368:4873"
                    scrollerClassName="hide-scrollbar w-full min-w-0 flex snap-x snap-mandatory gap-0 overflow-x-auto overflow-y-hidden overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:grid md:snap-none md:grid-cols-2 md:gap-2 md:overflow-visible lg:grid-cols-3 lg:gap-4 pe-1"
                    itemClassName={`${PUBLIC_GRID_CELL} flex flex-col max-md:w-full max-md:shrink-0 max-md:snap-start`}
                >
                    {cards.map((card) => (
                        <OwnershipInteractiveCard
                            key={card.nodeId}
                            card={card}
                            checkCircle={assets.checkCircle}
                            variant="light"
                        />
                    ))}
                </PublicSnapCarousel>
            </div>
        </div>
    );
}

export default InvestorsOwnershipSection;
