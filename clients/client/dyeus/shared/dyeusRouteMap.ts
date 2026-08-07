export type DyeusRoute = {
    path: string;
    label: string;
    nodeId: string;
    frameName: string;
};

export const dyeusRoutes: DyeusRoute[] = [
    {path: "/", label: "Home", nodeId: "44:2", frameName: "Home"},
    {path: "/about", label: "About us", nodeId: "199:35", frameName: "About us"},
    {path: "/residences", label: "Residences", nodeId: "44:residences", frameName: "Open Project - 3D"},
    {path: "/gallery", label: "Gallery", nodeId: "44:gallery", frameName: "Gallery"},
    {path: "/journal", label: "Journal", nodeId: "44:journal", frameName: "Journal"},
    {path: "/journal/story", label: "Journal Story", nodeId: "44:journal-story", frameName: "Journal Story"},
    {path: "/contact", label: "Contact", nodeId: "44:contact", frameName: "Contact"},
    {path: "/privacy", label: "Privacy Policy", nodeId: "44:privacy", frameName: "Privacy Policy"},
    {path: "/terms", label: "Terms of Conditions", nodeId: "44:terms", frameName: "Terms of Conditions"},
    {path: "/property", label: "Property", nodeId: "44:property", frameName: "Property view"},
];

export const dyeusMenuLinks = [
    {path: "/about", label: "About us"},
    {path: "/residences", label: "Residences"},
    {path: "/gallery", label: "Gallery"},
    {path: "/journal", label: "Journal"},
    {path: "/contact", label: "Contact"},
] as const;
