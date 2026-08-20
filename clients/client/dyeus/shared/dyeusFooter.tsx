import {useEffect, useState} from "react";
import {Link} from "react-router-dom";
import {dyeusAssets} from "@propertyManagementModule/clients/client/dyeus/shared/dyeusAssets.ts";
import DyeusMarketingContactForm from "@propertyManagementModule/clients/client/dyeus/shared/dyeusMarketingContactForm.tsx";
import {useDyeusProjectId} from "@propertyManagementModule/clients/client/dyeus/shared/useDyeusProjectId.ts";
import {
    useDyeusT,
    type DyeusTranslate,
} from "@propertyManagementModule/clients/client/dyeus/shared/useDyeusT.ts";
import apiClient from "@coreModule/helpers/axiosClients/apiClient.ts";
import type {MarketingProject} from "@propertyManagementModule/clients/client/public/shared/publicTypes.ts";

const FOOTER_LANGUAGE_PATH =
    "src/modules/propertyManagement/clients/client/dyeus/shared/dyeusFooter.tsx";

const exploreLinks = [
    {labelKey: "navAbout", to: "/about"},
    {labelKey: "navResidences", to: "/residences"},
    {labelKey: "navGallery", to: "/gallery"},
    {labelKey: "navJournal", to: "/journal"},
] as const;

const moreLinks = [
    {labelKey: "privacy", to: "/privacy"},
    {labelKey: "terms", to: "/terms"},
] as const;

const footerLinkClassName =
    "font-dyeus-serif text-xl leading-[1.2] text-dyeus-ink underline decoration-transparent underline-offset-4 transition-[color,text-decoration-color] duration-300 hover:text-dyeus-bronze hover:decoration-dyeus-bronze";

type CatalogResponse = {
    projects?: MarketingProject[];
};

type AvailabilityStats = {
    soldUnitCount: number;
    unitCount: number;
};

type SocialLink = {
    name: string;
    link: string;
    logo?: string;
};

function formatAvailabilityBanner(
    stats: AvailabilityStats | null,
    t: DyeusTranslate,
): string {
    if (!stats || stats.unitCount <= 0) {
        return t("limitedAvailability");
    }
    return t("limitedAvailabilityCount", {
        sold: stats.soldUnitCount,
        total: stats.unitCount,
    });
}

function MandalaPattern() {
    return (
        <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-[100px] bottom-0 overflow-hidden opacity-40"
        >
            <div className="absolute inset-y-0 right-0 flex w-[70%] flex-col justify-start gap-4 pt-4">
                {Array.from({length: 7}).map((_, row) => (
                    <div key={row} className="flex gap-4">
                        {Array.from({length: 16}).map((__, col) => (
                            <div key={col} className="h-16 w-[62px] shrink-0 overflow-hidden">
                                <img
                                    src={dyeusAssets.mandala}
                                    alt=""
                                    className="relative left-[-43.58%] top-[-42.95%] h-[182.81%] w-[189.91%] max-w-none"
                                />
                            </div>
                        ))}
                    </div>
                ))}
            </div>
            <div
                className="absolute inset-0"
                style={{
                    backgroundImage:
                        "linear-gradient(163.75deg, #f2eee6 55%, rgba(242, 238, 230, 0.85) 68%, rgba(242, 238, 230, 0) 86%)",
                }}
            />
        </div>
    );
}

