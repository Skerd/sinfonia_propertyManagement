import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import PublicPageShell from "@propertyManagementModule/clients/client/public/shared/layout/publicPageShell.tsx";
import PublicSection from "@propertyManagementModule/clients/client/public/shared/layout/publicSection.tsx";
import PageHeaderSection from "@propertyManagementModule/clients/client/public/shared/sections/pageHeaderSection.tsx";
import FooterSection from "@propertyManagementModule/clients/client/public/shared/sections/footerSection.tsx";
import CtaSection from "@propertyManagementModule/clients/client/public/shared/sections/ctaSection.tsx";
import DevelopersHeroTitleSection from "@propertyManagementModule/clients/client/public/developers/sections/developersHeroTitleSection.tsx";
import DevelopersDemoSection from "@propertyManagementModule/clients/client/public/developers/sections/developersDemoSection.tsx";
import DevelopersArchitectureSection from "@propertyManagementModule/clients/client/public/developers/sections/developersArchitectureSection.tsx";
import DevelopersFeaturesSection from "@propertyManagementModule/clients/client/public/developers/sections/developersFeaturesSection.tsx";
import DevelopersCatalogSection from "@propertyManagementModule/clients/client/public/developers/sections/developersCatalogSection.tsx";
import DevelopersPathSection from "@propertyManagementModule/clients/client/public/developers/sections/developersPathSection.tsx";
import DevelopersFaqSection from "@propertyManagementModule/clients/client/public/developers/sections/developersFaqSection.tsx";

function DevelopersPage(props: WithLanguageType) {
    return (
        <PublicPageShell nodeId="343:294" nodeName="For developers">
            <PublicSection flush>
                <PageHeaderSection variant="light" />
            </PublicSection>
            <PublicSection nodeId="368:5026">
                <DevelopersHeroTitleSection {...props} />
            </PublicSection>
            <PublicSection nodeId="368:5030">
                <DevelopersDemoSection {...props} />
            </PublicSection>
            <PublicSection nodeId="387:32339">
                <DevelopersArchitectureSection {...props} />
            </PublicSection>
            <PublicSection nodeId="388:1265" flush fullBleed>
                <DevelopersFeaturesSection {...props} />
            </PublicSection>
            <PublicSection nodeId="388:1266" flush fullBleed>
                <DevelopersCatalogSection {...props} />
            </PublicSection>
            <PublicSection nodeId="388:1277">
                <DevelopersPathSection {...props} />
            </PublicSection>
            <PublicSection nodeId="352:347" flush contentFrame>
                <DevelopersFaqSection {...props} />
            </PublicSection>
            <PublicSection nodeId="343:295">
                <CtaSection />
            </PublicSection>
            <PublicSection nodeId="343:315" flush fullBleed>
                <FooterSection />
            </PublicSection>
        </PublicPageShell>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/client/public/developers/index.tsx"),
    withDebug(true, true),
)(DevelopersPage);
