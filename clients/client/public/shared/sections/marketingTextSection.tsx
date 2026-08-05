import {PublicLanguageProps} from "@propertyManagementModule/clients/client/public/shared/publicTypes.ts";
import {PUBLIC_SUBTITLE, PUBLIC_TITLE} from "@propertyManagementModule/clients/client/public/shared/layout/publicLayoutTokens.ts";

export type MarketingBlock = {
    titleKey?: string;
    bodyKey?: string;
    nodeId?: string;
};

type MarketingTextSectionProps = PublicLanguageProps & {
    block: MarketingBlock;
};

function MarketingTextSection({resolveLanguageKey, block}: MarketingTextSectionProps) {
    return (
        <div className="relative w-full" data-node-id={block.nodeId}>
            {block.titleKey && <h2 className={PUBLIC_TITLE}>{resolveLanguageKey(block.titleKey)}</h2>}
            {block.bodyKey && (
                <p className={`max-w-[1084px] ${PUBLIC_SUBTITLE} ${block.titleKey ? "mt-4 md:mt-6" : ""}`}>
                    {resolveLanguageKey(block.bodyKey)}
                </p>
            )}
        </div>
    );
}

export default MarketingTextSection;
