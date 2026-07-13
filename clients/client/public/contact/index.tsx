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
            <PublicSection>
                <PageHeaderSection variant="light" />
            </PublicSection>
            <PublicSection>
                <ContactContentSection {...props} />
            </PublicSection>
        </PublicPageShell>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/client/public/contact/index.tsx"),
    withDebug(true, true),
)(ContactPage);
