import {investorsAssets} from "@propertyManagementModule/clients/client/public/investors/investorsAssets.ts";
import {FIGMA_INVESTORS_CATALOG} from "@propertyManagementModule/clients/client/public/shared/layout/figmaDimensions.ts";

const {visualRemCap} = FIGMA_INVESTORS_CATALOG;

function InvestorsCatalogGlobeVisual() {
    return (
        <div className="relative flex w-full items-center justify-center lg:justify-end">
            <div
                className="relative isolate aspect-square w-full overflow-hidden rounded-full bg-pronix-blue"
                style={{maxWidth: `min(100%, ${visualRemCap}rem)`}}
                data-node-id="587:1381"
            >
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    aria-hidden
                    className="pointer-events-none absolute inset-0 size-full scale-[1.06] object-cover mix-blend-lighten"
                    src={investorsAssets.catalogGlobeVideo}
                />
            </div>
        </div>
    );
}

export default InvestorsCatalogGlobeVisual;
