import {useEffect, useRef} from "react";
import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import PublicPageShell from "@propertyManagementModule/clients/client/public/shared/layout/publicPageShell.tsx";
import PublicSection from "@propertyManagementModule/clients/client/public/shared/layout/publicSection.tsx";
import PageHeaderSection from "@propertyManagementModule/clients/client/public/shared/sections/pageHeaderSection.tsx";
import FooterSection from "@propertyManagementModule/clients/client/public/shared/sections/footerSection.tsx";
import {
    PUBLIC_BODY,
    PUBLIC_HEADING,
    PUBLIC_SUBTITLE,
    PUBLIC_TITLE,
} from "@propertyManagementModule/clients/client/public/shared/layout/publicLayoutTokens.ts";
import {
    fillLanguageTemplate,
    type MarketingCompanyResponse,
} from "@propertyManagementModule/clients/client/public/shared/publicTypes.ts";

export type LegalSectionSpec = {
    titleKey: string;
    bodyKey: string;
};

type CreateLegalPageOptions = {
    languagePath: string;
    nodeId: string;
    nodeName: string;
    sections: LegalSectionSpec[];
};

type LegalPageProps = WithLanguageType & WithAxiosType<MarketingCompanyResponse>;

export function createLegalPage({languagePath, nodeId, nodeName, sections}: CreateLegalPageOptions) {
    function LegalPage({resolveLanguageKey, data, onFilterChange}: LegalPageProps) {
        const initialFetchDone = useRef(false);

        useEffect(() => {
            if (initialFetchDone.current) {
                return;
            }
            initialFetchDone.current = true;
            onFilterChange({});
        }, []);

        const companyEmail = data?.email?.trim() || "";
        const t = (key: string) =>
            fillLanguageTemplate(String(resolveLanguageKey(key)), {
                email: companyEmail || "—",
            });

        return (
            <PublicPageShell nodeId={nodeId} nodeName={nodeName}>
                <PublicSection flush>
                    <PageHeaderSection variant="light" />
                </PublicSection>
                <PublicSection>
                    <article className="mx-auto w-full max-w-4xl">
                        <h1 className={PUBLIC_TITLE}>{t("pageTitle")}</h1>
                        <p className={`mt-4 ${PUBLIC_SUBTITLE} text-pronix-ink-muted`}>{t("lastUpdated")}</p>
                        <p className={`mt-8 ${PUBLIC_BODY}`}>{t("intro")}</p>
                        <div className="mt-12 flex flex-col gap-10 md:gap-12">
                            {sections.map((section) => (
                                <section key={section.titleKey}>
                                    <h2 className={PUBLIC_HEADING}>{t(section.titleKey)}</h2>
                                    <p className={`mt-3 whitespace-pre-line ${PUBLIC_BODY}`}>{t(section.bodyKey)}</p>
                                </section>
                            ))}
                        </div>
                    </article>
                </PublicSection>
                <PublicSection flush fullBleed>
                    <FooterSection />
                </PublicSection>
            </PublicPageShell>
        );
    }

    return compose(
        withLanguage(languagePath),
        withAxios<MarketingCompanyResponse>({method: "post", url: "/api/realEstate/marketingCompany", data: {}}, true),
        withDebug(true, true),
    )(LegalPage);
}
