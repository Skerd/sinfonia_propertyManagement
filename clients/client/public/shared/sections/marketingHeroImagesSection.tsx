import {PublicLanguageProps} from "@propertyManagementModule/clients/client/public/shared/publicTypes.ts";
import {
    PUBLIC_BODY,
    PUBLIC_CONTAINER,
    PUBLIC_GRID_TWO_COL,
    PUBLIC_TITLE,
} from "@propertyManagementModule/clients/client/public/shared/layout/publicLayoutTokens.ts";

type MarketingHeroImagesSectionProps = PublicLanguageProps & {
    titleKey: string;
    bodyKey: string;
    heroPerson: string;
    heroScene: string;
    nodeId?: string;
};

function MarketingHeroImagesSection({
    resolveLanguageKey,
    titleKey,
    bodyKey,
    heroPerson,
    heroScene,
    nodeId = "331:2855",
}: MarketingHeroImagesSectionProps) {
    return (
        <div className={`${PUBLIC_CONTAINER} relative min-w-0 w-full py-8 md:py-12`} data-node-id={nodeId}>
            <div className={`${PUBLIC_GRID_TWO_COL} items-center gap-8 lg:gap-12`}>
                <div className="min-w-0">
                    <h1 className={PUBLIC_TITLE}>{resolveLanguageKey(titleKey)}</h1>
                    <p className={`mt-6 max-w-xl ${PUBLIC_BODY}`}>{resolveLanguageKey(bodyKey)}</p>
                </div>
                <div className="relative aspect-[799/616] w-full min-w-0 overflow-hidden rounded-sm" data-node-id="331:2856">
                    <img alt="" aria-hidden className="absolute inset-0 size-full object-cover" src={heroScene} />
                    <div
                        className="absolute bottom-0 right-[4%] top-0 w-[min(30%,15rem)] overflow-hidden rounded-sm"
                        data-node-id="331:2857"
                    >
                        <img alt="" aria-hidden className="size-full object-cover object-top" src={heroPerson} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MarketingHeroImagesSection;
