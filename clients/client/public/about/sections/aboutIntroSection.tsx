import {PublicLanguageProps} from "@propertyManagementModule/clients/client/public/shared/publicTypes.ts";
import {PUBLIC_SUBTITLE, PUBLIC_TITLE} from "@propertyManagementModule/clients/client/public/shared/layout/publicLayoutTokens.ts";

function AboutIntroSection({resolveLanguageKey}: PublicLanguageProps) {
    return (
        <div className="relative w-full" data-node-id="368:4979">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
                <h1 className={`lg:col-span-4 ${PUBLIC_TITLE}`} data-node-id="368:4990">
                    {resolveLanguageKey("pageTitle")}
                </h1>
                <p className={`lg:col-span-4 ${PUBLIC_SUBTITLE}`} data-node-id="368:4980">
                    {resolveLanguageKey("historyLeft")}
                </p>
                <p className={`lg:col-span-4 ${PUBLIC_SUBTITLE}`} data-node-id="368:4981">
                    {resolveLanguageKey("historyRight")}
                </p>
            </div>
        </div>
    );
}

export default AboutIntroSection;
