import {type ComponentType, useMemo} from "react";
import {Link} from "react-router-dom";
import {compose} from "redux";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import Loader from "@coreModule/components/custom/loader.tsx";
import {dyeusAssets} from "@propertyManagementModule/clients/client/dyeus/shared/dyeusAssets.ts";
import {
    useDyeusT,
    type DyeusTranslate,
} from "@propertyManagementModule/clients/client/dyeus/shared/useDyeusT.ts";
import {resolveMarketingMediaUrl} from "@propertyManagementModule/clients/client/public/shared/resolveMarketingMedia.ts";
import {PublicSnapCarousel} from "@propertyManagementModule/clients/client/public/shared/sections/publicSnapCarousel.tsx";
import type {
    MarketingFeaturedUnit,
    MarketingFeaturedUnitsResponse,
    MarketingUnitStatus,
} from "@propertyManagementModule/clients/client/public/shared/publicTypes.ts";

const HOME_LANGUAGE_PATH =
    "src/modules/propertyManagement/clients/client/dyeus/home/index.tsx";

type FeaturedResidencesSectionProps = WithAxiosType<MarketingFeaturedUnitsResponse>;

const STATUS_KEYS: Record<MarketingUnitStatus, string> = {
    available: "statusAvailable",
    reserved: "statusReserved",
    sold: "statusSold",
};

const BEDROOM_KEYS: Record<number, string> = {
    1: "oneBedroomResidence",
    2: "twoBedroomResidence",
    3: "threeBedroomResidence",
    4: "fourBedroomResidence",
};

function formatUnitTitle(unit: MarketingFeaturedUnit, t: DyeusTranslate): string {
    const parts: string[] = [];

    if (unit.propertyType === "villa") {
        parts.push(t("privateVilla"));
    } else if (unit.propertyType === "penthouse") {
        parts.push(t("penthouse"));
    } else if (unit.propertyType === "studio") {
        parts.push(t("studioResidence"));
    } else if (unit.bedrooms != null) {
        const bedroomKey = BEDROOM_KEYS[unit.bedrooms];
        parts.push(
            bedroomKey
                ? t(bedroomKey)
                : t("bedroomResidence", {count: unit.bedrooms}),
        );
    } else {
        parts.push(unit.name);
    }

    if (unit.hasSeaView) parts.push(t("seaView"));
    else if (unit.hasCityView) parts.push(t("cityView"));
    else if (unit.hasLakeView) parts.push(t("lakeView"));

    return parts.join(" • ");
}

function formatPrice(price: number | undefined): string {
    if (price == null) return "—";
    return `€${Math.round(price).toLocaleString("en-US")}`;
}

function unitHref(unit: MarketingFeaturedUnit): string {
    const params = new URLSearchParams();
    if (unit.projectId) params.set("projectId", unit.projectId);
    params.set("unitId", unit._id);
    return `/property?${params.toString()}`;
}

const SNAP_SCROLLER =
    "hide-scrollbar flex w-full min-w-0 snap-x snap-mandatory gap-4 overflow-x-auto overflow-y-hidden overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:snap-none lg:gap-8 lg:overflow-visible";

