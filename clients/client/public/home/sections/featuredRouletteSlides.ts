import {figmaAssets} from "@propertyManagementModule/clients/client/public/shared/figmaAssets.ts";

export type FeaturedRouletteSlide = {
    id: number;
    nodeId: string;
    image: string;
    title: string;
};

export const featuredRouletteSlides: FeaturedRouletteSlide[] = [
    {id: 0, nodeId: "71:1823", image: figmaAssets.featured1, title: "Skyline Residence"},
    {id: 1, nodeId: "71:1837", image: figmaAssets.featured2, title: "Harbor View Villa"},
    {id: 2, nodeId: "71:1825", image: figmaAssets.featured3, title: "Central Park Loft"},
    {id: 3, nodeId: "71:1826", image: figmaAssets.featured4, title: "Riverside Penthouse"},
    {id: 4, nodeId: "71:1827", image: figmaAssets.featured5, title: "Marina Bay Suite"},
    {id: 5, nodeId: "71:1828", image: figmaAssets.featured6, title: "Garden Terrace"},
    {id: 6, nodeId: "71:1829", image: figmaAssets.featured7, title: "Old Town Studio"},
    {id: 7, nodeId: "71:1830", image: figmaAssets.featured8, title: "Coastal Retreat"},
];
