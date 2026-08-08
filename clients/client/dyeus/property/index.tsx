import {useEffect, useRef, useState} from "react";
import {compose} from "redux";
import {Link, useSearchParams} from "react-router-dom";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import Loader from "@coreModule/components/custom/loader.tsx";
import DyeusPageShell from "@propertyManagementModule/clients/client/dyeus/shared/dyeusPageShell.tsx";
import DyeusHeader from "@propertyManagementModule/clients/client/dyeus/shared/dyeusHeader.tsx";
import DyeusFooter from "@propertyManagementModule/clients/client/dyeus/shared/dyeusFooter.tsx";
import DyeusMarketingContactForm from "@propertyManagementModule/clients/client/dyeus/shared/dyeusMarketingContactForm.tsx";
import {dyeusAssets} from "@propertyManagementModule/clients/client/dyeus/shared/dyeusAssets.ts";
import {
    fillLanguageTemplate,
    type MarketingUnitSingle,
} from "@propertyManagementModule/clients/client/public/shared/publicTypes.ts";

type MarketingUnitResponse = {unit: MarketingUnitSingle};
type PropertyPageProps = WithLanguageType &
    WithAxiosType<MarketingUnitResponse, {projectId: string; unitId: string}>;

function PropertyPage({data, loading, error, onFilterChange, resolveLanguageKey}: PropertyPageProps) {
    const t = (key: string) => String(resolveLanguageKey(key));
    const [searchParams] = useSearchParams();
    const projectId = searchParams.get("projectId") ?? "";
    const unitId = searchParams.get("unitId") ?? "";
    const unit = data?.unit;
    const requestedKeyRef = useRef("");
    const [contactOpen, setContactOpen] = useState(false);

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

    const gallery = unit?.imageGallery?.length
        ? unit.imageGallery
        : ([unit?.floorPlanImage, dyeusAssets.villaFeature, dyeusAssets.amenitySide].filter(
              Boolean,
          ) as string[]);

    return (
        <DyeusPageShell nodeId="44:property" nodeName="Property">
            <div className="relative">
                <DyeusHeader variant="solid" />
                <div className="mx-auto max-w-[1440px] px-6 pb-20 pt-28 md:px-12 md:pt-36">
                    <Link
                        to={`/residences${projectId ? `?projectId=${projectId}` : ""}`}
                        className="font-dyeus-sans text-xs uppercase tracking-[0.2em] text-dyeus-ink-muted transition hover:text-dyeus-ink"
                    >
                        {t("backToResidences")}
                    </Link>

                    {!projectId || !unitId ? (
                        <p className="mt-10 font-dyeus-sans text-dyeus-ink-muted">{t("missingParams")}</p>
                    ) : error ? (
                        <p className="mt-10 font-dyeus-sans text-dyeus-ink-muted">{t("loadError")}</p>
                    ) : loading && !unit ? (
                        <div className="mt-20 flex justify-center">
                            <Loader />
                        </div>
                    ) : unit ? (
                        <div className="mt-8 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
                            <div>
                                <div className="relative aspect-[16/11] overflow-hidden bg-dyeus-sand">
                                    <img
                                        src={gallery[0] || dyeusAssets.villaFeature}
                                        alt=""
                                        className="size-full object-cover"
                                    />
                                </div>
                                {gallery.length > 1 && (
                                    <div className="mt-3 grid grid-cols-3 gap-3">
                                        {gallery.slice(1, 4).map((src) => (
                                            <div key={src} className="relative aspect-[4/3] overflow-hidden">
                                                <img src={src} alt="" className="size-full object-cover" />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <aside className="bg-dyeus-white p-6 md:p-8">
                                <p className="font-dyeus-sans text-xs uppercase tracking-[0.2em] text-dyeus-bronze">
                                    {unit.status}
                                </p>
                                <h1 className="mt-3 font-dyeus-serif text-4xl md:text-5xl">{unit.name}</h1>
                                <dl className="mt-8 space-y-4 border-t border-dyeus-border pt-6 font-dyeus-sans text-sm">
                                    {unit.areaSqm != null && (
                                        <div className="flex justify-between gap-4">
                                            <dt className="text-dyeus-ink-faded">{t("area")}</dt>
                                            <dd>{unit.areaSqm} m²</dd>
                                        </div>
                                    )}
                                    {unit.bedrooms != null && (
                                        <div className="flex justify-between gap-4">
                                            <dt className="text-dyeus-ink-faded">{t("bedrooms")}</dt>
                                            <dd>{unit.bedrooms}</dd>
                                        </div>
                                    )}
                                    {unit.bathrooms != null && (
                                        <div className="flex justify-between gap-4">
                                            <dt className="text-dyeus-ink-faded">{t("bathrooms")}</dt>
                                            <dd>{unit.bathrooms}</dd>
                                        </div>
                                    )}
                                    {unit.price != null && (
                                        <div className="flex justify-between gap-4">
                                            <dt className="text-dyeus-ink-faded">{t("price")}</dt>
                                            <dd>{unit.price.toLocaleString()}</dd>
                                        </div>
                                    )}
                                </dl>
                                {unit.description && (
                                    <p className="mt-6 font-dyeus-sans text-sm leading-relaxed text-dyeus-ink-muted">
                                        {unit.description}
                                    </p>
                                )}
                                <button
                                    type="button"
                                    onClick={() => setContactOpen(true)}
                                    className="mt-8 w-full bg-dyeus-ink px-6 py-3 font-dyeus-sans text-xs uppercase tracking-[0.2em] text-dyeus-cream transition hover:bg-dyeus-bronze-deep"
                                >
                                    {t("requestInfo")}
                                </button>
                            </aside>
                        </div>
                    ) : null}
                </div>
            </div>

            {contactOpen && unit ? (
                <div className="fixed inset-0 z-[180] flex items-center justify-center bg-dyeus-ink/40 p-4">
                    <div className="w-full max-w-md bg-dyeus-cream p-6 shadow-lg md:p-8">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h2 className="font-dyeus-serif text-3xl">{t("requestInfo")}</h2>
                                <p className="mt-1 font-dyeus-sans text-sm text-dyeus-ink-muted">{unit.name}</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setContactOpen(false)}
                                className="font-dyeus-sans text-xs uppercase tracking-[0.18em] text-dyeus-ink-muted"
                            >
                                {t("close")}
                            </button>
                        </div>
                        <DyeusMarketingContactForm
                            className="mt-6"
                            lockInterestToReservation
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
