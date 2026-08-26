import {useEffect, useState} from "react";
import {Link} from "react-router-dom";
import {ArrowUpRight, X} from "lucide-react";
import Loader from "@coreModule/components/custom/loader.tsx";
import apiClient from "@coreModule/helpers/axiosClients/apiClient.ts";
import DyeusMarketingContactForm from "@propertyManagementModule/clients/client/dyeus/shared/dyeusMarketingContactForm.tsx";
import DyeusPropertyGallerySection from "@propertyManagementModule/clients/client/dyeus/property/sections/dyeusPropertyGallerySection.tsx";
import DyeusPropertyDetailsSection from "@propertyManagementModule/clients/client/dyeus/property/sections/dyeusPropertyDetailsSection.tsx";
import DyeusPropertySidebarSection from "@propertyManagementModule/clients/client/dyeus/property/sections/dyeusPropertySidebarSection.tsx";
import {useDyeusT} from "@propertyManagementModule/clients/client/dyeus/shared/useDyeusT.ts";
import {
    fillLanguageTemplate,
    type MarketingUnitSingle,
} from "@propertyManagementModule/clients/client/public/shared/publicTypes.ts";

const PROPERTY_LANGUAGE_PATH =
    "src/modules/propertyManagement/clients/client/dyeus/property/index.tsx";

type DyeusUnitPanelProps = {
    projectId: string;
    unitId: string;
    unitLabel?: string;
    onClose: () => void;
};

type MarketingUnitResponse = {unit: MarketingUnitSingle};
type ContactMode = "requestInfo" | "reserve";

function DyeusUnitPanel({projectId, unitId, unitLabel, onClose}: DyeusUnitPanelProps) {
    const {t} = useDyeusT(PROPERTY_LANGUAGE_PATH);
    const [unit, setUnit] = useState<MarketingUnitSingle | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [contactOpen, setContactOpen] = useState(false);
    const [contactMode, setContactMode] = useState<ContactMode>("requestInfo");

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError(false);
        setUnit(null);

        apiClient
            .post<MarketingUnitResponse>("/api/realEstate/marketingUnit/single", {projectId, unitId})
            .then((response) => {
                if (cancelled) return;
                const nextUnit = response.data?.unit;
                if (!nextUnit) {
                    setError(true);
                    return;
                }
                setUnit(nextUnit);
            })
            .catch(() => {
                if (!cancelled) setError(true);
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [projectId, unitId]);

    useEffect(() => {
        if (!contactOpen) return;
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") setContactOpen(false);
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [contactOpen]);

    const openContactForm = (mode: ContactMode) => {
        setContactMode(mode);
        setContactOpen(true);
    };

    const propertyHref = `/property?projectId=${projectId}&unitId=${unitId}`;

    return (
        <aside
            className="flex h-full min-h-0 w-full max-h-full flex-col overflow-hidden bg-dyeus-cream text-dyeus-ink"
            data-node-id="dyeus-unit-panel"
        >
            <div className="flex shrink-0 items-start justify-between gap-3 border-b border-dyeus-border px-5 py-4 md:px-6">
                <div className="min-w-0 flex-1">
                    <h2 className="min-w-0 wrap-break-word font-dyeus-serif text-xl leading-[1.15] text-dyeus-ink md:text-2xl">
                        {unit?.name || unitLabel || t("formUnitLabel")}
                    </h2>
                    <Link
                        to={propertyHref}
                        className="mt-2 inline-flex items-center gap-1 font-dyeus-sans text-xs uppercase tracking-[0.16em] text-dyeus-bronze transition hover:text-dyeus-ink"
                    >
                        {t("viewFullResidence")}
                        <ArrowUpRight className="size-3.5" strokeWidth={1.75} aria-hidden />
                    </Link>
                </div>
                <button
                    type="button"
                    onClick={onClose}
                    className="-mr-1 -mt-0.5 flex size-9 shrink-0 cursor-pointer items-center justify-center text-dyeus-ink transition hover:text-dyeus-bronze"
                    aria-label={t("closeUnitPanel")}
                >
                    <X className="size-4" strokeWidth={1.5} aria-hidden />
                </button>
            </div>

            <div className="h-0 min-h-0 flex-1 overflow-y-auto px-5 py-4 md:px-6 md:py-5">
                {loading ? (
                    <div className="flex min-h-[240px] items-center justify-center">
                        <Loader />
                    </div>
                ) : error || !unit ? (
                    <p className="font-dyeus-sans text-sm text-dyeus-ink-muted">{t("loadError")}</p>
                ) : (
                    <div className="flex flex-col gap-5">
                        <DyeusPropertyGallerySection compact unit={unit} t={t} />
                        <DyeusPropertySidebarSection
                            compact
                            unit={unit}
                            t={t}
                            onReserve={() => openContactForm("reserve")}
                        />
                        <DyeusPropertyDetailsSection
                            compact
                            unit={unit}
                            t={t}
                            onRequestInfo={() => openContactForm("requestInfo")}
                        />
                    </div>
                )}
            </div>

            {contactOpen && unit ? (
                <div
                    className="fixed inset-0 z-[180] flex items-center justify-center bg-dyeus-ink/40 p-4"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="dyeus-unit-panel-contact-title"
                    onClick={() => setContactOpen(false)}
                >
                    <div
                        className="w-full max-w-md bg-dyeus-cream p-6 shadow-lg md:p-8"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h3
                                    id="dyeus-unit-panel-contact-title"
                                    className="font-dyeus-serif text-3xl"
                                >
                                    {t(contactMode === "reserve" ? "reserveOnline" : "requestInfo")}
                                </h3>
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
        </aside>
    );
}

export default DyeusUnitPanel;
