import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import PublicPageShell from "@propertyManagementModule/clients/client/public/shared/layout/publicPageShell.tsx";
import PublicSection from "@propertyManagementModule/clients/client/public/shared/layout/publicSection.tsx";
import PageHeaderSection from "@propertyManagementModule/clients/client/public/shared/sections/pageHeaderSection.tsx";
import FooterSection from "@propertyManagementModule/clients/client/public/shared/sections/footerSection.tsx";
import CtaSection from "@propertyManagementModule/clients/client/public/shared/sections/ctaSection.tsx";
import InvestorsHeroTitleSection from "@propertyManagementModule/clients/client/public/investors/sections/investorsHeroTitleSection.tsx";
import InvestorsHeroStripSection from "@propertyManagementModule/clients/client/public/investors/sections/investorsHeroStripSection.tsx";
import InvestorsOwnershipSection from "@propertyManagementModule/clients/client/public/investors/sections/investorsOwnershipSection.tsx";
import InvestorsIncomeSection from "@propertyManagementModule/clients/client/public/investors/sections/investorsIncomeSection.tsx";
import InvestorsPathSection from "@propertyManagementModule/clients/client/public/investors/sections/investorsPathSection.tsx";
import InvestorsCatalogSection from "@propertyManagementModule/clients/client/public/investors/sections/investorsCatalogSection.tsx";
import InvestorsAlbaniaSection from "@propertyManagementModule/clients/client/public/investors/sections/investorsAlbaniaSection.tsx";
import InvestorsFaqSection from "@propertyManagementModule/clients/client/public/investors/sections/investorsFaqSection.tsx";

function InvestorsPage(props: WithLanguageType) {
    return (
        <PublicPageShell nodeId="331:2854" nodeName="For investors">
            <PublicSection>
                <PageHeaderSection variant="light" />
            </PublicSection>
            <PublicSection nodeId="368:4868">
                <InvestorsHeroTitleSection {...props} />
            </PublicSection>
            <PublicSection nodeId="368:4865" flush fullBleed>
                <InvestorsHeroStripSection />
            </PublicSection>
            <PublicSection nodeId="368:4869">
                <InvestorsOwnershipSection {...props} />
            </PublicSection>
            <PublicSection nodeId="357:4708" flush fullBleed>
                <InvestorsIncomeSection {...props} />
            </PublicSection>
            <PublicSection nodeId="357:4704">
                <InvestorsPathSection {...props} />
            </PublicSection>
            <PublicSection nodeId="353:553" flush fullBleed>
                <InvestorsCatalogSection {...props} />
            </PublicSection>
            <PublicSection nodeId="353:537" flush>
                <InvestorsAlbaniaSection {...props} />
            </PublicSection>
            <PublicSection nodeId="352:310" flush contentFrame>
                <InvestorsFaqSection {...props} />
            </PublicSection>
            <PublicSection nodeId="331:2855">
                <CtaSection resolveLanguageKey={props.resolveLanguageKey} />
            </PublicSection>
            <PublicSection nodeId="331:2875" flush fullBleed>
                <FooterSection />
            </PublicSection>
        </PublicPageShell>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/client/public/investors/index.tsx"),
    withDebug(true, true),
)(InvestorsPage);
