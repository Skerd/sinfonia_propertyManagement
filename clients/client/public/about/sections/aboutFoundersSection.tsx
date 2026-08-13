import {PublicLanguageProps} from "@propertyManagementModule/clients/client/public/shared/publicTypes.ts";
import {aboutAssets} from "@propertyManagementModule/clients/client/public/about/aboutAssets.ts";
import {
    figmaImageCropStyle,
    FIGMA_ABOUT_FOUNDERS,
} from "@propertyManagementModule/clients/client/public/shared/layout/figmaDimensions.ts";
import {
    PUBLIC_GRID_ABOUT_FOUNDERS,
    PUBLIC_GRID_CELL,
} from "@propertyManagementModule/clients/client/public/shared/layout/publicLayoutTokens.ts";

type AboutFoundersSectionProps = PublicLanguageProps;

const {imageAspect, nameGapCqwCap, nameGapRemCap, nameFontCqwCap, nameFontRemCap, nameLineHeight, crops} =
    FIGMA_ABOUT_FOUNDERS;

const STATIC_FOUNDERS = [
    {image: aboutAssets.founder1, nameKey: "founder1Name", nodeId: "368:5000", cropKey: "founder1" as const},
    {image: aboutAssets.founder2, nameKey: "founder2Name", nodeId: "368:5003", cropKey: "founder2" as const},
] as const;

function AboutFoundersSection({resolveLanguageKey}: AboutFoundersSectionProps) {
    return (
        <div className="@container relative w-full min-w-0" data-node-id="368:4999">
            <div className={PUBLIC_GRID_ABOUT_FOUNDERS}>
                {STATIC_FOUNDERS.map((founder) => {
                    const name = resolveLanguageKey(founder.nameKey);

                    return (
                        <div
                            key={founder.nodeId}
                            className={`${PUBLIC_GRID_CELL} flex min-w-0 flex-col`}
                            style={{gap: `min(${nameGapCqwCap}cqw, ${nameGapRemCap}rem)`}}
                            data-node-id={founder.nodeId}
                        >
                            <div
                                className="relative w-full min-w-0 overflow-hidden rounded-[5px]"
                                style={{aspectRatio: String(imageAspect)}}
                                data-node-id={founder.nodeId === "368:5000" ? "368:5001" : "368:5004"}
                            >
                                <img
                                    alt={name}
                                    className="absolute max-w-none object-cover"
                                    src={founder.image}
                                    style={figmaImageCropStyle(crops[founder.cropKey])}
                                />
                            </div>
                            <p
                                className="font-aeonik-medium text-pronix-ink not-italic"
                                style={{
                                    fontSize: `min(${nameFontCqwCap}cqw, ${nameFontRemCap}rem)`,
                                    lineHeight: nameLineHeight,
                                }}
                                data-node-id={founder.nodeId === "368:5000" ? "368:5002" : "368:5005"}
                            >
                                {name}
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default AboutFoundersSection;
