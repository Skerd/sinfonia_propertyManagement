import {PublicLanguageProps} from "@propertyManagementModule/clients/client/public/shared/publicTypes.ts";

function DevelopersHeroTitleSection({resolveLanguageKey}: PublicLanguageProps) {
    return (
        <div className="relative flex w-full flex-col items-center md:items-start" data-node-id="368:5026">
            <div className="flex w-full max-w-4xl flex-col gap-3">
                <p
                    className="cursor-default font-aeonik-medium text-[16px] leading-[1.2] tracking-normal text-[#0247FE] not-italic md:text-xl md:leading-[1.4] lg:text-[24px]"
                    data-node-id="368:5027"
                >
                    {resolveLanguageKey("heroEyebrow")}
                </p>
                <h1
                    className="cursor-default font-aeonik-medium text-[32px] leading-[1.2] tracking-normal text-pronix-ink not-italic md:text-5xl lg:text-[56px]"
                    data-node-id="368:5028"
                >
                    {resolveLanguageKey("heroTitle")}
                </h1>
            </div>
        </div>
    );
}

export default DevelopersHeroTitleSection;
