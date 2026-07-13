import {PublicLanguageProps} from "@propertyManagementModule/clients/client/public/shared/publicTypes.ts";
import {PUBLIC_SUBTITLE, PUBLIC_TITLE} from "@propertyManagementModule/clients/client/public/shared/layout/publicLayoutTokens.ts";

function DevelopersHeroTitleSection({resolveLanguageKey}: PublicLanguageProps) {
    return (
        <div className="relative flex w-full flex-col items-center md:items-start" data-node-id="368:5026">
            <div className="flex w-full max-w-4xl flex-col gap-3">
                <p className={PUBLIC_SUBTITLE} data-node-id="368:5027">
                    {resolveLanguageKey("heroEyebrow")}
                </p>
                <h1 className={PUBLIC_TITLE} data-node-id="368:5028">
                    {resolveLanguageKey("heroTitle")}
                </h1>
            </div>
        </div>
    );
}

export default DevelopersHeroTitleSection;
