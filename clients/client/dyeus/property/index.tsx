import {useEffect, useRef, useState} from "react";
import {compose} from "redux";
import {useNavigate, useSearchParams} from "react-router-dom";
import {ChevronLeft} from "lucide-react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import Loader from "@coreModule/components/custom/loader.tsx";
import DyeusPageShell from "@propertyManagementModule/clients/client/dyeus/shared/dyeusPageShell.tsx";
import DyeusHeader from "@propertyManagementModule/clients/client/dyeus/shared/dyeusHeader.tsx";
import DyeusFooter from "@propertyManagementModule/clients/client/dyeus/shared/dyeusFooter.tsx";
import DyeusMarketingContactForm from "@propertyManagementModule/clients/client/dyeus/shared/dyeusMarketingContactForm.tsx";
import DyeusPropertyGallerySection from "@propertyManagementModule/clients/client/dyeus/property/sections/dyeusPropertyGallerySection.tsx";
import DyeusPropertyDetailsSection from "@propertyManagementModule/clients/client/dyeus/property/sections/dyeusPropertyDetailsSection.tsx";
import DyeusPropertySidebarSection from "@propertyManagementModule/clients/client/dyeus/property/sections/dyeusPropertySidebarSection.tsx";
import {
    fillLanguageTemplate,
    type MarketingUnitSingle,
} from "@propertyManagementModule/clients/client/public/shared/publicTypes.ts";

type MarketingUnitResponse = {unit: MarketingUnitSingle};
type PropertyPageProps = WithLanguageType &
    WithAxiosType<MarketingUnitResponse, {projectId: string; unitId: string}>;
type ContactMode = "requestInfo" | "reserve";

function PropertyPage({data, loading, error, onFilterChange, resolveLanguageKey}: PropertyPageProps) {
    const t = (key: string) => String(resolveLanguageKey(key));
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const projectId = searchParams.get("projectId") ?? "";
    const unitId = searchParams.get("unitId") ?? "";
    const unit = data?.unit;
    const requestedKeyRef = useRef("");
    const [contactOpen, setContactOpen] = useState(false);
    const [contactMode, setContactMode] = useState<ContactMode>("requestInfo");

    useEffect(() => {
        if (!contactOpen) return;
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") setContactOpen(false);
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [contactOpen]);

    const hasRequiredParams = Boolean(projectId && unitId);
    const isWaitingForFetch = hasRequiredParams && !unit && !error;
    const showLoader = !unit && (loading || isWaitingForFetch);

    useEffect(() => {
        const requestedKey = `${projectId}:${unitId}`;
        if (!projectId || !unitId) {
            requestedKeyRef.current = "";
            return;
        }
        if (requestedKeyRef.current === requestedKey) return;
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
        navigate(projectId ? `/residences?projectId=${projectId}` : "/residences");
    };

    const openContactForm = (mode: ContactMode) => {
        setContactMode(mode);
        setContactOpen(true);
    };

    function renderMainContent() {
        if (!hasRequiredParams) {
            return <p className="font-dyeus-serif text-lg text-dyeus-ink-muted md:text-2xl">{t("missingParams")}</p>;
        }

        if (error) {
            return (
                <div>
                    <p className="font-dyeus-serif text-lg text-dyeus-ink-muted md:text-2xl">{t("loadError")}</p>
                    {error.message ? (
                        <p className="mt-3 font-dyeus-serif text-base text-dyeus-ink-muted md:text-lg">
                            {error.message}
                        </p>
                    ) : null}
                </div>
            );
        }

        if (showLoader) {
            return (
                <div className="flex min-h-[400px] items-center justify-center">
                    <Loader />
                </div>
            );
        }

        if (!unit) {
            return <p className="font-dyeus-serif text-lg text-dyeus-ink-muted md:text-2xl">{t("notFound")}</p>;
        }

        return (
            <>
                <DyeusPropertyGallerySection unit={unit} t={t} />
                <div className="mt-8 grid w-full grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10 md:mt-12">
                    <div className="min-w-0 lg:col-span-7 xl:col-span-8">
                        <DyeusPropertyDetailsSection
                            unit={unit}
                            t={t}
                            onRequestInfo={() => openContactForm("requestInfo")}
                        />
                    </div>
                    <div className="min-w-0 lg:col-span-5 xl:col-span-4">
                        <DyeusPropertySidebarSection
                            unit={unit}
                            t={t}
                            onReserve={() => openContactForm("reserve")}
                        />
                    </div>
                </div>
            </>
        );
    }

    return (
        <DyeusPageShell nodeId="44:property" nodeName="Property">
            <div className="relative">
                <DyeusHeader variant="solid" />
                <div className="mx-auto max-w-[1728px] px-6 pb-20 pt-28 md:px-[60px] md:pt-36">
                    <div className="mb-8 flex min-w-0 items-center gap-2 sm:gap-3 md:mb-10 md:gap-4">
                        <button
                            type="button"
                            onClick={handleBack}
                            className="-ml-2 flex shrink-0 items-center justify-center p-1 text-dyeus-ink transition hover:text-dyeus-bronze sm:-ml-2.5 md:-ml-3"
                            aria-label={t("back")}
                        >
                            <ChevronLeft className="size-8 sm:size-10 md:size-12" strokeWidth={1.5} aria-hidden />
                        </button>
                        {unit?.name ? (
                            <h1 className="min-w-0 flex-1 font-dyeus-serif text-4xl font-bold leading-[1.1] text-dyeus-ink sm:text-5xl md:text-6xl lg:text-7xl">
                                {unit.name}
                            </h1>
                        ) : null}
                    </div>
                    {renderMainContent()}
                </div>
            </div>

            {contactOpen && unit ? (
                <div
                    className="fixed inset-0 z-[180] flex items-center justify-center bg-dyeus-ink/40 p-4"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="dyeus-property-contact-title"
                    onClick={() => setContactOpen(false)}
                >
                    <div
                        className="w-full max-w-md bg-dyeus-cream p-6 shadow-lg md:p-8"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h2
                                    id="dyeus-property-contact-title"
                                    className="font-dyeus-serif text-3xl"
                                >
                                    {t(contactMode === "reserve" ? "reserveOnline" : "requestInfo")}
                                </h2>
                                <p className="mt-1 font-dyeus-sans text-sm text-dyeus-ink-muted">
                                    {t("formUnitLabel")}: {unit.name}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setContactOpen(false)}
                                className="cursor-pointer font-dyeus-sans text-xs uppercase tracking-[0.18em] text-dyeus-ink-muted transition hover:text-dyeus-ink"
                            >
                                {t("close")}
                            </button>
                        </div>
                        <DyeusMarketingContactForm
                            key={`${contactMode}:${projectId}:${unitId}`}
                            className="mt-6"
                            lockInterestToReservation={contactMode === "reserve"}
                            projectInterest={projectId}
                            unitInterest={unitId}
                            defaultMessage={fillLanguageTemplate(t("defaultMessage"), {name: unit.name})}
                            submitLabel={t("send")}
                        />
                    </div>
                </div>
            ) : null}

            <DyeusFooter />
        </DyeusPageShell>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/client/dyeus/property/index.tsx"),
    withAxios<MarketingUnitResponse, {projectId: string; unitId: string}>(
        {method: "post", url: "/api/realEstate/marketingUnit/single", data: {}},
        true,
    ),
    withDebug(true, true),
)(PropertyPage);
