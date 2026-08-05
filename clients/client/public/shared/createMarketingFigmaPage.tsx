import {compose} from "redux";
import {type ReactNode} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import PublicPageShell from "@propertyManagementModule/clients/client/public/shared/layout/publicPageShell.tsx";
import PublicSection from "@propertyManagementModule/clients/client/public/shared/layout/publicSection.tsx";
import PageHeaderSection from "@propertyManagementModule/clients/client/public/shared/sections/pageHeaderSection.tsx";
import FooterSection from "@propertyManagementModule/clients/client/public/shared/sections/footerSection.tsx";
import MarketingTextSection, {type MarketingBlock} from "@propertyManagementModule/clients/client/public/shared/sections/marketingTextSection.tsx";

export type {MarketingBlock};

export function createPublicMarketingPage(
    languagePath: string,
    nodeId: string,
    nodeName: string,
    blocks: MarketingBlock[],
    options?: {includeFooter?: boolean},
) {
    function Page(props: WithLanguageType) {
        const {resolveLanguageKey, currentLanguage, languageCode} = props;

        const sections: ReactNode[] = [
            <PublicSection key="header" flush>
                <PageHeaderSection variant="light" />
            </PublicSection>,
            ...blocks.map((block) => (
                <PublicSection key={block.nodeId ?? block.titleKey} nodeId={block.nodeId}>
                    <MarketingTextSection
                        resolveLanguageKey={resolveLanguageKey}
                        currentLanguage={currentLanguage}
                        languageCode={languageCode}
                        block={block}
                    />
                </PublicSection>
            )),
        ];

        if (options?.includeFooter !== false) {
            sections.push(
                <PublicSection key="footer" flush fullBleed>
                    <FooterSection />
                </PublicSection>,
            );
        }

        return (
            <PublicPageShell nodeId={nodeId} nodeName={nodeName}>
                {sections}
            </PublicPageShell>
        );
    }

    return compose(withLanguage(languagePath), withDebug(true, true))(Page);
}

/** @deprecated Use createPublicMarketingPage */
export const createMarketingFigmaPage = createPublicMarketingPage;
