/** Figma frames on page "UI Design" — canonical node ids for public routes */
export const FIGMA_CANVAS_WIDTH = 1728;

export type FigmaPublicRoute = {
    path: string;
    label: string;
    nodeId: string;
    frameName: string;
    height: number;
};

export const figmaPublicRoutes: FigmaPublicRoute[] = [
    {path: "/", label: "Home", nodeId: "41:196", frameName: "Homepage", height: 9694},
    {path: "/projects", label: "Properties", nodeId: "268:235", frameName: "Projects Gallery", height: 3668},
    {path: "/about", label: "About Pronix", nodeId: "331:676", frameName: "About PRONIX", height: 5597},
    {path: "/investors", label: "For Investors", nodeId: "331:2854", frameName: "For investors", height: 9577},
    {path: "/developers", label: "For Developers", nodeId: "343:294", frameName: "For developers", height: 10236},
    {path: "/project", label: "Open project", nodeId: "472:997", frameName: "Open project - Gallery", height: 1117},
    {path: "/open-project/3d", label: "Open project 3D", nodeId: "467:685", frameName: "Open project - 3D", height: 1117},
    {path: "/open-project/gallery", label: "Open project Gallery", nodeId: "472:997", frameName: "Open project - Gallery", height: 1117},
    {path: "/open-project/finance", label: "Open project Finance", nodeId: "475:1240", frameName: "Open project - Finance", height: 1117},
    {path: "/open-project/grid", label: "Open project Grid", nodeId: "494:548", frameName: "Open project - Grid view", height: 4363},
    {path: "/property", label: "Property View", nodeId: "515:4258", frameName: "Property view", height: 3636},
    {path: "/contact", label: "Contact", nodeId: "305:228", frameName: "Contact us", height: 1117},
    {path: "/privacy", label: "Privacy Policy", nodeId: "legal:privacy", frameName: "Privacy Policy", height: 2000},
    {path: "/terms", label: "Terms of Conditions", nodeId: "legal:terms", frameName: "Terms of Conditions", height: 2000},
];

export const figmaMenuLinks = [
    {path: "/projects", label: "Properties"},
    {path: "/about", label: "About Pronix"},
    {path: "/investors", label: "For Investors"},
    {path: "/developers", label: "For Developers"},
    {path: "/contact", label: "Contact"},
] as const;