function DyeusFooter() {
    const {t} = useDyeusT(FOOTER_LANGUAGE_PATH);
    const [contactOpen, setContactOpen] = useState(false);
    const {projectId, loading: resolvingProject} = useDyeusProjectId();
    const [availability, setAvailability] = useState<AvailabilityStats | null>(null);
    const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);

    useEffect(() => {
        if (!projectId) {
            setAvailability(null);
            setSocialLinks([]);
            return;
        }

        let cancelled = false;
        (async () => {
            try {
                const res = await apiClient.post<CatalogResponse>(
                    "/api/realEstate/marketingProjectsCatalog",
                    {},
                );
                if (cancelled) return;
                const project = (res.data.projects ?? []).find((item) => item._id === projectId);
                if (!project) {
                    setAvailability(null);
                    setSocialLinks([]);
                    return;
                }
                if (project.unitCount == null) {
                    setAvailability(null);
                } else {
                    setAvailability({
                        unitCount: project.unitCount,
                        soldUnitCount: project.soldUnitCount ?? 0,
                    });
                }
                setSocialLinks(
                    (project.socialLinks ?? []).filter(
                        (item): item is SocialLink =>
                            typeof item?.name === "string" &&
                            item.name.trim().length > 0 &&
                            typeof item?.link === "string" &&
                            item.link.trim().length > 0,
                    ),
                );
            } catch {
                if (!cancelled) {
                    setAvailability(null);
                    setSocialLinks([]);
                }
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [projectId]);

    const availabilityLabel =
        resolvingProject && !availability
            ? t("limitedAvailability")
            : formatAvailabilityBanner(availability, t);

    return (
        <footer className="relative w-full overflow-hidden bg-dyeus-cream text-dyeus-ink">
            <div className="w-full bg-dyeus-bronze">
                <div className="flex h-auto w-full flex-col items-start justify-between gap-4 px-6 py-5 md:h-[100px] md:flex-row md:items-center md:px-[61px] md:py-0">
                    <p className="font-dyeus-serif text-[clamp(1.5rem,2.5vw,2.75rem)] font-bold leading-none text-dyeus-cream">
                        {availabilityLabel}
                    </p>
                    <Link
                        to="/contact"
                        className="rounded-[4px] border border-[rgba(242,238,230,0.6)] px-6 py-3 font-dyeus-serif text-lg font-bold leading-[1.2] text-dyeus-cream transition-[background-color,border-color,color] duration-300 hover:border-dyeus-cream hover:bg-dyeus-cream hover:text-dyeus-bronze md:text-2xl"
                    >
                        {t("secureResidence")}
                    </Link>
                </div>
            </div>

            <div className="relative min-h-[586px] w-full px-6 pb-8 pt-11 md:px-[61px]">
                <MandalaPattern />

                <div className="relative z-10 grid grid-cols-2 gap-x-8 gap-y-10 md:grid-cols-3 lg:grid-cols-5 lg:gap-x-6">
                    <div className="flex flex-col gap-3">
                        <p className="font-dyeus-serif text-2xl font-extrabold uppercase text-dyeus-bronze">
                            {t("explore")}
                        </p>
                        {exploreLinks.map((link) => (
                            <Link key={link.to} to={link.to} className={footerLinkClassName}>
                                {t(link.labelKey)}
                            </Link>
                        ))}
                    </div>

                    <div className="flex flex-col gap-3">
                        <p className="font-dyeus-serif text-2xl font-extrabold uppercase text-dyeus-bronze">
                            {t("residences")}
                        </p>
                        <Link to="/residences" className={footerLinkClassName}>
                            {t("viewAllResidences")}
                        </Link>
                    </div>

                    {socialLinks.length > 0 ? (
                        <div className="flex flex-col gap-3">
                            <p className="font-dyeus-serif text-2xl font-extrabold uppercase text-dyeus-bronze">
                                {t("followUs")}
                            </p>
                            {socialLinks.map((item) => (
                                <a
                                    key={`${item.name}-${item.link}`}
                                    href={item.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`${footerLinkClassName} inline-flex items-center gap-2`}
                                >
                                    {item.logo ? (
                                        <img
                                            src={item.logo}
                                            alt=""
                                            className="size-5 object-contain"
                                        />
                                    ) : null}
                                    {item.name}
                                </a>
                            ))}
                        </div>
                    ) : null}

                    <div className="flex flex-col gap-3">
                        <p className="font-dyeus-serif text-2xl font-extrabold uppercase text-dyeus-bronze">
                            {t("more")}
                        </p>
                        {moreLinks.map((link) => (
                            <Link key={link.to} to={link.to} className={footerLinkClassName}>
                                {t(link.labelKey)}
                            </Link>
                        ))}
                    </div>

                    <div className="col-span-2 flex w-full max-w-[401px] flex-col gap-3 md:col-span-1">
                        <p className="font-dyeus-serif text-2xl font-extrabold uppercase text-dyeus-bronze">
                            {t("contactUs")}
                        </p>
                        <button
                            type="button"
                            onClick={() => setContactOpen(true)}
                            className="flex w-full cursor-pointer items-center justify-between gap-2.5 border-b border-dyeus-ink p-3 font-dyeus-serif text-xl leading-[1.2] text-dyeus-ink transition-colors duration-300 hover:text-dyeus-bronze"
                        >
                            <span>{t("getInTouch")}</span>
                            <img src={dyeusAssets.iconArrowRight} alt="" className="size-6" />
                        </button>
                    </div>
                </div>

                <div className="relative z-10 mt-16 md:mt-[180px]">
                    <Link
                        to="/"
                        aria-label={t("homeAria")}
                        className="block font-dyeus-serif text-[clamp(3.75rem,10vw,8.625rem)] font-light leading-none tracking-[0.18em] text-dyeus-ink"
                    >
                        {t("brand")}
                    </Link>
                </div>

                <div className="relative z-10 mt-8 flex flex-col gap-4 md:mt-6 md:flex-row md:items-center">
                    <p className="font-dyeus-serif text-xl text-dyeus-ink md:min-w-[420px]">
                        {t("copyright")}
                    </p>
                    <button
                        type="button"
                        onClick={() => window.scrollTo({top: 0, behavior: "smooth"})}
                        className="group flex items-center gap-3 font-dyeus-serif text-xl text-dyeus-ink transition-colors duration-300 hover:text-dyeus-bronze md:absolute md:left-1/2 md:-translate-x-1/2"
                    >
                        <img
                            src={dyeusAssets.iconBackTop}
                            alt=""
                            className="size-4 transition-transform duration-300 group-hover:-translate-y-1 cursor-pointer"
                        />
                        <span className="underline decoration-transparent underline-offset-4 transition-[text-decoration-color] duration-300 group-hover:decoration-dyeus-bronze cursor-pointer">
                            {t("backToTop")}
                        </span>
                    </button>
                </div>
            </div>

            {contactOpen ? (
                <div
                    className="fixed inset-0 z-[180] flex items-center justify-center bg-dyeus-ink/40 p-4"
                    role="presentation"
                    onClick={() => setContactOpen(false)}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="dyeus-footer-contact-title"
                        className="w-full max-w-xl overflow-visible bg-dyeus-cream p-6 shadow-lg md:p-8"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="font-dyeus-sans text-xs uppercase tracking-[0.24em] text-dyeus-bronze">
                                    {t("contactEyebrow")}
                                </p>
                                <h2
                                    id="dyeus-footer-contact-title"
                                    className="mt-2 font-dyeus-serif text-3xl md:text-4xl"
                                >
                                    {t("contactTitle")}
                                </h2>
                            </div>
                            <button
                                type="button"
                                onClick={() => setContactOpen(false)}
                                className="font-dyeus-sans text-xs uppercase tracking-[0.18em] text-dyeus-ink-muted transition hover:text-dyeus-ink"
                            >
                                {t("close")}
                            </button>
                        </div>
                        <DyeusMarketingContactForm className="mt-6" />
                    </div>
                </div>
            ) : null}
        </footer>
    );
}

export default DyeusFooter;