function FeaturedResidenceCard({
    unit,
    wide,
    t,
}: {
    unit: MarketingFeaturedUnit;
    wide: boolean;
    t: DyeusTranslate;
}) {
    const image =
        resolveMarketingMediaUrl(unit.mainImage) ??
        resolveMarketingMediaUrl(unit.imageGallery?.[0]) ??
        dyeusAssets.residenceC01;
    const statusKey = STATUS_KEYS[unit.status] ?? "statusAvailable";
    const statusLabel = t(statusKey);
    const galleryCount = Math.max(1, unit.imageGallery?.length ?? 1);

    return (
        <Link
            to={unitHref(unit)}
            className={`flex h-full flex-col gap-6 border border-dyeus-border p-6 ${
                wide ? "lg:w-[645px] lg:shrink-0" : "lg:w-[450px] lg:shrink-0"
            }`}
        >
            <div className="relative h-[300px] overflow-hidden rounded-[5px] md:h-[420px] lg:h-[635px]">
                <img src={image} alt="" className="size-full object-cover" />
                <div className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 items-center gap-1.5 lg:flex">
                    {Array.from({length: Math.min(galleryCount, 5)}, (_, dotIndex) => (
                        <span
                            key={dotIndex}
                            className={
                                dotIndex === 0
                                    ? "h-3 w-8 rounded-[22px] bg-white"
                                    : "size-3 rounded-[22px] bg-white/50"
                            }
                        />
                    ))}
                </div>
            </div>

            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between gap-3">
                    <p className="font-dyeus-serif text-[clamp(1.75rem,2.5vw,2.5rem)] font-bold leading-none text-dyeus-ink">
                        {unit.unitNumber || unit.name}
                    </p>
                    <span className="flex items-center gap-1 rounded-full bg-[rgba(18,183,106,0.1)] px-4 py-2 backdrop-blur-[47px]">
                        <img src={dyeusAssets.iconAvailable} alt="" className="size-[18px]" />
                        <span className="font-dyeus-serif text-sm font-bold leading-[1.2] text-dyeus-available md:text-xl">
                            {statusLabel}
                        </span>
                    </span>
                </div>
                <p className="font-dyeus-serif text-xl leading-none text-dyeus-ink-muted md:text-2xl">
                    {formatUnitTitle(unit, t)}
                </p>
            </div>

            <div className="flex items-center justify-center rounded-[4px] border border-dyeus-ink-muted py-3">
                <p className="font-dyeus-serif text-xl font-bold leading-[1.2] text-dyeus-ink md:text-2xl">
                    {formatPrice(unit.price)}
                </p>
            </div>
        </Link>
    );
}

function FeaturedResidencesSectionInner({data, loading, error}: FeaturedResidencesSectionProps) {
    const {t} = useDyeusT(HOME_LANGUAGE_PATH);
    const units = useMemo(() => data?.units ?? [], [data?.units]);

    if (loading && units.length === 0) {
        return (
            <section className="mx-auto flex max-w-[1728px] items-center justify-center px-6 py-24 md:px-[60px]">
                <Loader />
            </section>
        );
    }

    if (error || units.length === 0) {
        return null;
    }

    return (
        <section className="mx-auto max-w-[1728px] px-6 py-12 md:px-[60px] md:py-16">
            <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
                <h2 className="font-dyeus-serif text-[clamp(2.5rem,6vw,6.25rem)] font-bold leading-none text-dyeus-ink">
                    {t("featuredTitle")}
                </h2>
                <Link
                    to="/residences"
                    className="font-dyeus-serif text-lg text-dyeus-ink underline decoration-solid underline-offset-4 md:text-2xl"
                >
                    {t("viewAllResidences")}
                </Link>
            </div>

            <div className="relative mt-8 min-w-0 w-full overflow-x-hidden">
                <PublicSnapCarousel
                    scrollerClassName={SNAP_SCROLLER}
                    itemClassName="max-lg:w-full max-lg:min-w-full max-lg:shrink-0 max-lg:snap-start lg:contents"
                    activeDotClassName="bg-dyeus-ink"
                    inactiveDotClassName="bg-dyeus-ink/20"
                    dotsHiddenClassName="lg:hidden"
                >
                    {units.map((unit, index) => (
                        <FeaturedResidenceCard
                            key={unit._id}
                            unit={unit}
                            wide={index === 0}
                            t={t}
                        />
                    ))}
                </PublicSnapCarousel>
            </div>
        </section>
    );
}

const FeaturedResidencesSection = compose(
    withAxios<MarketingFeaturedUnitsResponse>(
        {method: "post", url: "/api/realEstate/marketingFeaturedUnits", data: {}},
        false,
    ),
    withDebug(true, true),
)(FeaturedResidencesSectionInner) as unknown as ComponentType;

export default FeaturedResidencesSection;
