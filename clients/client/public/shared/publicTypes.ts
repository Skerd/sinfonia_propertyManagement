import type {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";

export type PublicLanguageProps = Pick<WithLanguageType, "resolveLanguageKey" | "currentLanguage" | "languageCode">;

export type PropertyTypeId = "apartment" | "studio" | "penthouse" | "commercial" | "villa";

export type MarketingPolygonCoordinate = {x: number; y: number};

export type MarketingPolygonItem = {
    _id: string;
    name: string;
    polygonCoordinates: MarketingPolygonCoordinate[];
};

export type MarketingProject = {
    _id: string;
    name: string;
    slug?: string;
    location?: string;
    city?: string;
    mainImage?: string;
    imageGallery?: string[];
    minSharePrice?: number;
    maxSharePrice?: number;
    projectedYieldPercent?: number;
    ownershipType?: "full" | "co-ownership" | "tokenization";
    status?: string;
    unitCount?: number;
    availableUnitCount?: number;
    edificeCount?: number;
    floorCount?: number;
    propertyTypes?: PropertyTypeId[];
    bedroomRange?: {min: number; max: number};
    areaSqmRange?: {min: number; max: number};
};

export type MarketingUnitStatus = "available" | "reserved" | "sold";

export type MarketingUnitListItem = {
    _id: string;
    name: string;
    status: MarketingUnitStatus;
    areaSqm?: number;
    bedrooms?: number;
    bathrooms?: number;
    price?: number;
    mainImage?: string;
    propertyType?: PropertyTypeId;
    floorLabel?: string;
    edificeId?: string;
    floorId?: string;
};

export type MarketingFloorListItem = {
    _id: string;
    name: string;
    mainImage?: string;
    levelNumber?: string | number;
    unitsCoordinates?: MarketingPolygonItem[];
    units?: MarketingUnitListItem[];
};

export type MarketingEdificeListItem = {
    _id: string;
    name: string;
    mainImage?: string;
    floorsCoordinates?: MarketingPolygonItem[];
    floors?: MarketingFloorListItem[];
};

export type MarketingProjectSingle = MarketingProject & {
    description?: string;
    amenities?: string[];
    latitude?: number;
    longitude?: number;
    floorPlans?: {label: string; url: string}[];
    edificesCoordinates?: MarketingPolygonItem[];
    edifices?: MarketingEdificeListItem[];
};

export type MarketingUnitPriceCurrency = {
    symbol?: string;
    abbreviation?: string;
};

export type MarketingUnitPricePerSqm = {
    value: number;
    currency?: MarketingUnitPriceCurrency;
};

export type MarketingUnitSingle = {
    _id: string;
    name: string;
    projectId: string;
    status: string;
    areaSqm?: number;
    bedrooms?: number;
    bathrooms?: number;
    price?: number;
    sharePrice?: number;
    projectedYield?: number;
    imageGallery?: string[];
    description?: string;
    grossAreaSqm?: number;
    netAreaSqm?: number;
    sharedAreaSqm?: number;
    floorLabel?: string;
    floorLevel?: string | number;
    totalFloorsInEdifice?: number;
    propertyType?: PropertyTypeId;
    floorPlanImage?: string;
    priceCurrency?: MarketingUnitPriceCurrency;
    unitTypeName?: string;
    averagePricePerSquareMeter?: MarketingUnitPricePerSqm;
    hasBalcony?: boolean;
    hasTerrace?: boolean;
    hasSeaView?: boolean;
    hasCityView?: boolean;
    hasLakeView?: boolean;
    hasElevator?: boolean;
};

export type MarketingTeamMember = {
    _id: string;
    name: string;
    role: string;
    image?: string;
};

export type MarketingProjectsResponse = {
    projects: MarketingProject[];
    total: number;
};

export type MarketingProjectsCatalogFilterOptions = {
    cities: string[];
    propertyTypes: PropertyTypeId[];
    bedroomOptions: string[];
    priceBounds: {min: number; max: number};
    projects: {_id: string; name: string}[];
};

export type MarketingProjectsCatalogResponse = {
    projects: MarketingProject[];
    total: number;
    filterOptions: MarketingProjectsCatalogFilterOptions;
};

export type MarketingProjectCatalogSingleResponse = {
    project: MarketingProjectSingle;
};

export type MarketingTeamResponse = {
    members: MarketingTeamMember[];
};

export type MarketingAvailabilityDay = {
    date: string;
    availableSlots: number;
    totalSlots: number;
};

export type MarketingAvailabilityResponse = {
    days: MarketingAvailabilityDay[];
};
