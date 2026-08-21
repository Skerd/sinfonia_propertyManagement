import {useEffect, useRef, useState} from "react";
import {compose} from "redux";
import {useNavigate, useSearchParams} from "react-router-dom";
import {ChevronLeft} from "lucide-react";
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
import PropertyContactFormModal from "@propertyManagementModule/clients/client/public/property/sections/propertyContactFormModal.tsx";
import PublicFavoriteHeartButton from "@propertyManagementModule/clients/client/public/shared/favorites/publicFavoriteHeartButton.tsx";
import {MarketingUnitSingle} from "@propertyManagementModule/clients/client/public/shared/publicTypes.ts";
import {PUBLIC_GALLERY_PAGE_TITLE} from "@propertyManagementModule/clients/client/public/shared/layout/publicLayoutTokens.ts";

type MarketingUnitResponse = {unit: MarketingUnitSingle};

type PropertyPageProps = WithLanguageType & WithAxiosType<MarketingUnitResponse, {projectId: string; unitId: string}>;

function PropertyPage(props: PropertyPageProps) {
    const {resolveLanguageKey, currentLanguage, languageCode, data, loading, error, onFilterChange} = props;
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const projectId = searchParams.get("projectId") ?? "";
    const unitId = searchParams.get("unitId") ?? "";
    const unit = data?.unit;
    const requestedKeyRef = useRef("");
    const [contactOpen, setContactOpen] = useState(false);
    const [contactTitle, setContactTitle] = useState<string | undefined>(undefined);
    const [contactMode, setContactMode] = useState<"requestInfo" | "reserve">("requestInfo");

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

    const handleBack = () => {
        const historyIdx = (window.history.state as {idx?: number} | null)?.idx;
        if (typeof historyIdx === "number" && historyIdx > 0) {
            navigate(-1);
            return;
        }
        navigate(projectId ? `/project?projectId=${projectId}` : "/projects");
    };

    const openContactForm = (titleKey: "requestInfo" | "reserveOnline") => {
        setContactMode(titleKey === "reserveOnline" ? "reserve" : "requestInfo");
        setContactTitle(resolveLanguageKey(titleKey));
        setContactOpen(true);
    };

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
                    <div className="grid w-full grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
                        <div className="min-w-0 lg:col-span-7 xl:col-span-8">
                            <PropertyDetailsSection
                                {...props}
                                unit={unit}
                                onRequestInfo={() => openContactForm("requestInfo")}
                            />
                        </div>
                        <div className="min-w-0 lg:col-span-5 xl:col-span-4">
                            <PropertySidebarSection
                                {...props}
                                unit={unit}
                                onReserve={() => openContactForm("reserveOnline")}
                            />
                        </div>
                    </div>
                </PublicSection>
                <PropertyContactFormModal
                    open={contactOpen}
                    onClose={() => setContactOpen(false)}
                    projectId={unit.projectId || projectId}
                    unitId={unit._id}
                    unitName={unit.name}
                    mode={contactMode}
                    title={contactTitle}
                    resolveLanguageKey={resolveLanguageKey}
                    currentLanguage={currentLanguage}
                    languageCode={languageCode}
                />
            </>
        );
    }

    return (
        <PublicPageShell nodeId="515:4258" nodeName="Property view">
            <PublicSection flush fullBleed>
                <PageHeaderSection variant="light" />
            </PublicSection>
            <PublicSection flush contentFrame>
                <div className="flex min-w-0 items-center gap-2 sm:gap-3 md:gap-4">
                    <button
                        type="button"
                        onClick={handleBack}
                        className="-ml-2 flex shrink-0 items-center justify-center rounded-[5px] p-1 text-pronix-ink transition hover:bg-[rgba(24,24,24,0.04)] sm:-ml-2.5 md:-ml-3"
                        aria-label={String(resolveLanguageKey("back"))}
                    >
                        <ChevronLeft className="size-8 sm:size-10 md:size-12" strokeWidth={1.5} aria-hidden />
                    </button>
                    {unit?.name ? (
                        <h1 className={`min-w-0 flex-1 wrap-break-word ${PUBLIC_GALLERY_PAGE_TITLE}`}>{unit.name}</h1>
                    ) : null}
                    {unit ? (
                        <PublicFavoriteHeartButton
                            kind="unit"
                            projectId={unit.projectId || projectId}
                            unit={{
                                _id: unit._id,
                                name: unit.name,
                                status: unit.status,
                                floorLabel: unit.floorLabel,
                                price: unit.price,
                                imageUrl: unit.mainImage ?? unit.imageGallery?.[0],
                            }}
                            addLabel={String(resolveLanguageKey("favoritesAdd"))}
                            removeLabel={String(resolveLanguageKey("favoritesRemove"))}
                        />
                    ) : null}
                </div>
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
