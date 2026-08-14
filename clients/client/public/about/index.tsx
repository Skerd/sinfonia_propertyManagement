import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import PublicPageShell from "@propertyManagementModule/clients/client/public/shared/layout/publicPageShell.tsx";
import PublicSection from "@propertyManagementModule/clients/client/public/shared/layout/publicSection.tsx";
import PageHeaderSection from "@propertyManagementModule/clients/client/public/shared/sections/pageHeaderSection.tsx";
import FooterSection from "@propertyManagementModule/clients/client/public/home/sections/footerSection.tsx";
import CtaSection from "@propertyManagementModule/clients/client/public/home/sections/ctaSection.tsx";
import AboutIntroSection from "@propertyManagementModule/clients/client/public/about/sections/aboutIntroSection.tsx";
import AboutVideoSection from "@propertyManagementModule/clients/client/public/about/sections/aboutVideoSection.tsx";
import AboutMissionSection from "@propertyManagementModule/clients/client/public/about/sections/aboutMissionSection.tsx";
import AboutFoundersSection from "@propertyManagementModule/clients/client/public/about/sections/aboutFoundersSection.tsx";
import AboutQuoteSection from "@propertyManagementModule/clients/client/public/about/sections/aboutQuoteSection.tsx";

type AboutPageProps = WithLanguageType;

function AboutPage(props: AboutPageProps) {
    return (
        <PublicPageShell nodeId="331:676" nodeName="About PRONIX">
            <PublicSection flush>
                <PageHeaderSection variant="light" />
            </PublicSection>
            <PublicSection nodeId="368:4979" className="!py-6 md:!py-12 lg:!py-16">
                <AboutIntroSection {...props} />
            </PublicSection>
            <PublicSection nodeId="368:4982" className="!py-4 md:!py-12 lg:!py-16">
                <AboutVideoSection />
            </PublicSection>
            <PublicSection nodeId="368:4989" className="!py-6 md:!py-12 lg:!py-16">
                <AboutMissionSection {...props} />
            </PublicSection>
            <PublicSection nodeId="368:4999" className="!py-6 md:!py-12 lg:!py-16">
                <AboutFoundersSection {...props} />
            </PublicSection>
            <PublicSection nodeId="368:4994" className="!py-2 md:!py-12 lg:!py-16">
                <AboutQuoteSection {...props} />
            </PublicSection>
            <PublicSection nodeId="357:2477" className="!py-6 md:!py-12 lg:!py-16">
                <CtaSection />
            </PublicSection>
            <PublicSection nodeId="357:2497" flush fullBleed>
                <FooterSection />
            </PublicSection>
        </PublicPageShell>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/client/public/about/index.tsx"),
    withDebug(true, true),
)(AboutPage);
