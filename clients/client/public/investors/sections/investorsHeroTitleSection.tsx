import {PublicLanguageProps} from "@propertyManagementModule/clients/client/public/shared/publicTypes.ts";
import {PUBLIC_SUBTITLE} from "@propertyManagementModule/clients/client/public/shared/layout/publicLayoutTokens.ts";

function InvestorsHeroTitleSection({resolveLanguageKey}: PublicLanguageProps) {
    return (
        <div
            className="relative flex w-full flex-col items-center gap-3 text-center"
            data-node-id="368:4868"
        >
            <p className={`${PUBLIC_SUBTITLE} text-pronix-blue`} data-node-id="368:4866">
                {resolveLanguageKey("heroEyebrow")}
            </p>
            <h1
                className="max-w-5xl font-aeonik-medium text-pronix-ink not-italic leading-[1.2] text-3xl sm:text-4xl md:text-5xl lg:text-[64px]"
                data-node-id="368:4867"
            >
                {resolveLanguageKey("heroTitle")}
            </h1>
        </div>
    );
}

export default InvestorsHeroTitleSection;
