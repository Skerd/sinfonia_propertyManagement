import {compose} from "redux";
import {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import {IconBath, IconBed, IconMaximize, IconStack2, type TablerIcon} from "@tabler/icons-react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import useHttpRequest, {type HttpRequest} from "@coreModule/helpers/hooks/useHttpRequest.ts";
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

const UNIT_REQUEST: HttpRequest = {method: "post", url: "/api/realEstate/marketingUnit/single"};

const FEATURES = ["hasBalcony", "hasTerrace", "hasSeaView", "hasCityView", "hasLakeView", "hasElevator"] as const;

/** One unit of a development: its photos, facts and price, and an inquiry about it. */
function PropertyUnit({resolveLanguageKey}: WithLanguageType) {
    const base = useSectionBase();
    const {projectId = "", unitId = ""} = useParams();
    // One request per unit.
    const [fetchCount, setFetchCount] = useState(0);
    useEffect(() => {
        setFetchCount((count) => count + 1);
    }, [projectId, unitId]);
    const request = useHttpRequest<MarketingUnitSingleFormResponseType>(UNIT_REQUEST, {projectId, unitId}, fetchCount);
    const unit: MarketingUnitSingleItem | null | undefined =
        fetchCount === 0 || request.loading ? undefined : request.error ? null : request.data?.unit ?? null;

    if (unit === undefined) return <Loader />;
    if (!unit) return <PortalNotFound />;
    const currency = unit.priceCurrency?.abbreviation;
    const price = unit.priceOnRequest || unit.price == null
        ? resolveLanguageKey("priceOnRequest")
        : currency ? formatCurrency(unit.price, currency) : formatNumber(unit.price);
    const facts = [
        unit.areaSqm != null && {icon: IconMaximize, label: resolveLanguageKey("facts.area"), value: `${unit.areaSqm} m²`},
        unit.bedrooms != null && {icon: IconBed, label: resolveLanguageKey("facts.bedrooms"), value: String(unit.bedrooms)},
        unit.bathrooms != null && {icon: IconBath, label: resolveLanguageKey("facts.bathrooms"), value: String(unit.bathrooms)},
        unit.floorLabel && {icon: IconStack2, label: resolveLanguageKey("facts.floor"), value: unit.floorLabel},
    ].filter((fact): fact is {icon: TablerIcon; label: string; value: string} => Boolean(fact));
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
