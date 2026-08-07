import {compose} from "redux";
import withLanguage from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import DyeusLegalPage from "@propertyManagementModule/clients/client/dyeus/shared/dyeusLegalPage.tsx";

const TERMS_SECTIONS = [
    {
        title: "Acceptance of terms",
        body: "By accessing or using the Dyeus Residences website, you confirm that you are legally able to enter into these Terms and that you will comply with them. If you do not agree, do not use the website.",
    },
    {
        title: "The Dyeus website",
        body: "This website presents information about Dyeus Residences, including residences, amenities, location, and related project content. Property availability, pricing, floor plans, and specifications may change and are not a binding offer unless confirmed in a signed agreement.\n\nNothing on the website constitutes legal, tax, or investment advice.",
    },
    {
        title: "Enquiries and reservations",
        body: "Submitting a contact form or reservation enquiry does not create a purchase contract. Any sale, reservation, or related commitment is subject to separate documentation, disclosures, and applicable law.",
    },
    {
        title: "Acceptable use",
        body: "You agree not to misuse the website, including by attempting unauthorized access, disrupting services, scraping content in violation of these Terms, submitting false information, or using the site for unlawful purposes.",
    },
    {
        title: "Intellectual property",
        body: "Dyeus Residences and its licensors own the website content, branding, imagery, software, and design, except for content you lawfully provide. You may not copy, modify, or distribute Dyeus materials without prior written permission, except as allowed by law.",
    },
    {
        title: "Disclaimers",
        body: "The website and its content are provided on an “as is” and “as available” basis. To the fullest extent permitted by law, Dyeus Residences disclaims warranties of merchantability, fitness for a particular purpose, and non-infringement.\n\nImages, renders, and descriptions are illustrative and may differ from the finished residences.",
    },
    {
        title: "Limitation of liability",
        body: "To the fullest extent permitted by law, Dyeus Residences is not liable for indirect, incidental, special, consequential, or punitive damages, or for loss of profits, data, or business opportunities arising from your use of the website.\n\nNothing in these Terms excludes liability that cannot be excluded under applicable law.",
    },
    {
        title: "Changes, governing law, and contact",
        body: "We may update these Terms periodically. The “Last updated” date will change when we do. Continued use after changes means you accept the updated Terms.\n\nThese Terms are governed by the laws applicable to Dyeus Residences’ operations in Albania, without prejudice to mandatory consumer protections that may apply where you live.\n\nQuestions about these Terms: use the Contact page on this website.",
    },
] as const;

function TermsPage() {
    return (
        <DyeusLegalPage
            nodeId="44:terms"
            nodeName="Terms of Conditions"
            eyebrow="Legal"
            title="Terms of Conditions"
            lastUpdated="Last updated: August 7, 2026"
            intro="These Terms of Conditions (“Terms”) govern your access to and use of the Dyeus Residences website. By using this website, you agree to these Terms."
            sections={TERMS_SECTIONS}
        />
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/client/dyeus/terms/index.tsx"),
    withDebug(true, true),
)(TermsPage);
