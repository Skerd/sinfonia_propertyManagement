import {PublicLanguageProps} from "@propertyManagementModule/clients/client/public/shared/publicTypes.ts";

function InvestorsHeroTitleSection({resolveLanguageKey}: PublicLanguageProps) {
    return (
        <div
            className="relative flex w-full flex-col items-start gap-3 text-left md:items-center md:text-center"
            data-node-id="368:4868"
        >
            <p
                className="cursor-default font-aeonik-medium text-[16px] leading-[1.2] tracking-normal text-[#0247FE] not-italic md:text-xl md:leading-[1.4] lg:text-[24px]"
                data-node-id="368:4866"
            >
                {resolveLanguageKey("heroEyebrow")}
            </p>
            <h1
                className="max-w-5xl font-aeonik-medium text-[32px] leading-[1.2] tracking-normal text-pronix-ink not-italic md:text-5xl lg:text-[64px] md:text-center"
                data-node-id="368:4867"
            >
                {resolveLanguageKey("heroTitle")}
            </h1>
        </div>
    );
}

export default InvestorsHeroTitleSection;
