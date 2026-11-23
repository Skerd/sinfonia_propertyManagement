import {compose} from "redux";
import {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import {IconBed, IconBuildingSkyscraper, IconHome, IconMapPin, IconMaximize, type TablerIcon} from "@tabler/icons-react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import useHttpRequest from "@coreModule/helpers/hooks/useHttpRequest.ts";
import {PROJECT_REQUEST} from "./propertyRequests.ts";
import {formatNumber} from "@coreModule/helpers/general/numbers.ts";
import Loader from "@coreModule/components/custom/loader/loader.tsx";
import {Badge} from "@coreModule/components/ui/badge.tsx";
import PortalNotFound from "@coreModule/clients/portal/notFound/index.tsx";
import {useSectionBase} from "@coreModule/clients/portal/shared/sectionBase.tsx";
import DetailPage, {DetailFacts, DetailHeading, DetailPrice, DetailSection, DetailSpecs, DetailText} from "@coreModule/clients/portal/shared/detailPage.tsx";
import DetailGallery from "@coreModule/clients/portal/shared/detailGallery.tsx";
import PortalProviderCard from "@coreModule/clients/portal/shared/portalProviderCard.tsx";
import type {
    MarketingEdificeCatalogListItem,
    MarketingFloorCatalogListItem,
    MarketingProjectCatalogSingleFormResponseType,
    MarketingProjectCatalogSingleItem,
} from "armonia/src/modules/propertyManagement/api/realEstate/public/marketingProjectCatalog/marketingProjectCatalogSingle.form.response.type.ts";
import PropertyInquiryForm from "./propertyInquiryForm.tsx";
import PropertyPolygonExplorer from "./propertyPolygonExplorer.tsx";
import {
    edificeFacts,
    edificePlace,
    edificeSpecs,
    extraMedia,
    floorFacts,
    floorLabel,
    floorSpecs,
    selectionPrice,
} from "./propertySelectionInfo.ts";


function Badges({items}: {items: readonly string[]}) {
    return (
        <div className="flex flex-wrap gap-2">
            {items.map((item) => <Badge key={item} variant="outline">{item}</Badge>)}
        </div>
    );
}

/** One development: its photos, a plan you can hover to pick a building or floor, and an inquiry. */
function PropertyProject({resolveLanguageKey}: WithLanguageType) {
    const base = useSectionBase();
    const {projectId = ""} = useParams();
    const [edifice, setEdifice] = useState<MarketingEdificeCatalogListItem>();
    const [floor, setFloor] = useState<MarketingFloorCatalogListItem>();
    // One request per project; the picked building and floor reset with it.
    const [fetchCount, setFetchCount] = useState(0);
    useEffect(() => {
        setEdifice(undefined);
        setFloor(undefined);
        setFetchCount((count) => count + 1);
    }, [projectId]);
    const request = useHttpRequest<MarketingProjectCatalogSingleFormResponseType>(PROJECT_REQUEST, {projectId}, fetchCount);
    const project: MarketingProjectCatalogSingleItem | null | undefined =
        fetchCount === 0 || request.loading ? undefined : request.error ? null : request.data?.project ?? null;

    if (project === undefined) return <Loader />;
    if (!project) return <PortalNotFound />;
    const projectPlace = project.location ?? project.city;
    const hasPlan = (project.edifices?.length ?? 0) > 0 || (project.edificesCoordinates?.length ?? 0) > 0;
    const saleCurrency = edifice?.saleCurrency ?? project.edifices?.[0]?.saleCurrency;
    const min = project.minSharePrice;
    const max = project.maxSharePrice;
    const range = min != null && max != null && max !== min;
    const numbers = min == null ? null : range ? `${formatNumber(min)}–${formatNumber(max)}` : formatNumber(min);
    const projectPrice = numbers == null ? resolveLanguageKey("priceOnRequest") : saleCurrency ? `${numbers} ${saleCurrency}` : numbers;
    const projectFacts = [
        project.unitCount != null && {icon: IconBuildingSkyscraper, label: resolveLanguageKey("facts.units"), value: String(project.unitCount)},
        project.availableUnitCount != null && {icon: IconHome, label: resolveLanguageKey("facts.available"), value: String(project.availableUnitCount)},
        project.bedroomRange && {icon: IconBed, label: resolveLanguageKey("facts.bedrooms"), value: `${project.bedroomRange.min}–${project.bedroomRange.max}`},
        project.areaSqmRange && {icon: IconMaximize, label: resolveLanguageKey("facts.area"), value: `${project.areaSqmRange.min}–${project.areaSqmRange.max} m²`},
    ].filter((fact): fact is {icon: TablerIcon; label: string; value: string} => Boolean(fact));
    const images = [project.mainImage, ...(project.imageGallery ?? [])].filter((image): image is string => Boolean(image));
    const pickedPrice = selectionPrice(edifice, floor, resolveLanguageKey);
    const heading = floor && edifice
        ? {eyebrow: edifice.name, title: floorLabel(floor, resolveLanguageKey), place: edificePlace(edifice), facts: floorFacts(floor, resolveLanguageKey), price: pickedPrice}
        : edifice
            ? {eyebrow: edifice.name === project.name ? undefined : project.name, title: edifice.name, place: edificePlace(edifice), facts: edificeFacts(edifice, resolveLanguageKey), price: pickedPrice}
            : {title: project.name, place: projectPlace, facts: projectFacts, price: {amount: projectPrice, note: min != null && (max == null || max === min) ? resolveLanguageKey("fromPrice") : undefined}};
    const media = extraMedia(
        floor?.mainImage ?? edifice?.mainImage,
        floor?.imageGallery ?? edifice?.imageGallery,
        floor?.videoGallery ?? edifice?.videoGallery,
    );
    const flags = [
        floor?.isAccessible && resolveLanguageKey("accessible"),
        floor?.hasEmergencyExit && resolveLanguageKey("emergencyExit"),
    ].filter((flag): flag is string => Boolean(flag));
    const specs = floor && edifice ? floorSpecs(floor, edifice, resolveLanguageKey) : edifice ? edificeSpecs(edifice, resolveLanguageKey) : [];

    return (
        <DetailPage
            kind="project"
            title={heading.title}
            // The project as the catalog's card lists it, whichever building or floor is open, for its heart (TD-F148).
            keep={{kind: "project", id: project._id, section: "properties", path: `/projects/${project._id}`, title: project.name}}
            media={hasPlan
                ? (
                    <PropertyPolygonExplorer
                        project={project}
                        unitTo={(unitId) => `${base}/projects/${project._id}/units/${unitId}`}
                        resolveLanguageKey={resolveLanguageKey}
                        onSelectionChange={(nextEdifice, nextFloor) => {
                            setEdifice(nextEdifice);
                            setFloor(nextFloor);
                        }}
                    />
                )
                : <DetailGallery title={project.name} images={images} videos={project.videoGallery} shape="landscape" />}
            story={(
                <>
                    {floor?.description ? (
                        <DetailSection title={resolveLanguageKey("descriptionFloor")}>
                            <DetailText>{floor.description}</DetailText>
                        </DetailSection>
                    ) : !floor && !edifice && project.description ? (
                        <DetailSection title={resolveLanguageKey("description")}>
                            <DetailText>{project.description}</DetailText>
                        </DetailSection>
                    ) : null}
                    {floor?.sharedSpaces?.length ? (
                        <DetailSection title={resolveLanguageKey("sharedSpaces")}>
                            <Badges items={floor.sharedSpaces} />
                        </DetailSection>
                    ) : null}
                    {flags.length ? (
                        <DetailSection title={resolveLanguageKey("floorTraits")}>
                            <Badges items={flags} />
                        </DetailSection>
                    ) : null}
                    {edifice && !floor && edifice.commercialFacilities?.length ? (
                        <DetailSection title={resolveLanguageKey("facilities")}>
                            <Badges items={edifice.commercialFacilities} />
                        </DetailSection>
                    ) : null}
                    {edifice && !floor && edifice.neighborhoodFacilities?.length ? (
                        <DetailSection title={resolveLanguageKey("neighborhood")}>
                            <Badges items={edifice.neighborhoodFacilities} />
                        </DetailSection>
                    ) : null}
                    {edifice && !floor && edifice.constructors?.length ? (
                        <DetailSection title={resolveLanguageKey("constructors")}>
                            <Badges items={edifice.constructors} />
                        </DetailSection>
                    ) : null}
                    {!floor && !edifice && project.amenities?.length ? (
                        <DetailSection title={resolveLanguageKey("amenities")}>
                            <Badges items={project.amenities} />
                        </DetailSection>
                    ) : null}
                    {specs.length ? (
                        <DetailSection title={resolveLanguageKey(floor ? "floorDetails" : "edificeDetails")}>
                            <DetailSpecs rows={specs} />
                        </DetailSection>
                    ) : null}
                    {media.images.length || media.videos.length ? (
                        <DetailSection title={resolveLanguageKey(floor ? "floorGallery" : "edificeGallery")}>
                            <DetailGallery
                                title={heading.title}
                                images={media.images}
                                videos={media.videos}
                                shape="landscape"
                            />
                        </DetailSection>
                    ) : null}
                </>
            )}
        >
            <PortalProviderCard kind="project" />
            <DetailHeading eyebrow={heading.eyebrow} title={heading.title}>
                {heading.place ? <p className="flex items-center gap-1.5 text-muted-foreground"><IconMapPin className="size-4" aria-hidden />{heading.place}</p> : null}
                {heading.price ? <DetailPrice amount={heading.price.amount} note={heading.price.note} /> : null}
            </DetailHeading>
            {heading.facts.length ? <DetailFacts facts={heading.facts} /> : null}
            <PropertyInquiryForm projectId={project._id} />
        </DetailPage>
    );
}

export default compose(withLanguage("src/modules/propertyManagement/clients/portal/propertyProject.tsx"))(PropertyProject);
