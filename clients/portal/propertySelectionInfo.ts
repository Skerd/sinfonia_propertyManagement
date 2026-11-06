import {IconBolt, IconBuildingSkyscraper, IconBuildingWarehouse, IconCar, IconHome, IconLeaf, IconMaximize, IconStack2, type TablerIcon} from "@tabler/icons-react";
import {formatNumber} from "@coreModule/helpers/general/numbers.ts";
import {parseFloorLevel} from "@propertyManagementModule/clients/client/public/project/shared/parseFloorLevel.ts";
import type {
    MarketingEdificeCatalogListItem,
    MarketingFloorCatalogListItem,
} from "armonia/src/modules/propertyManagement/api/realEstate/public/marketingProjectCatalog/marketingProjectCatalogSingle.form.response.type.ts";

type Translate = (key: string) => string;
export type SelectionFact = {icon: TablerIcon; label: string; value: string};
export type SelectionSpec = {label: string; value: string};

export function floorLabel(floor: MarketingFloorCatalogListItem, resolveLanguageKey: Translate) {
    if (floor.name?.trim()) return floor.name;
    const level = parseFloorLevel(floor.levelNumber);
    if (level === -1) return resolveLanguageKey("explorer.basement");
    if (level === 0) return resolveLanguageKey("explorer.ground");
    return resolveLanguageKey("explorer.floorN").replace("{n}", String(level));
}

export function edificePlace(edifice: MarketingEdificeCatalogListItem) {
    return [edifice.street, edifice.postalCode, edifice.city || edifice.location].filter(Boolean).join(" · ");
}

export function floorUnitCounts(floor: MarketingFloorCatalogListItem) {
    const units = floor.units ?? [];
    return {
        unitCount: units.length,
        availableUnitCount: units.filter((unit) => unit.status === "available").length,
        soldUnitCount: units.filter((unit) => unit.status === "sold").length,
    };
}

function rate(amount: number | undefined, currency: string | undefined, resolveLanguageKey: Translate) {
    if (amount == null) return undefined;
    const number = formatNumber(amount);
    const suffix = resolveLanguageKey("perSqm");
    return currency ? `${number} ${currency}${suffix}` : `${number}${suffix}`;
}

function present(facts: (SelectionFact | false | "" | 0 | undefined | null)[]): SelectionFact[] {
    return facts.filter((fact): fact is SelectionFact => Boolean(fact));
}

function presentSpecs(rows: (SelectionSpec | false | "" | 0 | undefined | null)[]): SelectionSpec[] {
    return rows.filter((row): row is SelectionSpec => Boolean(row));
}

export function edificeFacts(edifice: MarketingEdificeCatalogListItem, resolveLanguageKey: Translate): SelectionFact[] {
    return present([
        edifice.floorCount != null && {icon: IconStack2, label: resolveLanguageKey("facts.floors"), value: String(edifice.floorCount)},
        edifice.unitCount != null && {icon: IconBuildingSkyscraper, label: resolveLanguageKey("facts.units"), value: String(edifice.unitCount)},
        edifice.availableUnitCount != null && {icon: IconHome, label: resolveLanguageKey("facts.available"), value: String(edifice.availableUnitCount)},
        edifice.totalAreaSqm ? {icon: IconMaximize, label: resolveLanguageKey("facts.area"), value: `${formatNumber(edifice.totalAreaSqm)} m²`} : undefined,
        edifice.parkingSpaces ? {icon: IconCar, label: resolveLanguageKey("facts.parking"), value: String(edifice.parkingSpaces)} : undefined,
        edifice.energyClass && {icon: IconBolt, label: resolveLanguageKey("facts.energy"), value: edifice.energyClass},
        edifice.greenAreaSqm ? {icon: IconLeaf, label: resolveLanguageKey("facts.green"), value: `${formatNumber(edifice.greenAreaSqm)} m²`} : undefined,
        edifice.garages ? {icon: IconBuildingWarehouse, label: resolveLanguageKey("facts.garages"), value: String(edifice.garages)} : undefined,
    ]);
}

