import {createLegalPage} from "@propertyManagementModule/clients/client/public/shared/createLegalPage.tsx";

const PRIVACY_SECTIONS = [
    {titleKey: "section1Title", bodyKey: "section1Body"},
    {titleKey: "section2Title", bodyKey: "section2Body"},
    {titleKey: "section3Title", bodyKey: "section3Body"},
    {titleKey: "section4Title", bodyKey: "section4Body"},
    {titleKey: "section5Title", bodyKey: "section5Body"},
    {titleKey: "section6Title", bodyKey: "section6Body"},
    {titleKey: "section7Title", bodyKey: "section7Body"},
    {titleKey: "section8Title", bodyKey: "section8Body"},
] as const;

export default createLegalPage({
    languagePath: "src/modules/propertyManagement/clients/client/public/privacy/index.tsx",
    nodeId: "legal:privacy",
    nodeName: "Privacy Policy",
    sections: [...PRIVACY_SECTIONS],
});
