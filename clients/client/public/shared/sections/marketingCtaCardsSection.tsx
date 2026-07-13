import {figmaAssets} from "@propertyManagementModule/clients/client/public/shared/figmaAssets.ts";
import {figmaImageCropStyle, FIGMA_IMAGE_CROPS} from "@propertyManagementModule/clients/client/public/shared/layout/figmaDimensions.ts";
import {PUBLIC_GRID_TWO_COL} from "@propertyManagementModule/clients/client/public/shared/layout/publicLayoutTokens.ts";

type MarketingCtaCardsSectionProps = {
    ctaBuilding: string;
    ctaScene: string;
    nodeId?: string;
};

function MarketingCtaCardsSection({ctaBuilding, ctaScene, nodeId = "357:340"}: MarketingCtaCardsSectionProps) {
    return (
        <div className="relative min-w-0 w-full overflow-x-hidden" data-node-id={nodeId}>
            <div className={PUBLIC_GRID_TWO_COL}>
                <div
                    className="relative flex aspect-[801/691] w-full min-w-0 flex-col overflow-hidden rounded-[5px] border border-[rgba(24,24,24,0.2)] lg:flex-row"
                    data-node-id="357:341"
                >
                    <div className="relative min-h-[12rem] w-full shrink-0 overflow-hidden sm:min-h-[16rem] lg:min-h-0 lg:flex-[0_0_30%]">
                        <img alt="" aria-hidden className="absolute inset-0 size-full object-cover" src={ctaBuilding} />
                    </div>
                </div>
                <div className="relative aspect-[802/691] w-full min-w-0 overflow-hidden rounded-[5px] bg-pronix-cream" data-node-id="357:351">
                    <img alt="" aria-hidden className="absolute inset-0 size-full object-cover" src={ctaScene} />
                    <div className="absolute bottom-[8%] left-[5%] w-[min(40%,15rem)]">
                        <div
                            className="rounded-[5px] border border-[rgba(255,255,255,0.2)] p-5 backdrop-blur-[47px]"
                            style={{background: "rgba(255, 255, 255, 0.1)"}}
                        >
                            <div className="relative mb-4 size-12 overflow-hidden">
                                <img alt="" aria-hidden className="size-full" src={figmaAssets.ctaEllipse} />
                                <div className="relative ml-1 mt-1 h-[19px] w-[31px] overflow-hidden">
                                    <img
                                        alt=""
                                        aria-hidden
                                        className="absolute max-w-none"
                                        src={figmaAssets.ctaLogo}
                                        style={figmaImageCropStyle(FIGMA_IMAGE_CROPS.ctaLogo)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MarketingCtaCardsSection;
