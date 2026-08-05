import {useEffect, useRef} from "react";
import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import PublicPageShell from "@propertyManagementModule/clients/client/public/shared/layout/publicPageShell.tsx";
import PublicSection from "@propertyManagementModule/clients/client/public/shared/layout/publicSection.tsx";
import PageHeaderSection from "@propertyManagementModule/clients/client/public/shared/sections/pageHeaderSection.tsx";
import ProjectsGallerySection from "@propertyManagementModule/clients/client/public/projects/sections/projectsGallerySection.tsx";
import FooterSection from "@propertyManagementModule/clients/client/public/home/sections/footerSection.tsx";
import CtaSection from "@propertyManagementModule/clients/client/public/home/sections/ctaSection.tsx";
import {MarketingProjectsCatalogResponse} from "@propertyManagementModule/clients/client/public/shared/publicTypes.ts";

type ProjectsPageProps = WithLanguageType & WithAxiosType<MarketingProjectsCatalogResponse>;

function ProjectsPage(props: ProjectsPageProps) {
    const {onFilterChange} = props;
    const initialFetchDone = useRef(false);

    useEffect(() => {
        if (initialFetchDone.current) {
            return;
        }
        initialFetchDone.current = true;
        onFilterChange({});
        // Intentionally mount-only: onFilterChange identity changes every withAxios render.
    }, []);

    return (
        <PublicPageShell nodeId="268:235" nodeName="Projects Gallery">
            <PublicSection flush>
                <PageHeaderSection variant="light" />
            </PublicSection>
            <PublicSection nodeId="278:690" className="pt-2 pb-8 md:pt-4 md:pb-12 lg:pt-0 lg:pb-16">
                <ProjectsGallerySection {...props} />
            </PublicSection>
            <PublicSection nodeId="268:759">
                <CtaSection />
            </PublicSection>
            <PublicSection nodeId="268:779" flush fullBleed>
                <FooterSection />
            </PublicSection>
        </PublicPageShell>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/client/public/projects/index.tsx"),
    withAxios<MarketingProjectsCatalogResponse>({method: "post", url: "/api/realEstate/marketingProjectsCatalog", data: {}}, true),
    withDebug(true, true),
)(ProjectsPage);
