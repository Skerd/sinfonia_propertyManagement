import {useEffect, useMemo, useRef, useState, type ReactNode} from "react";
import {compose} from "redux";
import {Link, useSearchParams} from "react-router-dom";
import {Play} from "lucide-react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import Loader from "@coreModule/components/custom/loader.tsx";
import DyeusPageShell from "@propertyManagementModule/clients/client/dyeus/shared/dyeusPageShell.tsx";
import DyeusHeader from "@propertyManagementModule/clients/client/dyeus/shared/dyeusHeader.tsx";
import DyeusFooter from "@propertyManagementModule/clients/client/dyeus/shared/dyeusFooter.tsx";
import DyeusMarketingContactForm from "@propertyManagementModule/clients/client/dyeus/shared/dyeusMarketingContactForm.tsx";
import DyeusMediaLightbox from "@propertyManagementModule/clients/client/dyeus/shared/dyeusMediaLightbox.tsx";
import {dyeusAssets} from "@propertyManagementModule/clients/client/dyeus/shared/dyeusAssets.ts";
import {
    fillLanguageTemplate,
    type MarketingUnitSingle,
} from "@propertyManagementModule/clients/client/public/shared/publicTypes.ts";

type MarketingUnitResponse = {unit: MarketingUnitSingle};
type PropertyPageProps = WithLanguageType &
    WithAxiosType<MarketingUnitResponse, {projectId: string; unitId: string}>;
type LightboxState = {kind: "image" | "video"; index: number};

