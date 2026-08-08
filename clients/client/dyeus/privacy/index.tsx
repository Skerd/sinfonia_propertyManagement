import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import DyeusLegalPage from "@propertyManagementModule/clients/client/dyeus/shared/dyeusLegalPage.tsx";

function PrivacyPage({resolveLanguageKey}: WithLanguageType) {
    const t = (key: string) => String(resolveLanguageKey(key));
    const sections = Array.from({length: 8}, (_, index) => {
        const n = index + 1;
        return {
            title: t(`section${n}Title`),
            body: t(`section${n}Body`),
        };
    });

    return (
        <DyeusLegalPage
            nodeId="44:privacy"
            nodeName={t("pageTitle")}
            eyebrow={t("eyebrow")}
            title={t("pageTitle")}
            lastUpdated={t("lastUpdated")}
            intro={t("intro")}
            sections={sections}
        />
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/client/dyeus/privacy/index.tsx"),
    withDebug(true, true),
)(PrivacyPage);