export function floorFacts(floor: MarketingFloorCatalogListItem, resolveLanguageKey: Translate): SelectionFact[] {
    const counts = floorUnitCounts(floor);
    return present([
        floor.areaSqm ? {icon: IconMaximize, label: resolveLanguageKey("facts.area"), value: `${formatNumber(floor.areaSqm)} m²`} : undefined,
        counts.unitCount > 0 && {icon: IconBuildingSkyscraper, label: resolveLanguageKey("facts.units"), value: String(counts.unitCount)},
        counts.unitCount > 0 && {icon: IconHome, label: resolveLanguageKey("facts.available"), value: String(counts.availableUnitCount)},
        counts.soldUnitCount > 0 && {icon: IconStack2, label: resolveLanguageKey("facts.sold"), value: String(counts.soldUnitCount)},
    ]);
}

export function edificeSpecs(edifice: MarketingEdificeCatalogListItem, resolveLanguageKey: Translate): SelectionSpec[] {
    const currency = edifice.saleCurrency;
    return presentSpecs([
        edifice.floorsAboveGround != null && {label: resolveLanguageKey("specs.floorsAbove"), value: String(edifice.floorsAboveGround)},
        edifice.floorsUnderGround != null && {label: resolveLanguageKey("specs.floorsBelow"), value: String(edifice.floorsUnderGround)},
        edifice.distanceFromCityCenterM != null && {label: resolveLanguageKey("specs.distance"), value: `${formatNumber(edifice.distanceFromCityCenterM)} m`},
        edifice.constructionStartYear != null && {label: resolveLanguageKey("specs.construction"), value: String(edifice.constructionStartYear)},
        edifice.expectedCompletionYear != null && {label: resolveLanguageKey("specs.completion"), value: String(edifice.expectedCompletionYear)},
        !edifice.priceOnRequest && edifice.verandaPricePerSqm != null && {
            label: resolveLanguageKey("specs.verandaPerSqm"),
            value: rate(edifice.verandaPricePerSqm, currency, resolveLanguageKey) ?? "",
        },
    ]);
}

export function floorSpecs(
    floor: MarketingFloorCatalogListItem,
    edifice: MarketingEdificeCatalogListItem,
    resolveLanguageKey: Translate,
): SelectionSpec[] {
    const currency = edifice.saleCurrency;
    const hidePrice = floor.priceOnRequest || edifice.priceOnRequest;
    const floorRate = rate(floor.pricePerSqm, currency, resolveLanguageKey);
    const veranda = rate(floor.verandaPricePerSqm, currency, resolveLanguageKey);
    return presentSpecs([
        !hidePrice && floorRate && {label: resolveLanguageKey("specs.pricePerSqm"), value: floorRate},
        !hidePrice && veranda && {label: resolveLanguageKey("specs.verandaPerSqm"), value: veranda},
    ]);
}

export function selectionPrice(
    edifice: MarketingEdificeCatalogListItem | undefined,
    floor: MarketingFloorCatalogListItem | undefined,
    resolveLanguageKey: Translate,
) {
    if (floor?.priceOnRequest || edifice?.priceOnRequest) {
        return {amount: resolveLanguageKey("priceOnRequest")};
    }
    const currency = edifice?.saleCurrency;
    const amount = rate(floor?.pricePerSqm ?? edifice?.pricePerSqm, currency, resolveLanguageKey);
    return amount ? {amount, note: resolveLanguageKey("fromPrice")} : undefined;
}

export function extraMedia(
    mainImage: string | undefined,
    imageGallery: string[] | undefined,
    videoGallery: string[] | undefined,
) {
    const images = (imageGallery ?? []).filter((src) => src && src !== mainImage);
    const videos = (videoGallery ?? []).filter(Boolean);
    return {images, videos};
}
