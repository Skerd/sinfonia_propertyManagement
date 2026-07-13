import filterIcon from "@propertyManagementModule/assets/images/public/projects/filter-icon.svg";
import heartOutline from "@propertyManagementModule/assets/images/public/projects/heart-outline.png";
import iconFloors from "@propertyManagementModule/assets/images/public/projects/icon-floors.png";
import iconUnits from "@propertyManagementModule/assets/images/public/projects/icon-units.png";
import iconBuild from "@propertyManagementModule/assets/images/public/projects/icon-build.png";
import cardPlaceholder from "@propertyManagementModule/assets/images/public/projects/card-placeholder.png";
import filterClose from "@propertyManagementModule/assets/images/public/projects/filters/close-outline.png";
import filterChevronRight from "@propertyManagementModule/assets/images/public/projects/filters/chevron-right-outline.png";
import propertyTypeApartment from "@propertyManagementModule/assets/images/public/projects/filters/property-type-apartment.png";
import propertyTypeBuilding from "@propertyManagementModule/assets/images/public/projects/filters/property-type-building.png";
import priceSliderThumb from "@propertyManagementModule/assets/images/public/projects/filters/price-slider-thumb.png";
import priceHistogram from "@propertyManagementModule/assets/images/public/projects/filters/price-histogram.png";
import type {PropertyTypeId} from "@propertyManagementModule/clients/client/public/projects/shared/projectsFilterTypes.ts";

export const projectsAssets = {
    filterIcon,
    heartOutline,
    iconFloors,
    iconUnits,
    iconBuild,
    cardPlaceholder,
    filterClose,
    filterChevronRight,
    propertyTypeApartment,
    propertyTypeBuilding,
    priceSliderThumb,
    priceHistogram,
} as const;

export const projectsPropertyTypeIcons: Record<PropertyTypeId, string> = {
    apartment: propertyTypeApartment,
    studio: propertyTypeBuilding,
    penthouse: propertyTypeBuilding,
    commercial: propertyTypeBuilding,
    villa: propertyTypeBuilding,
};
