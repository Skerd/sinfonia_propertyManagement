import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import PublicPageShell from "@propertyManagementModule/clients/client/public/shared/layout/publicPageShell.tsx";
import PublicSection from "@propertyManagementModule/clients/client/public/shared/layout/publicSection.tsx";
import PageHeaderSection from "@propertyManagementModule/clients/client/public/shared/sections/pageHeaderSection.tsx";
import ContactContentSection from "@propertyManagementModule/clients/client/public/contact/sections/contactContentSection.tsx";

function ContactPage(props: WithLanguageType) {
    return (
        <PublicPageShell nodeId="305:228" nodeName="Contact us">
            <PublicSection flush>
                <PageHeaderSection variant="light" />
            </PublicSection>
            <PublicSection className="pt-2 pb-6 md:pt-4 md:pb-10 lg:pt-0 lg:pb-12">
                <ContactContentSection {...props} />
            </PublicSection>
        </PublicPageShell>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/client/public/contact/index.tsx"),
    withDebug(true, true),
)(ContactPage);
