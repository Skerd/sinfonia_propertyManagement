import {PublicLanguageProps} from "@propertyManagementModule/clients/client/public/shared/publicTypes.ts";
import {developersAssets} from "@propertyManagementModule/clients/client/public/developers/developersAssets.ts";
import {FIGMA_DEVELOPERS_ARCH} from "@propertyManagementModule/clients/client/public/shared/layout/figmaDimensions.ts";
import {
    PUBLIC_GRID_CELL,
    PUBLIC_GRID_INSPECTIONS,
    PUBLIC_HEADING,
    PUBLIC_SUBTITLE,
    PUBLIC_TITLE_FIGMA,
} from "@propertyManagementModule/clients/client/public/shared/layout/publicLayoutTokens.ts";

const {circleGraphicWidthRatio, arrowGraphicWidthRatio, arrowBottomRatio} = FIGMA_DEVELOPERS_ARCH;

type ArchCardProps = {
    num: string;
    titleKey: string;
    bodyKey: string;
    variant: 1 | 2 | 3;
    nodeId: string;
    resolveLanguageKey: (key: string) => string;
};

function ArchitectureCard({num, titleKey, bodyKey, variant, nodeId, resolveLanguageKey}: ArchCardProps) {
    return (
        <div
            className="group relative aspect-[512/795] w-full min-w-0 overflow-hidden rounded-[5px] border border-[rgba(24,24,24,0.2)] bg-white transition-all duration-500 hover:border-[rgba(255,255,255,0.2)] hover:bg-pronix-blue"
            data-node-id={nodeId}
        >
            <p className={`absolute left-6 top-6 z-10 sm:left-8 sm:top-8 ${PUBLIC_HEADING} transition-colors duration-500 group-hover:text-white`}>
                {num}
            </p>
            <div className="relative z-10 flex flex-col items-start gap-3 p-6 pt-16 not-italic sm:px-8 sm:pb-8 sm:pt-20">
                <p className={`${PUBLIC_HEADING} transition-colors duration-500 group-hover:text-white`}>
                    {resolveLanguageKey(titleKey)}
                </p>
                <p className={`${PUBLIC_SUBTITLE} text-pronix-ink-muted transition-colors duration-500 group-hover:text-white/80`}>
                    {resolveLanguageKey(bodyKey)}
                </p>
            </div>
            {variant === 1 && (
                <div
                    className="absolute bottom-0 left-1/2 aspect-square -translate-x-1/2"
                    style={{width: `${circleGraphicWidthRatio * 100}%`}}
                    data-node-id="389:424"
                >
                    <img alt="" aria-hidden className="absolute inset-0 size-full" src={developersAssets.archCircle3} data-node-id="389:425" />
                    <img alt="" aria-hidden className="absolute inset-0 size-full" src={developersAssets.archCircle1} data-node-id="389:427" />
                    <img alt="" aria-hidden className="absolute inset-0 size-full" src={developersAssets.archCircle2} data-node-id="389:429" />
                </div>
            )}
            {variant === 2 && (
                <>
                    <img
                        alt=""
                        aria-hidden
                        className="absolute bottom-0 left-0 max-h-[50%] w-full object-contain"
                        src={developersAssets.archTriangle1}
                        data-node-id="389:441"
                    />
                    <img
                        alt=""
                        aria-hidden
                        className="absolute bottom-0 left-0 max-h-[50%] w-full object-contain opacity-80"
                        src={developersAssets.archTriangle2}
                        data-node-id="389:443"
                    />
                </>
            )}
            {variant === 3 && (
                <div
                    className="absolute left-1/2 aspect-square -translate-x-1/2"
                    style={{
                        bottom: `${arrowBottomRatio * 100}%`,
                        width: `${arrowGraphicWidthRatio * 100}%`,
                    }}
                    data-node-id="389:453"
                >
                    <div className="absolute inset-0 overflow-hidden" data-node-id="389:454">
                        <div className="absolute inset-y-0 right-0 left-[18%]" data-node-id="389:455">
                            <img alt="" aria-hidden className="block size-full max-w-none object-contain" src={developersAssets.archArrowGroup} />
                        </div>
                    </div>
                    <img alt="" aria-hidden className="absolute inset-0 size-full max-w-none object-contain" src={developersAssets.archArrow3} data-node-id="389:458" />
                    <img alt="" aria-hidden className="absolute inset-0 size-full max-w-none object-contain" src={developersAssets.archArrow1} data-node-id="389:461" />
                </div>
            )}
        </div>
    );
}

function DevelopersArchitectureSection({resolveLanguageKey}: PublicLanguageProps) {
    return (
        <div className="relative flex min-w-0 w-full flex-col items-center overflow-x-hidden" data-node-id="387:32339">
            <div className="flex w-full min-w-0 flex-col items-center gap-8 lg:gap-11">
                <div className="text-center text-pronix-ink not-italic" data-node-id="368:20222">
                    <h2 className={PUBLIC_TITLE_FIGMA} data-node-id="368:20229">
                        {resolveLanguageKey("architectureTitle")}
                    </h2>
                    <p className={`mx-auto mt-3 max-w-3xl ${PUBLIC_SUBTITLE}`} data-node-id="368:20230">
                        {resolveLanguageKey("architectureSubtitle")}
                    </p>
                </div>
                <div className={`w-full min-w-0 ${PUBLIC_GRID_INSPECTIONS}`} data-node-id="387:32320">
                    <div className={PUBLIC_GRID_CELL}>
                        <ArchitectureCard
                            num="01"
                            titleKey="arch1Title"
                            bodyKey="arch1Body"
                            variant={1}
                            nodeId="389:512"
                            resolveLanguageKey={resolveLanguageKey}
                        />
                    </div>
                    <div className={PUBLIC_GRID_CELL}>
                        <ArchitectureCard
                            num="02"
                            titleKey="arch2Title"
                            bodyKey="arch2Body"
                            variant={2}
                            nodeId="389:525"
                            resolveLanguageKey={resolveLanguageKey}
                        />
                    </div>
                    <div className={PUBLIC_GRID_CELL}>
                        <ArchitectureCard
                            num="03"
                            titleKey="arch3Title"
                            bodyKey="arch3Body"
                            variant={3}
                            nodeId="389:551"
                            resolveLanguageKey={resolveLanguageKey}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DevelopersArchitectureSection;
