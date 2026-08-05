import {PublicLanguageProps} from "@propertyManagementModule/clients/client/public/shared/publicTypes.ts";
import {investorsAssets} from "@propertyManagementModule/clients/client/public/investors/investorsAssets.ts";
import {
    PUBLIC_GRID_CELL,
    PUBLIC_SUBTITLE,
    PUBLIC_TITLE_FIGMA,
} from "@propertyManagementModule/clients/client/public/shared/layout/publicLayoutTokens.ts";
import {type OwnershipImageCropKey} from "@propertyManagementModule/clients/client/public/shared/layout/figmaDimensions.ts";
import OwnershipInteractiveCard, {
    type OwnershipCardContent,
} from "@propertyManagementModule/clients/client/public/shared/sections/ownershipInteractiveCard.tsx";

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
            <div className="flex w-full min-w-0 flex-col items-center gap-8 lg:gap-11">
                <div className="flex flex-col items-center gap-2 text-center text-pronix-ink not-italic" data-node-id="368:4870">
                    <p className={PUBLIC_TITLE_FIGMA} data-node-id="368:4871">
                        {resolveLanguageKey("cardsTitle")}
                    </p>
                    <p className={PUBLIC_SUBTITLE} data-node-id="368:4872">
                        {resolveLanguageKey("cardsSubtitle")}
                    </p>
                </div>
                <div
                    className="grid w-full min-w-0 grid-cols-1 items-stretch gap-2 pe-1 md:grid-cols-2 lg:gap-4 xl:grid-cols-3"
                    data-node-id="368:4873"
                >
                    {cards.map((card) => (
                        <div key={card.nodeId} className={`${PUBLIC_GRID_CELL} flex flex-col`}>
                            <OwnershipInteractiveCard
                                card={card}
                                checkCircle={assets.checkCircle}
                                variant="light"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default InvestorsOwnershipSection;
