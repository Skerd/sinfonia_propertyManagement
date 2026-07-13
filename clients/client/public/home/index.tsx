import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import PublicPageShell from "@propertyManagementModule/clients/client/public/shared/layout/publicPageShell.tsx";
import PublicSection from "@propertyManagementModule/clients/client/public/shared/layout/publicSection.tsx";
import HeroSection from "@propertyManagementModule/clients/client/public/home/sections/heroSection.tsx";
import AboutSection from "@propertyManagementModule/clients/client/public/home/sections/aboutSection.tsx";
import CapabilitiesSection from "@propertyManagementModule/clients/client/public/home/sections/capabilitiesSection.tsx";
import FeaturedPropertiesSection from "@propertyManagementModule/clients/client/public/home/sections/featuredPropertiesSection.tsx";
import OwnershipSection from "@propertyManagementModule/clients/client/public/home/sections/ownershipSection.tsx";
import RoiCalculatorSection from "@propertyManagementModule/clients/client/public/home/sections/roiCalculatorSection.tsx";
import PlatformSection from "@propertyManagementModule/clients/client/public/home/sections/platformSection.tsx";
import CtaSection from "@propertyManagementModule/clients/client/public/shared/sections/ctaSection.tsx";
import FooterSection from "@propertyManagementModule/clients/client/public/shared/sections/footerSection.tsx";

function HomePage(_: WithLanguageType) {
    return (
        <PublicPageShell nodeId="41:196" nodeName="Homepage">
            <PublicSection nodeId="41:197" flush>
                <HeroSection />
            </PublicSection>
            <PublicSection nodeId="142:1209">
                <AboutSection />
            </PublicSection>
            <PublicSection nodeId="80:3907">
                <CapabilitiesSection />
            </PublicSection>
            <PublicSection nodeId="71:1839">
                <FeaturedPropertiesSection />
            </PublicSection>
            <PublicSection nodeId="80:1918" flush fullBleed>
                <OwnershipSection />
            </PublicSection>
            <PublicSection nodeId="94:255">
                <RoiCalculatorSection />
            </PublicSection>
            <PublicSection nodeId="80:3906" flush contentFrame>
                <PlatformSection />
            </PublicSection>
            <PublicSection nodeId="357:340">
                <CtaSection />
            </PublicSection>
            <PublicSection nodeId="357:360" flush fullBleed>
                <FooterSection />
            </PublicSection>
        </PublicPageShell>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/client/public/home/index.tsx"),
    withDebug(true, true),
)(HomePage);
