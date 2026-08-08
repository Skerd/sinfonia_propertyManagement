export type DyeusRoute = {
    path: string;
    labelKey: string;
    nodeId: string;
    frameName: string;
};

export const dyeusRoutes: DyeusRoute[] = [
    {path: "/", labelKey: "navHome", nodeId: "44:2", frameName: "Home"},
    {path: "/about", labelKey: "navAbout", nodeId: "199:35", frameName: "About us"},
    {path: "/residences", labelKey: "navResidences", nodeId: "44:residences", frameName: "Open Project - 3D"},
    {path: "/gallery", labelKey: "navGallery", nodeId: "44:gallery", frameName: "Gallery"},
    {path: "/journal", labelKey: "navJournal", nodeId: "44:journal", frameName: "Journal"},
    {path: "/journal/story", labelKey: "navJournalStory", nodeId: "44:journal-story", frameName: "Journal Story"},
    {path: "/contact", labelKey: "navContact", nodeId: "44:contact", frameName: "Contact"},
    {path: "/privacy", labelKey: "navPrivacy", nodeId: "44:privacy", frameName: "Privacy Policy"},
    {path: "/terms", labelKey: "navTerms", nodeId: "44:terms", frameName: "Terms of Conditions"},
    {path: "/property", labelKey: "navProperty", nodeId: "44:property", frameName: "Property view"},
];

export const dyeusMenuLinks = [
    {path: "/about", labelKey: "navAbout"},
    {path: "/residences", labelKey: "navResidences"},
    {path: "/gallery", labelKey: "navGallery"},
    {path: "/journal", labelKey: "navJournal"},
    {path: "/contact", labelKey: "navContact"},
] as const;
