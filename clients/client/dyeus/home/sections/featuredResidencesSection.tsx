import {type ComponentType, useMemo} from "react";
import {Link} from "react-router-dom";
import {compose} from "redux";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import Loader from "@coreModule/components/custom/loader.tsx";
import {dyeusAssets} from "@propertyManagementModule/clients/client/dyeus/shared/dyeusAssets.ts";
import {resolveMarketingMediaUrl} from "@propertyManagementModule/clients/client/public/shared/resolveMarketingMedia.ts";
import type {
    MarketingFeaturedUnit,
    MarketingFeaturedUnitsResponse,
    MarketingUnitStatus,
} from "@propertyManagementModule/clients/client/public/shared/publicTypes.ts";

type FeaturedResidencesSectionProps = WithAxiosType<MarketingFeaturedUnitsResponse>;

const STATUS_LABEL: Record<MarketingUnitStatus, string> = {
    available: "Available",
    reserved: "Reserved",
    sold: "Sold",
};

const BEDROOM_LABELS: Record<number, string> = {
    1: "One-Bedroom Residence",
    2: "Two-Bedroom Residence",
    3: "Three-Bedroom Residence",
    4: "Four-Bedroom Residence",
};

function formatUnitTitle(unit: MarketingFeaturedUnit): string {
    const parts: string[] = [];

    if (unit.propertyType === "villa") {
        parts.push("Private Villa");
    } else if (unit.propertyType === "penthouse") {
        parts.push("Penthouse");
    } else if (unit.propertyType === "studio") {
        parts.push("Studio Residence");
    } else if (unit.bedrooms != null) {
        parts.push(BEDROOM_LABELS[unit.bedrooms] ?? `${unit.bedrooms}-Bedroom Residence`);
    } else {
        parts.push(unit.name);
    }

    if (unit.hasSeaView) parts.push("Sea View");
    else if (unit.hasCityView) parts.push("City View");
    else if (unit.hasLakeView) parts.push("Lake View");

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

function FeaturedResidencesSectionInner({data, loading, error}: FeaturedResidencesSectionProps) {
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
                    Featured Residences
                </h2>
                <Link
                    to="/residences"
                    className="font-dyeus-serif text-lg text-dyeus-ink underline decoration-solid underline-offset-4 md:text-2xl"
                >
                    View all residences
                </Link>
            </div>

            <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:gap-8">
                {units.map((unit, index) => {
                    const image =
                        resolveMarketingMediaUrl(unit.mainImage) ??
                        resolveMarketingMediaUrl(unit.imageGallery?.[0]) ??
                        dyeusAssets.residenceC01;
                    const wide = index === 0;
                    const statusLabel = STATUS_LABEL[unit.status] ?? "Available";
                    const galleryCount = Math.max(1, unit.imageGallery?.length ?? 1);

                    return (
                        <Link
                            key={unit._id}
                            to={unitHref(unit)}
                            className={`flex flex-col gap-6 border border-dyeus-border p-6 ${
                                wide ? "lg:w-[645px] lg:shrink-0" : "lg:w-[450px] lg:shrink-0"
                            }`}
                        >
                            <div className="relative h-[420px] overflow-hidden rounded-[5px] md:h-[635px]">
                                <img
                                    src={image}
                                    alt=""
                                    className="size-full object-cover"
                                />
                                <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 items-center gap-1.5">
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
                                    {formatUnitTitle(unit)}
                                </p>
                            </div>

                            <div className="flex items-center justify-center rounded-[4px] border border-dyeus-ink-muted py-3">
                                <p className="font-dyeus-serif text-xl font-bold leading-[1.2] text-dyeus-ink md:text-2xl">
                                    {formatPrice(unit.price)}
                                </p>
                            </div>
                        </Link>
                    );
                })}
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
