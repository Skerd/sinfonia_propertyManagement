import {investorsAssets} from "@propertyManagementModule/clients/client/public/investors/investorsAssets.ts";
import {FIGMA_HERO_STRIP} from "@propertyManagementModule/clients/client/public/shared/layout/figmaDimensions.ts";

const STRIPS = [
    investorsAssets.heroStrip1,
    investorsAssets.heroStrip2,
    investorsAssets.heroStrip3,
    investorsAssets.heroStrip4,
] as const;

const stripGapClass = "gap-8";

function InvestorsHeroStripSection() {
    const aspectRatio = `${FIGMA_HERO_STRIP.imageWidth}/${FIGMA_HERO_STRIP.imageHeight}`;

    return (
        <div className="relative min-w-0 w-full overflow-x-hidden" data-node-id="368:4865">
            <div
                className={`flex ${stripGapClass} snap-x snap-mandatory overflow-x-auto pb-2 xl:mx-auto xl:max-w-[1728px] xl:justify-center xl:overflow-visible xl:snap-none xl:pb-0`}
            >
                {STRIPS.map((src, index) => (
                    <div
                        key={index}
                        className="h-auto w-[min(85vw,555px)] shrink-0 snap-center overflow-hidden rounded-[5px] xl:w-[min(32vw,555px)]"
                        style={{aspectRatio}}
                    >
                        <img alt="" aria-hidden className="size-full object-cover" src={src} />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default InvestorsHeroStripSection;
