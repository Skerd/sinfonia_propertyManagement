import {PublicLanguageProps} from "@propertyManagementModule/clients/client/public/shared/publicTypes.ts";

function AboutQuoteSection({resolveLanguageKey}: PublicLanguageProps) {
    return (
        <div className="relative flex w-full flex-col items-center py-8 md:py-12" data-node-id="368:4994">
            <div
                aria-hidden
                className="hidden h-24 w-px bg-[#3C3837] md:block"
                data-node-id="368:4995"
            />
            <p
                className="text-center font-aeonik-medium text-3xl text-pronix-ink not-italic sm:text-4xl md:text-5xl lg:text-[80px] leading-[1.2] max-w-4xl px-4"
                data-node-id="368:4997"
            >
                {resolveLanguageKey("quotePart1")}
                <span className="text-pronix-blue">{resolveLanguageKey("quotePart2")}</span>
            </p>
            <div
                aria-hidden
                className="mt-8 hidden h-24 w-px bg-[#3C3837] md:block"
                data-node-id="368:4998"
            />
        </div>
    );
}

export default AboutQuoteSection;
