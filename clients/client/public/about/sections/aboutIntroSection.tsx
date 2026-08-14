import {PublicLanguageProps} from "@propertyManagementModule/clients/client/public/shared/publicTypes.ts";

function AboutIntroSection({resolveLanguageKey}: PublicLanguageProps) {
    return (
        <div className="relative w-full" data-node-id="368:4979">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-12">
                <h1
                    className="lg:col-span-4 cursor-default font-aeonik-medium text-[40px] leading-[1.1] tracking-normal text-pronix-ink not-italic md:text-5xl md:leading-[1.2] lg:text-[56px]"
                    data-node-id="368:4990"
                >
                    {resolveLanguageKey("pageTitle")}
                </h1>
                <p
                    className="lg:col-span-4 cursor-default font-aeonik-light text-[18px] leading-[1.2] tracking-normal text-pronix-ink not-italic md:text-2xl md:leading-[1.4] lg:text-[24px]"
                    data-node-id="368:4980"
                >
                    {resolveLanguageKey("historyLeft")}
                </p>
                <p
                    className="lg:col-span-4 cursor-default font-aeonik-light text-[18px] leading-[1.2] tracking-normal text-pronix-ink not-italic md:text-2xl md:leading-[1.4] lg:text-[24px]"
                    data-node-id="368:4981"
                >
                    {resolveLanguageKey("historyRight")}
                </p>
            </div>
        </div>
    );
}

export default AboutIntroSection;
