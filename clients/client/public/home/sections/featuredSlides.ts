import {figmaAssets} from "@propertyManagementModule/clients/client/public/shared/figmaAssets.ts";

export type FeaturedSlide = {
    id: number;
    nodeId: string;
    image: string;
    title: string;
    location: string;
    type: string;
};

export const FEATURED_SECTION_COPY =
    "Explore our collection of premium properties — apartments, villas and commercial spaces in the best locations.";

export const featuredSlides: FeaturedSlide[] = [
    {
        id: 0,
        nodeId: "71:1823",
        image: figmaAssets.featured1,
        title: "Skyline Residence",
        location: "Tirana",
        type: "Apartment",
    },
    {
        id: 1,
        nodeId: "71:1837",
        image: figmaAssets.featured2,
        title: "Harbor View Villa",
        location: "Durrës",
        type: "Villa",
    },
    {
        id: 2,
        nodeId: "71:1825",
        image: figmaAssets.featured3,
        title: "Central Park Loft",
        location: "Tirana",
        type: "Loft",
    },
    {
        id: 3,
        nodeId: "71:1826",
        image: figmaAssets.featured4,
        title: "Riverside Penthouse",
        location: "Vlorë",
        type: "Penthouse",
    },
    {
        id: 4,
        nodeId: "71:1827",
        image: figmaAssets.featured5,
        title: "Marina Bay Suite",
        location: "Sarandë",
        type: "Suite",
    },
    {
        id: 5,
        nodeId: "71:1828",
        image: figmaAssets.featured6,
        title: "Garden Terrace",
        location: "Tirana",
        type: "Apartment",
    },
    {
        id: 6,
        nodeId: "71:1829",
        image: figmaAssets.featured7,
        title: "Old Town Studio",
        location: "Berat",
        type: "Studio",
    },
    {
        id: 7,
        nodeId: "71:1830",
        image: figmaAssets.featured8,
        title: "Coastal Retreat",
        location: "Himara",
        type: "Villa",
    },
];
