import {PublicLanguageProps} from "@propertyManagementModule/clients/client/public/shared/publicTypes.ts";
import {MarketingTeamResponse} from "@propertyManagementModule/clients/client/public/shared/publicTypes.ts";
import {resolveMarketingMediaUrl} from "@propertyManagementModule/clients/client/public/shared/resolveMarketingMedia.ts";
import {aboutAssets} from "@propertyManagementModule/clients/client/public/about/aboutAssets.ts";
import {
    figmaImageCropStyle,
    FIGMA_ABOUT_FOUNDERS,
} from "@propertyManagementModule/clients/client/public/shared/layout/figmaDimensions.ts";
import {
    PUBLIC_GRID_ABOUT_FOUNDERS,
    PUBLIC_GRID_CELL,
} from "@propertyManagementModule/clients/client/public/shared/layout/publicLayoutTokens.ts";
import Loader from "@coreModule/components/custom/loader.tsx";

type AboutFoundersSectionProps = PublicLanguageProps & {
    data?: MarketingTeamResponse;
    loading?: boolean;
};

const {imageAspect, nameGapCqwCap, nameGapRemCap, nameFontCqwCap, nameFontRemCap, nameLineHeight, crops} =
    FIGMA_ABOUT_FOUNDERS;

const STATIC_FOUNDERS = [
    {image: aboutAssets.founder1, nameKey: "founder1Name", nodeId: "368:5000", cropKey: "founder1" as const},
    {image: aboutAssets.founder2, nameKey: "founder2Name", nodeId: "368:5003", cropKey: "founder2" as const},
] as const;

function AboutFoundersSection({resolveLanguageKey, data, loading}: AboutFoundersSectionProps) {
    const members = data?.members ?? [];

    const cards = STATIC_FOUNDERS.map((founder, index) => {
        const member = members[index];
        const photo = member ? resolveMarketingMediaUrl(member.image) ?? founder.image : founder.image;
        const name = member?.name ?? resolveLanguageKey(founder.nameKey);

        return {
            ...founder,
            photo,
            name,
        };
    });

    return (
        <div className="@container relative w-full min-w-0" data-node-id="368:4999">
            {loading ? (
                <div className="flex min-h-[40cqw] w-full items-center justify-center">
                    <Loader />
                </div>
            ) : (
                <div className={PUBLIC_GRID_ABOUT_FOUNDERS}>
                    {cards.map((card) => (
                        <div
                            key={card.nodeId}
                            className={`${PUBLIC_GRID_CELL} flex min-w-0 flex-col`}
                            style={{gap: `min(${nameGapCqwCap}cqw, ${nameGapRemCap}rem)`}}
                            data-node-id={card.nodeId}
                        >
                            <div
                                className="relative w-full min-w-0 overflow-hidden rounded-[5px]"
                                style={{aspectRatio: String(imageAspect)}}
                                data-node-id={card.nodeId === "368:5000" ? "368:5001" : "368:5004"}
                            >
                                <img
                                    alt={card.name}
                                    className="absolute max-w-none object-cover"
                                    src={card.photo}
                                    style={figmaImageCropStyle(crops[card.cropKey])}
                                />
                            </div>
                            <p
                                className="font-aeonik-medium text-pronix-ink not-italic"
                                style={{
                                    fontSize: `min(${nameFontCqwCap}cqw, ${nameFontRemCap}rem)`,
                                    lineHeight: nameLineHeight,
                                }}
                                data-node-id={card.nodeId === "368:5000" ? "368:5002" : "368:5005"}
                            >
                                {card.name}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default AboutFoundersSection;
