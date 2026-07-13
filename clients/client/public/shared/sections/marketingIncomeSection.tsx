import {PublicLanguageProps} from "@propertyManagementModule/clients/client/public/shared/publicTypes.ts";
import {
    PUBLIC_BODY,
    PUBLIC_CONTAINER,
    PUBLIC_GRID_TWO_COL,
    PUBLIC_TITLE,
} from "@propertyManagementModule/clients/client/public/shared/layout/publicLayoutTokens.ts";

type MarketingIncomeSectionProps = PublicLanguageProps & {
    mainImage: string;
    sideImage: string;
    nodeId?: string;
};

function MarketingIncomeSection({resolveLanguageKey, mainImage, sideImage, nodeId = "357:4708"}: MarketingIncomeSectionProps) {
    return (
        <div className={`${PUBLIC_CONTAINER} relative min-w-0 w-full py-8 md:py-16`} data-node-id={nodeId}>
            <div className={`${PUBLIC_GRID_TWO_COL} items-start gap-8 lg:gap-12`}>
                <div className="relative aspect-[1007/764] w-full min-w-0 overflow-hidden rounded-[5px]">
                    <img alt="" aria-hidden className="size-full object-cover" src={mainImage} />
                </div>
                <div className="flex min-w-0 flex-col gap-8">
                    <h2 className={PUBLIC_TITLE}>{resolveLanguageKey("incomeTitle")}</h2>
                    <p className={PUBLIC_BODY}>{resolveLanguageKey("incomeBody")}</p>
                    <div className="relative aspect-[495/376] w-full min-w-0 overflow-hidden rounded-[5px]">
                        <img alt="" aria-hidden className="size-full object-cover" src={sideImage} />
                    </div>
                    <p className={PUBLIC_BODY}>{resolveLanguageKey("incomeFooter")}</p>
                </div>
            </div>
        </div>
    );
}

export default MarketingIncomeSection;
