import {PublicLanguageProps} from "@propertyManagementModule/clients/client/public/shared/publicTypes.ts";

function AboutQuoteSection({resolveLanguageKey}: PublicLanguageProps) {
    return (
        <div className="relative flex w-full flex-col items-center py-0 md:py-12" data-node-id="368:4994">
            <div
                aria-hidden
                className="h-16 w-px bg-black md:h-24 md:bg-[#3C3837]"
                data-node-id="368:4995"
            />
            <p
                className="mt-6 text-center font-aeonik-medium text-[40px] leading-[1.2] tracking-normal text-pronix-ink not-italic md:mt-0 md:text-5xl lg:text-[80px] max-w-4xl px-4"
                data-node-id="368:4997"
            >
                {resolveLanguageKey("quotePart1")}
                <span className="text-pronix-blue">{resolveLanguageKey("quotePart2")}</span>
            </p>
            <div
                aria-hidden
                className="mt-6 h-16 w-px bg-black md:mt-8 md:h-24 md:bg-[#3C3837]"
                data-node-id="368:4998"
            />
        </div>
    );
}

export default AboutQuoteSection;
