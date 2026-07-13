import {useEffect, useRef} from "react";
import {compose} from "redux";
import {Link, useSearchParams} from "react-router-dom";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import Loader from "@coreModule/components/custom/loader.tsx";
import PublicPageShell from "@propertyManagementModule/clients/client/public/shared/layout/publicPageShell.tsx";
import PublicSection from "@propertyManagementModule/clients/client/public/shared/layout/publicSection.tsx";
import PageHeaderSection from "@propertyManagementModule/clients/client/public/shared/sections/pageHeaderSection.tsx";
import FooterSection from "@propertyManagementModule/clients/client/public/home/sections/footerSection.tsx";
import PropertyGallerySection from "@propertyManagementModule/clients/client/public/property/sections/propertyGallerySection.tsx";
import PropertyDetailsSection from "@propertyManagementModule/clients/client/public/property/sections/propertyDetailsSection.tsx";
import PropertySidebarSection from "@propertyManagementModule/clients/client/public/property/sections/propertySidebarSection.tsx";
import {MarketingUnitSingle} from "@propertyManagementModule/clients/client/public/shared/publicTypes.ts";

type MarketingUnitResponse = {unit: MarketingUnitSingle};

type PropertyPageProps = WithLanguageType & WithAxiosType<MarketingUnitResponse, {projectId: string; unitId: string}>;

function PropertyPage(props: PropertyPageProps) {
    const {resolveLanguageKey, data, loading, error, onFilterChange} = props;
    const [searchParams] = useSearchParams();
    const projectId = searchParams.get("projectId") ?? "";
    const unitId = searchParams.get("unitId") ?? "";
    const unit = data?.unit;
    const requestedKeyRef = useRef("");

    const hasRequiredParams = Boolean(projectId && unitId);
    const isWaitingForFetch = hasRequiredParams && !unit && !error;
    const showLoader = !unit && (loading || isWaitingForFetch);

    useEffect(() => {
        const requestedKey = `${projectId}:${unitId}`;
        if (!projectId || !unitId) {
            requestedKeyRef.current = "";
            return;
        }
        if (requestedKeyRef.current === requestedKey) {
            return;
        }
        requestedKeyRef.current = requestedKey;
        onFilterChange({projectId, unitId});
        // onFilterChange identity changes every withAxios render — do not add to deps.
    }, [projectId, unitId]);

    function renderMainContent() {
        if (!hasRequiredParams) {
            return (
                <PublicSection>
                    <p className="font-aeonik-light text-lg text-pronix-ink-muted not-italic md:text-2xl">
                        {resolveLanguageKey("missingParams")}
                    </p>
                </PublicSection>
            );
        }

        if (error) {
            return (
                <PublicSection>
                    <p className="font-aeonik-light text-lg text-pronix-ink-muted not-italic md:text-2xl">
                        {resolveLanguageKey("loadError")}
                    </p>
                    {error.message ? (
                        <p className="mt-3 font-aeonik-light text-base text-pronix-ink-muted not-italic md:text-lg">
                            {error.message}
                        </p>
                    ) : null}
                </PublicSection>
            );
        }

        if (showLoader) {
            return (
                <PublicSection>
                    <div className="flex min-h-[400px] items-center justify-center">
                        <Loader />
                    </div>
                </PublicSection>
            );
        }

        if (!unit) {
            return (
                <PublicSection>
                    <p className="font-aeonik-light text-lg text-pronix-ink-muted not-italic md:text-2xl">
                        {resolveLanguageKey("notFound")}
                    </p>
                </PublicSection>
            );
        }

        return (
            <>
                <PublicSection nodeId="515:4305">
                    <PropertyGallerySection unit={unit} />
                </PublicSection>
                <PublicSection nodeId="515:6131">
                    <PropertyDetailsSection {...props} unit={unit} />
                </PublicSection>
                <PublicSection nodeId="515:6253">
                    <PropertySidebarSection {...props} unit={unit} />
                </PublicSection>
            </>
        );
    }

    return (
        <PublicPageShell nodeId="515:4258" nodeName="Property view">
            <PublicSection fullBleed>
                <PageHeaderSection variant="light" />
            </PublicSection>
            <PublicSection>
                <Link
                    to={projectId ? `/project/grid?projectId=${projectId}` : "/projects"}
                    className="font-aeonik-light text-base text-pronix-blue hover:underline md:text-lg"
                >
                    ← {resolveLanguageKey("back")}
                </Link>
            </PublicSection>
            {renderMainContent()}
            <PublicSection nodeId="522:8572" flush fullBleed>
                <FooterSection />
            </PublicSection>
        </PublicPageShell>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/client/public/property/index.tsx"),
    withAxios<MarketingUnitResponse, {projectId: string; unitId: string}>(
        {method: "post", url: "/api/realEstate/marketingUnit/single", data: {}},
        true,
    ),
    withDebug(true, true),
)(PropertyPage);
