import {compose} from "redux";
import {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import type {LucideIcon} from "lucide-react";
import {Bath, BedDouble, Layers, Maximize} from "lucide-react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import apiClient from "@coreModule/helpers/apiClient/apiClient.ts";
import {formatCurrency, formatNumber} from "@coreModule/helpers/general/numbers.ts";
import Loader from "@coreModule/components/custom/loader/loader.tsx";
import {Badge} from "@coreModule/components/ui/badge.tsx";
import PortalNotFound from "@coreModule/clients/portal/notFound/index.tsx";
import {useSectionBase} from "@coreModule/clients/portal/shared/sectionBase.tsx";
import DetailPage, {DetailFacts, DetailHeading, DetailPrice, DetailSection, DetailStatus, DetailText} from "@coreModule/clients/portal/shared/detailPage.tsx";
import DetailGallery from "@coreModule/clients/portal/shared/detailGallery.tsx";
import PortalProviderCard from "@coreModule/clients/portal/shared/portalProviderCard.tsx";
import type {
    MarketingUnitSingleFormResponseType,
    MarketingUnitSingleItem,
} from "armonia/src/modules/propertyManagement/api/realEstate/public/marketingUnit/marketingUnitSingle.form.response.type.ts";
import PropertyInquiryForm from "./propertyInquiryForm.tsx";

const FEATURES = ["hasBalcony", "hasTerrace", "hasSeaView", "hasCityView", "hasLakeView", "hasElevator"] as const;

/** One unit of a development: its photos, facts and price, and an inquiry about it. */
function PropertyUnit({resolveLanguageKey}: WithLanguageType) {
    const base = useSectionBase();
    const {projectId = "", unitId = ""} = useParams();
    const [unit, setUnit] = useState<MarketingUnitSingleItem | null | undefined>(undefined);

    useEffect(() => {
        let cancelled = false;
        setUnit(undefined);
        apiClient.post<MarketingUnitSingleFormResponseType>("/api/realEstate/marketingUnit/single", {projectId, unitId})
            .then((res) => { if (!cancelled) setUnit(res.data.unit); })
            .catch(() => { if (!cancelled) setUnit(null); });
        return () => { cancelled = true; };
    }, [projectId, unitId]);

    if (unit === undefined) return <Loader />;
    if (!unit) return <PortalNotFound />;
    const currency = unit.priceCurrency?.abbreviation;
    const price = unit.priceOnRequest || unit.price == null
        ? resolveLanguageKey("priceOnRequest")
        : currency ? formatCurrency(unit.price, currency) : formatNumber(unit.price);
    const facts = [
        unit.areaSqm != null && {icon: Maximize, label: resolveLanguageKey("facts.area"), value: `${unit.areaSqm} m²`},
        unit.bedrooms != null && {icon: BedDouble, label: resolveLanguageKey("facts.bedrooms"), value: String(unit.bedrooms)},
        unit.bathrooms != null && {icon: Bath, label: resolveLanguageKey("facts.bathrooms"), value: String(unit.bathrooms)},
        unit.floorLabel && {icon: Layers, label: resolveLanguageKey("facts.floor"), value: unit.floorLabel},
    ].filter((fact): fact is {icon: LucideIcon; label: string; value: string} => Boolean(fact));
    const images = [unit.mainImage, ...(unit.imageGallery ?? [])].filter((image): image is string => Boolean(image));
    const tone = unit.status === "available" ? "success"
        : unit.status === "reserved" ? "warning"
        : unit.status === "sold" || unit.status === "unavailable" ? "destructive"
        : undefined;

    return (
        <DetailPage
            kind="project"
            title={unit.name}
            crumbs={unit.projectName ? [{label: unit.projectName, to: `${base}/projects/${unit.projectId}`}] : []}
            media={images.length || unit.videoGallery?.length
                ? <DetailGallery title={unit.name} images={images} videos={unit.videoGallery} shape="landscape" />
                : undefined}
            story={(
                <>
                    {FEATURES.some((feature) => unit[feature]) ? (
                        <DetailSection title={resolveLanguageKey("featuresTitle")}>
                            <div className="flex flex-wrap gap-2">
                                {FEATURES.filter((feature) => unit[feature]).map((feature) => (
                                    <Badge key={feature} variant="outline">{resolveLanguageKey(`features.${feature}`)}</Badge>
                                ))}
                            </div>
                        </DetailSection>
                    ) : null}
                    {unit.description ? (
                        <DetailSection title={resolveLanguageKey("description")}>
                            <DetailText>{unit.description}</DetailText>
                        </DetailSection>
                    ) : null}
                    {unit.floorPlanImage && !images.includes(unit.floorPlanImage) ? (
                        <DetailSection title={resolveLanguageKey("floorPlan")}>
                            <img src={unit.floorPlanImage} alt={resolveLanguageKey("floorPlan")} className="w-full rounded-2xl border bg-card object-contain p-4" />
                        </DetailSection>
                    ) : null}
                </>
            )}
        >
            <PortalProviderCard kind="unit" />
            <DetailHeading eyebrow={unit.edificeName} title={unit.name}>
                <DetailPrice amount={price} />
                {tone ? <DetailStatus tone={tone}>{resolveLanguageKey(`status.${unit.status}`)}</DetailStatus> : null}
            </DetailHeading>
            {facts.length ? <DetailFacts facts={facts} /> : null}
            <PropertyInquiryForm projectId={unit.projectId} unitId={unit._id} />
        </DetailPage>
    );
}

export default compose(withLanguage("src/modules/propertyManagement/clients/portal/propertyUnit.tsx"))(PropertyUnit);
