import {PublicLanguageProps} from "@propertyManagementModule/clients/client/public/shared/publicTypes.ts";
import {developersAssets} from "@propertyManagementModule/clients/client/public/developers/developersAssets.ts";
import DevelopersDataStripSection from "@propertyManagementModule/clients/client/public/developers/sections/developersDataStripSection.tsx";
import {FIGMA_DEVELOPERS_DEMO} from "@propertyManagementModule/clients/client/public/shared/layout/figmaDimensions.ts";

const {imageWidth, imageHeight} = FIGMA_DEVELOPERS_DEMO;

function DevelopersDemoSection({resolveLanguageKey}: PublicLanguageProps) {
    return (
        <div
            className="relative flex w-full flex-col items-stretch gap-8 lg:flex-row lg:items-center lg:gap-10 xl:gap-14"
            data-node-id="368:5030"
        >
            <div className="relative min-w-0 w-full flex-1 lg:max-w-[min(100%,58%)]">
                <div
                    className="relative overflow-hidden rounded-[23px] border-2 border-pronix-blue bg-white p-3 sm:p-4 md:p-5"
                    data-node-id="368:5031"
                >
                    <img
                        alt=""
                        aria-hidden
                        className="block h-auto w-full"
                        width={imageWidth}
                        height={imageHeight}
                        decoding="async"
                        src={developersAssets.demoMacbook}
                        data-node-id="368:5037"
                    />
                </div>
            </div>

            <div className="w-full shrink-0 sm:max-w-md lg:w-[min(100%,22rem)] xl:w-[26rem]">
                <DevelopersDataStripSection resolveLanguageKey={resolveLanguageKey} />
            </div>
        </div>
    );
}

export default DevelopersDemoSection;