const VIDEO_EXT_RE = /\.(mp4|webm|ogg|mov|m4v)(\?|#|$)/i;

function isVideoUrl(url: string) {
    return VIDEO_EXT_RE.test(url);
}

const STATUS_KEYS: Record<string, string> = {
    available: "statusAvailable",
    reserved: "statusReserved",
    sold: "statusSold",
};

const FEATURE_ROWS = [
    {labelKey: "hasBalcony", field: "hasBalcony"},
    {labelKey: "hasTerrace", field: "hasTerrace"},
    {labelKey: "hasSeaView", field: "hasSeaView"},
    {labelKey: "hasCityView", field: "hasCityView"},
    {labelKey: "hasLakeView", field: "hasLakeView"},
    {labelKey: "hasElevator", field: "hasElevator"},
] as const;

function formatNumber(value: number) {
    return value.toFixed(2);
}

function formatAreaSqm(value?: number) {
    return value != null ? `${formatNumber(value)} m²` : null;
}

function formatCount(value?: number) {
    return value != null ? formatNumber(value) : null;
}

function formatUnitPrice(unit: MarketingUnitSingle, onRequest: string) {
    if (unit.price == null) return onRequest;
    const symbol = unit.priceCurrency?.symbol ?? unit.priceCurrency?.abbreviation ?? "€";
    return `${symbol}${formatNumber(unit.price)}`;
}

function formatPricePerSqm(pricePerSqm?: MarketingUnitSingle["averagePricePerSquareMeter"]) {
    if (pricePerSqm?.value == null) return null;
    const symbol = pricePerSqm.currency?.symbol ?? pricePerSqm.currency?.abbreviation ?? "€";
    return `${symbol}${formatNumber(pricePerSqm.value)}/m²`;
}

function formatFloor(unit: MarketingUnitSingle) {
    if (unit.floorLabel) return unit.floorLabel;
    if (unit.floorLevel != null && unit.totalFloorsInEdifice != null) {
        return `${unit.floorLevel}/${unit.totalFloorsInEdifice}`;
    }
    if (unit.floorLevel != null) return String(unit.floorLevel);
    return null;
}

function DetailRow({label, value}: {label: string; value: ReactNode}) {
    return (
        <div className="flex justify-between gap-4">
            <dt className="text-dyeus-ink-muted">{label}</dt>
            <dd className="text-right">{value}</dd>
        </div>
    );
}

function PropertyPage({data, loading, error, onFilterChange, resolveLanguageKey}: PropertyPageProps) {
    const t = (key: string) => String(resolveLanguageKey(key));
    const [searchParams] = useSearchParams();
    const projectId = searchParams.get("projectId") ?? "";
    const unitId = searchParams.get("unitId") ?? "";
    const unit = data?.unit;
    const requestedKeyRef = useRef("");
    const [contactOpen, setContactOpen] = useState(false);
    const [lightbox, setLightbox] = useState<LightboxState | null>(null);

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

    const mediaUrls = useMemo(() => {
        if (!unit) return [] as string[];
        if (unit.imageGallery?.length) return unit.imageGallery.filter(Boolean);
        return [unit.floorPlanImage, dyeusAssets.villaFeature, dyeusAssets.amenitySide].filter(
            Boolean,
        ) as string[];
    }, [unit]);

    const images = useMemo(() => mediaUrls.filter((url) => !isVideoUrl(url)), [mediaUrls]);
    const videos = useMemo(() => mediaUrls.filter(isVideoUrl), [mediaUrls]);
    const gallery = images.length > 0 ? images : mediaUrls.length === 0 ? [dyeusAssets.villaFeature] : [];

    const detailRows = unit
        ? (
              [
                  {label: t("unitNumber"), value: unit.unitNumber?.trim() || null},
                  {label: t("unitType"), value: unit.unitTypeName?.trim() || null},
                  {
                      label: t("propertyType"),
                      value: unit.propertyType ? t(`propertyType_${unit.propertyType}`) : null,
                  },
                  {label: t("grossArea"), value: formatAreaSqm(unit.grossAreaSqm)},
                  {label: t("netArea"), value: formatAreaSqm(unit.netAreaSqm)},
                  {label: t("sharedArea"), value: formatAreaSqm(unit.sharedAreaSqm)},
                  {label: t("verandaArea"), value: formatAreaSqm(unit.verandaAreaSqm)},
                  {
                      label: t("area"),
                      value:
                          unit.grossAreaSqm == null && unit.areaSqm != null
                              ? formatAreaSqm(unit.areaSqm)
                              : null,
                  },
                  {label: t("bedrooms"), value: formatCount(unit.bedrooms)},
                  {label: t("bathrooms"), value: formatCount(unit.bathrooms)},
                  {label: t("floor"), value: formatFloor(unit)},
                  {label: t("orientation"), value: unit.orientation ?? null},
                  {
                      label: t("constructionStatus"),
                      value: unit.constructionStatus
                          ? t(`constructionStatus_${unit.constructionStatus}`)
                          : null,
                  },
                  {label: t("price"), value: formatUnitPrice(unit, t("priceOnRequest"))},
                  {
                      label: t("averagePricePerSquareMeter"),
                      value: formatPricePerSqm(unit.averagePricePerSquareMeter),
                  },
                  {
                      label: t("projectedYield"),
                      value:
                          unit.projectedYield != null
                              ? `${formatNumber(unit.projectedYield)}%`
                              : null,
                  },
              ] as {label: string; value: string | null}[]
          ).filter((row) => row.value != null)
        : [];

    const featureRows = unit
        ? FEATURE_ROWS.filter((row) => unit[row.field] != null).map((row) => ({
              label: t(row.labelKey),
              value: unit[row.field] ? t("yes") : t("no"),
          }))
        : [];

    const statusLabel = unit
        ? t(STATUS_KEYS[unit.status] ?? "statusAvailable")
        : "";

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
                                {gallery.length > 0 ? (
                                    <>
                                        <button
                                            type="button"
                                            onClick={() => setLightbox({kind: "image", index: 0})}
                                            className="relative aspect-[16/11] w-full cursor-zoom-in overflow-hidden bg-dyeus-sand"
                                            aria-label={fillLanguageTemplate(t("openImage"), {index: 1})}
                                        >
                                            <img
                                                src={gallery[0] || dyeusAssets.villaFeature}
                                                alt=""
                                                className="size-full object-cover"
                                            />
                                        </button>
                                        {gallery.length > 1 && (
                                            <div className="mt-3 grid grid-cols-3 gap-3">
                                                {gallery.slice(1, 4).map((src, thumbIndex) => {
                                                    const index = thumbIndex + 1;
                                                    return (
                                                        <button
                                                            key={`${src}-${index}`}
                                                            type="button"
                                                            onClick={() => setLightbox({kind: "image", index})}
                                                            className="relative aspect-[4/3] cursor-zoom-in overflow-hidden"
                                                            aria-label={fillLanguageTemplate(t("openImage"), {
                                                                index: index + 1,
                                                            })}
                                                        >
                                                            <img
                                                                src={src}
                                                                alt=""
                                                                className="size-full object-cover"
                                                            />
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </>
                                ) : null}
                                {videos.length > 0 ? (
                                    <div className={`grid gap-3 sm:grid-cols-2 ${gallery.length > 0 ? "mt-3" : ""}`}>
                                        {videos.map((src, index) => (
                                            <button
                                                key={`${src}-${index}`}
                                                type="button"
                                                onClick={() => setLightbox({kind: "video", index})}
                                                className="group relative aspect-video cursor-pointer overflow-hidden bg-dyeus-sand"
                                                aria-label={fillLanguageTemplate(t("playVideo"), {
                                                    index: index + 1,
                                                })}
                                            >
                                                <video
                                                    src={src}
                                                    muted
                                                    playsInline
                                                    preload="metadata"
                                                    className="pointer-events-none size-full object-cover"
                                                />
                                                <span className="absolute inset-0 flex items-center justify-center bg-dyeus-ink/25 transition group-hover:bg-dyeus-ink/40">
                                                    <span className="flex size-12 items-center justify-center rounded-full bg-dyeus-cream/95 text-dyeus-ink shadow-sm">
                                                        <Play
                                                            className="ml-0.5 size-5 fill-current"
                                                            strokeWidth={1.25}
                                                        />
                                                    </span>
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                ) : null}
                            </div>
                            <aside className="bg-dyeus-white p-6 md:p-8">
                                <p className="font-dyeus-sans text-xs uppercase tracking-[0.2em] text-dyeus-bronze">
                                    {statusLabel}
                                </p>
                                <h1 className="mt-3 font-dyeus-serif text-4xl md:text-5xl">{unit.name}</h1>
                                {detailRows.length > 0 && (
                                    <dl className="mt-8 space-y-4 border-t border-dyeus-border pt-6 font-dyeus-sans text-sm">
                                        {detailRows.map((row) => (
                                            <DetailRow key={row.label} label={row.label} value={row.value} />
                                        ))}
                                    </dl>
                                )}
                                {featureRows.length > 0 && (
                                    <div className="mt-8 border-t border-dyeus-border pt-6">
                                        <h2 className="font-dyeus-sans text-xs uppercase tracking-[0.2em] text-dyeus-ink-muted">
                                            {t("features")}
                                        </h2>
                                        <dl className="mt-4 space-y-4 font-dyeus-sans text-sm">
                                            {featureRows.map((row) => (
                                                <DetailRow
                                                    key={row.label}
                                                    label={row.label}
                                                    value={row.value}
                                                />
                                            ))}
                                        </dl>
                                    </div>
                                )}
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
                                className="cursor-pointer font-dyeus-sans text-xs uppercase tracking-[0.18em] text-dyeus-ink-muted transition hover:text-dyeus-ink"
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

            {lightbox ? (
                <DyeusMediaLightbox
                    kind={lightbox.kind}
                    images={images.length > 0 ? images : gallery}
                    videos={videos}
                    initialIndex={lightbox.index}
                    onClose={() => setLightbox(null)}
                />
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
