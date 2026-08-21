import {useMemo} from "react";
import {figmaAssets} from "@propertyManagementModule/clients/client/public/shared/figmaAssets.ts";
import {
    PUBLIC_GRID_CELL,
    PUBLIC_SUBTITLE,
    PUBLIC_TITLE_FIGMA,
} from "@propertyManagementModule/clients/client/public/shared/layout/publicLayoutTokens.ts";
import OwnershipInteractiveCard, {
    type OwnershipCardContent,
} from "@propertyManagementModule/clients/client/public/shared/sections/ownershipInteractiveCard.tsx";
import {PublicSnapCarousel} from "@propertyManagementModule/clients/client/public/shared/sections/publicSnapCarousel.tsx";
import type {PublicLanguageProps} from "@propertyManagementModule/clients/client/public/shared/publicTypes.ts";

type OwnershipSectionProps = Pick<PublicLanguageProps, "resolveLanguageKey">;

function OwnershipSection({resolveLanguageKey}: OwnershipSectionProps) {
    const t = (key: string) => String(resolveLanguageKey(key));
    const includedLabel = t("ownershipIncludedLabel");

    const ownershipCards: OwnershipCardContent[] = useMemo(
        () => [
            {
                nodeId: "142:764",
                layoutVariant: "1",
                image: figmaAssets.ownership1,
                imageCrop: "default" as const,
                title: t("ownBuyTitle"),
                body: t("ownBuyBody"),
                includedLabel,
                checklist: [
                    t("ownBuyCheck1"),
                    t("ownBuyCheck2"),
                    t("ownBuyCheck3"),
                    t("ownBuyCheck4"),
                    t("ownBuyCheck5"),
                    t("ownBuyCheck6"),
                ],
                ctaLabel: t("ownBuyCta"),
                ctaHref: "/projects",
            },
            {
                nodeId: "142:801",
                layoutVariant: "2",
                image: figmaAssets.ownership2,
                imageCrop: "coown" as const,
                title: t("ownCoownTitle"),
                body: t("ownCoownBody"),
                includedLabel,
                checklist: [
                    t("ownCoownCheck1"),
                    t("ownCoownCheck2"),
                    t("ownCoownCheck3"),
                    t("ownCoownCheck4"),
                    t("ownCoownCheck5"),
                ],
                ctaLabel: t("ownCoownCta"),
                ctaHref: "/projects",
            },
            {
                nodeId: "142:837",
                layoutVariant: "3",
                image: figmaAssets.ownership3,
                imageCrop: "default" as const,
                title: t("ownTokenTitle"),
                body: t("ownTokenBody"),
                includedLabel,
                checklist: [
                    t("ownTokenCheck1"),
                    t("ownTokenCheck2"),
                    t("ownTokenCheck3"),
                    t("ownTokenCheck4"),
                    t("ownTokenCheck5"),
                ],
                ctaLabel: t("ownTokenCta"),
                ctaHref: "/investors#tokenization",
            },
        ],
        [resolveLanguageKey],
    );

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
            <div className="relative z-10 min-w-0 w-full overflow-x-hidden px-4 py-16 sm:px-6 lg:px-[52px] lg:py-16" data-node-id="94:349">
                <div className="mx-auto flex w-full min-w-0 max-w-[1728px] flex-col items-center gap-6 lg:gap-8">
                    <div
                        className="flex flex-col items-center gap-2 text-center text-white not-italic leading-[1.2]"
                        data-node-id="94:350"
                    >
                        <p className={`${PUBLIC_TITLE_FIGMA} text-white`}>{t("ownershipTitle")}</p>
                        <p className={`${PUBLIC_SUBTITLE} max-w-[824px] text-white/90`}>
                            {t("ownershipSubtitle")}
                        </p>
                    </div>
                    <PublicSnapCarousel
                        rowNodeId="94:353"
                        inactiveDotClassName="bg-white/35"
                        dotsClassName="justify-center"
                        scrollerClassName="hide-scrollbar w-full min-w-0 flex snap-x snap-mandatory gap-0 overflow-x-auto overflow-y-hidden overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:grid md:snap-none md:grid-cols-2 md:gap-2 md:overflow-visible lg:grid-cols-3 lg:gap-4 pe-1"
                        itemClassName={`${PUBLIC_GRID_CELL} flex flex-col max-md:w-full max-md:shrink-0 max-md:snap-start`}
                    >
                        {ownershipCards.map((card) => (
                            <OwnershipInteractiveCard
                                key={card.nodeId}
                                card={card}
                                checkCircle={figmaAssets.checkCircle}
                                variant="dark"
                            />
                        ))}
                    </PublicSnapCarousel>
                </div>
            </div>
        </div>
    );
}

export default OwnershipSection;
