import {PublicLanguageProps} from "@propertyManagementModule/clients/client/public/shared/publicTypes.ts";
import {developersAssets} from "@propertyManagementModule/clients/client/public/developers/developersAssets.ts";
import FaqSection from "@propertyManagementModule/clients/client/public/shared/sections/faqSection.tsx";

const FAQ_ITEMS = [
    {qKey: "faq1Question", aKey: "faq1Answer", open: true},
    {qKey: "faq2Question", aKey: "faq2Answer"},
    {qKey: "faq3Question", aKey: "faq3Answer"},
    {qKey: "faq4Question", aKey: "faq4Answer"},
    {qKey: "faq5Question", aKey: "faq5Answer"},
    {qKey: "faq6Question", aKey: "faq6Answer"},
    {qKey: "faq7Question", aKey: "faq7Answer"},
] as const;

function DevelopersFaqSection({resolveLanguageKey}: PublicLanguageProps) {
    return (
        <FaqSection
            nodeId="352:347"
            items={FAQ_ITEMS}
            titleKey="faqTitle"
            subtitleKey="faqSubtitle"
            plusIconSrc={{open: developersAssets.faqPlusOpen, closed: developersAssets.faqPlusClosed}}
            resolveLanguageKey={resolveLanguageKey}
        />
    );
}

export default DevelopersFaqSection;
