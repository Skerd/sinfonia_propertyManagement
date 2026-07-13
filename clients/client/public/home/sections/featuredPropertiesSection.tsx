import {createPortal} from "react-dom";
import FeaturedRouletteIntroPreview from "@propertyManagementModule/clients/client/public/home/sections/featuredRouletteIntroPreview.tsx";
import FeaturedRouletteMobileCarousel from "@propertyManagementModule/clients/client/public/home/sections/featuredRouletteMobileCarousel.tsx";
import {useFeaturedRouletteLayerRoot} from "@propertyManagementModule/clients/client/public/home/sections/featuredRouletteLayer.tsx";
import FeaturedRouletteStage from "@propertyManagementModule/clients/client/public/home/sections/featuredRouletteStage.tsx";
import {useFeaturedRouletteScroll} from "@propertyManagementModule/clients/client/public/home/sections/useFeaturedRouletteScroll.ts";
import {usePublicIsMobile} from "@propertyManagementModule/clients/client/public/shared/hooks/usePublicIsMobile.ts";

function FeaturedPropertiesSection() {
    const isMobile = usePublicIsMobile();
    const layerRoot = useFeaturedRouletteLayerRoot();
    const engine = useFeaturedRouletteScroll();
    const showStage = !isMobile && engine.isVisible && engine.stageRect !== null && layerRoot !== null;

    const stageProps =
        engine.stageRect === null
            ? null
            : {
                  stageRect: engine.stageRect,
                  rotationDeg: engine.rotationDeg,
                  focusIndex: engine.focusIndex,
                  zoomBlend: engine.zoomBlend,
                  scrollProgress: engine.scrollProgress,
                  isPinned: engine.isPinned,
              };

    if (isMobile) {
        return (
            <div className="relative w-full" data-node-id="71:1839" data-name="Featured properties">
                <FeaturedRouletteMobileCarousel />
            </div>
        );
    }

    return (
        <div className="relative w-full" data-node-id="71:1839" data-name="Featured properties">
            <div ref={engine.runwayRef} className="relative w-full" style={{height: engine.runwayHeight}}>
                <div
                    ref={engine.anchorRef}
                    className="relative w-full overflow-hidden bg-white"
                    style={{height: engine.stageHeight}}
                >
                    {!showStage && <FeaturedRouletteIntroPreview />}
                </div>
            </div>

            {showStage && stageProps && createPortal(<FeaturedRouletteStage {...stageProps} />, layerRoot)}
        </div>
    );
}

export default FeaturedPropertiesSection;
