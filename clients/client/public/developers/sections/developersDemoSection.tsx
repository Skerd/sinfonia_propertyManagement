import {developersAssets} from "@propertyManagementModule/clients/client/public/developers/developersAssets.ts";
import {FIGMA_DEVELOPERS_DEMO} from "@propertyManagementModule/clients/client/public/shared/layout/figmaDimensions.ts";

const {imageWidth, imageHeight} = FIGMA_DEVELOPERS_DEMO;

function DevelopersDemoSection() {
    return (
        <div className="relative w-full" data-node-id="368:5030">
            <div
                className="relative overflow-hidden rounded-[23px] border-2 border-pronix-blue bg-white p-4 md:p-6"
                data-node-id="368:5031"
            >
                <img
                    alt=""
                    aria-hidden
                    className="block w-full h-auto"
                    width={imageWidth}
                    height={imageHeight}
                    decoding="async"
                    src={developersAssets.demoMacbook}
                    data-node-id="368:5037"
                />
            </div>
            <div
                className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3"
                style={{
                    background: "linear-gradient(180deg, rgba(255,255,255,0) 60.27%, rgba(255,255,255,0.45) 67.01%, #ffffff 82.69%)",
                }}
                data-node-id="368:5033"
            />
        </div>
    );
}

export default DevelopersDemoSection;
