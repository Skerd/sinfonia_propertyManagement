import {PublicLanguageProps} from "@propertyManagementModule/clients/client/public/shared/publicTypes.ts";
import {investorsAssets} from "@propertyManagementModule/clients/client/public/investors/investorsAssets.ts";
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

function InvestorsFaqSection({resolveLanguageKey}: PublicLanguageProps) {
    return (
        <FaqSection
            nodeId="352:310"
            items={FAQ_ITEMS}
            titleKey="faqTitle"
            subtitleKey="faqSubtitle"
            plusIconSrc={{open: investorsAssets.faqPlusOpen, closed: investorsAssets.faqPlusClosed}}
            resolveLanguageKey={resolveLanguageKey}
        />
    );
}

export default InvestorsFaqSection;
