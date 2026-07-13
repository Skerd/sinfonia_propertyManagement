import {FIGMA_CANVAS_WIDTH} from "@propertyManagementModule/clients/client/public/shared/figmaRouteMap.ts";

export const FIGMA_CONTENT_WIDTH = 1643;
export const FIGMA_CONTENT_GAP = 32;

export const FIGMA_NUMBERED_STEP_CARD = {
    width: 386.75,
    height: 535,
    gap: 32,
    /** Proportional layout tokens (derived from Figma px — fluid cards, not fixed layout). */
    numberTopRatio: 268 / 535,
    numberFontCqwCap: (331.156 / 386.75) * 100,
    contentTopRatio: 30 / 535,
    contentWidthRatio: 338 / 386.75,
    titleFontCqwCap: (24 / 386.75) * 100,
    bodyFontCqwCap: (20 / 386.75) * 100,
    contentGapCqhCap: (12 / 535) * 100,
} as const;

/** Convert Figma px offsets to horizontal ratio for fluid numbered-step cards. */
export function figmaNumberedStepLeftRatio(leftPx: number) {
    return leftPx / FIGMA_NUMBERED_STEP_CARD.width;
}

export const FIGMA_STAT_CARD = {
    defaultWidth: 525,
    expandedWidth: 869,
    collapsedWidth: 353,
    height: 515,
    gap: 32,
    numberFontCqwCap: (64 / 525) * 100,
    labelFontCqwCap: (44 / 525) * 100,
    hoverTextFontCqwCap: (24 / 525) * 100,
    logoLeftRatio: 481 / 525,
    logoTopRatio: 29 / 515,
    logoWidthRatio: 21 / 525,
    logoHeightRatio: 40 / 515,
    hoverTextLeftRatio: 23 / 525,
    hoverTextTopRatio: 200 / 515,
    hoverTextWidthRatio: 707 / 525,
    statBlockLeftRatio: 24 / 525,
    statBlockTopRatio: 362 / 515,
} as const;

export const FIGMA_CTA_ROW = {
    width: 1643.22,
    leftCardWidth: 801,
    rightCardWidth: 802,
    height: 691,
    gap: 40.22,
} as const;

export const FIGMA_OWNERSHIP_CARD = {
    width: 406,
    height: 837,
    gap: 32,
    imageWidth: 344,
    imageHeight: 213,
    imageCropTopRatio: -64.92 / 213,
    imageCropWidthRatio: 344 / 344,
    imageCropHeightRatio: 344 / 213,
} as const;

const HERO_ORB_SIZE = 105.539;
const PLATFORM_ORB_SIZE = 787;

export const FIGMA_HERO_ORB = {
    designSize: HERO_ORB_SIZE,
    videoWidthRatio: 202.667 / HERO_ORB_SIZE,
    videoHeightRatio: 152 / HERO_ORB_SIZE,
    offsetXRatio: 2.23 / HERO_ORB_SIZE,
    offsetYRatio: 1.23 / HERO_ORB_SIZE,
    maskWidthRatio: 83.259 / HERO_ORB_SIZE,
    maskHeightRatio: 82.058 / HERO_ORB_SIZE,
    maskXRatio: 58.06 / HERO_ORB_SIZE,
    maskYRatio: 34.899 / HERO_ORB_SIZE,
} as const;

export const FIGMA_PLATFORM_ORB = {
    designSize: PLATFORM_ORB_SIZE,
    videoWidthRatio: 1511.276 / PLATFORM_ORB_SIZE,
    videoHeightRatio: 1133.457 / PLATFORM_ORB_SIZE,
    offsetXRatio: 16.63 / PLATFORM_ORB_SIZE,
    offsetYRatio: 9.18 / PLATFORM_ORB_SIZE,
    maskWidthRatio: 620.856 / PLATFORM_ORB_SIZE,
    maskHeightRatio: 611.901 / PLATFORM_ORB_SIZE,
    maskXRatio: 432.95 / PLATFORM_ORB_SIZE,
    maskYRatio: 260.243 / PLATFORM_ORB_SIZE,
} as const;

/** Platform section layout — ratios derived from Figma px, rendered fluidly. */
export const FIGMA_PLATFORM_SECTION = {
    contentWidth: FIGMA_CONTENT_WIDTH,
    descriptionDesignWidth: 370,
    rowGap: 44,
    orbWidthRatio: PLATFORM_ORB_SIZE / FIGMA_CONTENT_WIDTH,
    descriptionWidthRatio: 370 / FIGMA_CONTENT_WIDTH,
    /** rem caps at 16px root (787px / 370px) — not layout px in components */
    orbRemCap: PLATFORM_ORB_SIZE / 16,
    descriptionRemCap: 370 / 16,
} as const;

export const FIGMA_CAPABILITIES_SECTION = {
    width: FIGMA_CONTENT_WIDTH,
    titleHeight: 67,
    rowTop: 111,
    rowHeight: 535,
    totalHeight: 646,
} as const;

export const FIGMA_ABOUT_STATS_ROW = {
    width: FIGMA_CONTENT_WIDTH,
    height: FIGMA_STAT_CARD.height,
} as const;

/** About mission row — logo + display copy (Figma 368:5022, 368:4989). */
export const FIGMA_ABOUT_MISSION = {
    contentWidth: 1622,
    logoWidth: 106,
    logoHeight: 63.6,
    logoColumnRatio: 106 / 1622,
    spacerColumnRatio: 435 / 1622,
    textColumnRatio: 1077 / 1622,
    titleFontCqwCap: (64 / 1622) * 100,
    titleFontRemCap: 64 / 16,
    titleLineHeight: 1.1,
    mutedColor: "#d0d0d0",
} as const;

/** About founders row — two-up cards (Figma 368:4999). */
export const FIGMA_ABOUT_FOUNDERS = {
    contentWidth: 1622,
    cardWidthRatio: 791 / 1622,
    cardGapRatio: 40 / 1622,
    imageAspect: 791 / 784,
    nameGapCqwCap: (24 / 1622) * 100,
    nameGapRemCap: 24 / 16,
    nameFontCqwCap: (44 / 1622) * 100,
    nameFontRemCap: 44 / 16,
    nameLineHeight: 1.1,
    crops: {
        founder1: {heightRatio: 1.2819, leftRatio: 0, topRatio: 0.0004, widthRatio: 1},
        founder2: {heightRatio: 1.2657, leftRatio: 0, topRatio: 0, widthRatio: 1},
    },
} as const;

export const FIGMA_HERO = {
    width: FIGMA_CANVAS_WIDTH,
    height: 1117,
} as const;

export const FIGMA_OWNERSHIP_ROW = {
    width: FIGMA_CONTENT_WIDTH,
    cardGap: 32,
    get height() {
        return FIGMA_OWNERSHIP_CARD.height;
    },
} as const;

export const FIGMA_NUMBERED_ROW = {
    width: FIGMA_CONTENT_WIDTH,
    titleHeight: 67,
    rowTop: 111,
    rowHeight: FIGMA_NUMBERED_STEP_CARD.height,
    totalHeight: 646,
} as const;

export const FIGMA_HERO_STRIP = {
    width: 2316,
    height: 376,
    imageWidth: 555,
    imageHeight: 376,
    gap: 32,
} as const;

export const FIGMA_INVESTORS_INCOME = {
    contentWidth: 1627,
    mainImageAspect: 1007 / 764,
    sideImageAspect: 495 / 376,
    mainImageCrop: {
        heightRatio: 1,
        leftRatio: 0.0002,
        topRatio: 0,
        widthRatio: 1.1795,
    },
    leftColRatio: 1007 / 1627,
    rightColRatio: 520 / 1627,
} as const;

export const FIGMA_INVESTORS_ALBANIA = {
    collageAspect: 868 / 957,
    columnWidthRatio: 416 / 868,
    leftImageCrop: {
        heightRatio: 1007 / 957,
        leftRatio: -108 / 416,
        topRatio: -21 / 957,
        widthRatio: 1344 / 416,
    },
    rightImageCrop: {
        heightRatio: 1007 / 957,
        leftRatio: -886 / 416,
        topRatio: 0,
        widthRatio: 1508 / 416,
    },
    logoSizeRatio: 195 / 868,
} as const;

export const FIGMA_INVESTORS_CATALOG = {
    frameWidth: 1729,
    frameHeight: 1025,
    copyWidth: 520,
    visualSize: 860,
    copyWidthRatio: 520 / 1729,
    visualWidthRatio: 860 / 1729,
    visualAspect: 1,
    sectionPaddingY: {top: 66, bottom: 82},
    /** rem cap at 16px root (860px / 16px) — not layout px in components */
    visualRemCap: 860 / 16,
} as const;

export const FIGMA_ARCH_CARD = {
    width: 512,
    height: 795,
    gap: 32,
    rowWidth: 1616,
    titleBlockHeight: 140,
    get totalHeight() {
        return this.titleBlockHeight + 44 + this.height;
    },
} as const;

export const FIGMA_PROJECT_CARD = {
    width: 515,
    height: 741,
    gap: 32,
} as const;

export const FIGMA_PROJECTS_GALLERY_HEADER = {
    titleFontRatio: 120 / FIGMA_CANVAS_WIDTH,
    filterIconRatio: 36 / FIGMA_CANVAS_WIDTH,
    filterLabelRatio: 28 / FIGMA_CANVAS_WIDTH,
} as const;

export const FIGMA_OWNERSHIP_LIGHT_ROW = {
    width: 1282,
    titleBlockHeight: 120,
    cardRowHeight: FIGMA_OWNERSHIP_CARD.height,
    gap: 44,
    get totalHeight() {
        return this.titleBlockHeight + this.gap + this.cardRowHeight;
    },
} as const;

/** Footer / LET'S TALK section — ratios for fluid @container layout (Figma 357:360). */
export type FigmaImageCrop = {
    heightRatio: number;
    leftRatio: number;
    topRatio: number;
    widthRatio: number;
};

export type FigmaImageCropStyle = {
    height: string;
    left: string;
    top: string;
    width: string;
};

/** Percent-based image crop from normalized ratios (1 = 100% of container). */
export function figmaImageCropStyle(crop: FigmaImageCrop): FigmaImageCropStyle {
    return {
        height: `${crop.heightRatio * 100}%`,
        left: `${crop.leftRatio * 100}%`,
        top: `${crop.topRatio * 100}%`,
        width: `${crop.widthRatio * 100}%`,
    };
}

export const FIGMA_IMAGE_CROPS = {
    ctaLogo: {
        heightRatio: 2.9047,
        leftRatio: -0.633,
        topRatio: -0.9549,
        widthRatio: 5.3473,
    },
    aboutHeroStrip: {
        heightRatio: 2.3042,
        leftRatio: -1.7128,
        topRatio: -0.6288,
        widthRatio: 13.4662,
    },
    menuLogo: {
        heightRatio: 2.3042,
        leftRatio: -0.1686,
        topRatio: -0.6288,
        widthRatio: 1.3256,
    },
} as const satisfies Record<string, FigmaImageCrop>;

export type OwnershipImageCropKey = "default" | "coown";

export const FIGMA_OWNERSHIP_IMAGE_CROPS: Record<
    OwnershipImageCropKey,
    {top: number; left: number; width: number; height: number}
> = {
    default: {top: -64.92, left: 0, width: 344, height: 344},
    coown: {top: -61, left: 0, width: 366, height: 366},
};

export function ownershipImageCropStyle(key: OwnershipImageCropKey): FigmaImageCropStyle {
    const crop = FIGMA_OWNERSHIP_IMAGE_CROPS[key];
    const {imageWidth, imageHeight} = FIGMA_OWNERSHIP_CARD;
    return {
        top: `${(crop.top / imageHeight) * 100}%`,
        left: `${(crop.left / imageWidth) * 100}%`,
        width: `${(crop.width / imageWidth) * 100}%`,
        height: `${(crop.height / imageHeight) * 100}%`,
    };
}

const DEVELOPERS_FEATURE_ARTBOARD_W = 783;
const DEVELOPERS_FEATURE_ARTBOARD_H = 514;

export const FIGMA_DEVELOPERS_FEATURE_CARD = {
    cardAspect: 783 / 670,
    artboardAspect: DEVELOPERS_FEATURE_ARTBOARD_W / DEVELOPERS_FEATURE_ARTBOARD_H,
    artboardWidth: DEVELOPERS_FEATURE_ARTBOARD_W,
    artboardHeight: DEVELOPERS_FEATURE_ARTBOARD_H,
    imageRowRatio: 514 / 670,
    copyRowRatio: 156 / 670,
    copyPadXRatio: 24 / 783,
    crmThumbAspect: 462 / 157,
    stacks: {
        primary: {
            leftRatio: 183.74 / DEVELOPERS_FEATURE_ARTBOARD_W,
            topRatio: 45 / DEVELOPERS_FEATURE_ARTBOARD_H,
            widthRatio: 416.16 / DEVELOPERS_FEATURE_ARTBOARD_W,
            paddingRatio: 10.361 / 416.16,
        },
        secondary: {
            leftRatio: 147.02 / DEVELOPERS_FEATURE_ARTBOARD_W,
            topRatio: 142.97 / DEVELOPERS_FEATURE_ARTBOARD_H,
            widthRatio: 489.6 / DEVELOPERS_FEATURE_ARTBOARD_W,
            paddingRatio: 12.189 / 489.6,
        },
        tertiary: {
            leftRatio: 104 / DEVELOPERS_FEATURE_ARTBOARD_W,
            topRatio: 255.3 / DEVELOPERS_FEATURE_ARTBOARD_H,
            widthRatio: 576 / DEVELOPERS_FEATURE_ARTBOARD_W,
            paddingRatio: 14.34 / 576,
        },
    },
    layouts: {
        sales: {
            leftRatio: 166 / DEVELOPERS_FEATURE_ARTBOARD_W,
            topRatio: 47 / DEVELOPERS_FEATURE_ARTBOARD_H,
            widthRatio: 451 / DEVELOPERS_FEATURE_ARTBOARD_W,
            heightRatio: 421 / DEVELOPERS_FEATURE_ARTBOARD_H,
        },
        financePrimary: {
            leftRatio: 58 / DEVELOPERS_FEATURE_ARTBOARD_W,
            topRatio: 57.232666015625 / DEVELOPERS_FEATURE_ARTBOARD_H,
            widthRatio: 438.91969853480623 / DEVELOPERS_FEATURE_ARTBOARD_W,
            heightRatio: 454.1642508064756 / DEVELOPERS_FEATURE_ARTBOARD_H,
        },
        financeSecondary: {
            leftRatio: 384.5712890625 / DEVELOPERS_FEATURE_ARTBOARD_W,
            topRatio: 126.406005859375 / DEVELOPERS_FEATURE_ARTBOARD_H,
            widthRatio: 374.3246246450417 / DEVELOPERS_FEATURE_ARTBOARD_W,
            heightRatio: 261.244055884159 / DEVELOPERS_FEATURE_ARTBOARD_H,
        },
        feature3d: {
            leftRatio: 59 / DEVELOPERS_FEATURE_ARTBOARD_W,
            topRatio: 18 / DEVELOPERS_FEATURE_ARTBOARD_H,
            widthRatio: 665 / DEVELOPERS_FEATURE_ARTBOARD_W,
            heightRatio: 635 / DEVELOPERS_FEATURE_ARTBOARD_H,
        },
        dataPrimary: {
            leftRatio: 267.64453125 / DEVELOPERS_FEATURE_ARTBOARD_W,
            topRatio: 39 / DEVELOPERS_FEATURE_ARTBOARD_H,
            widthRatio: 247.69155883789062 / DEVELOPERS_FEATURE_ARTBOARD_W,
            heightRatio: 436.4661865234375 / DEVELOPERS_FEATURE_ARTBOARD_H,
        },
        dataSecondary: {
            leftRatio: 91 / DEVELOPERS_FEATURE_ARTBOARD_W,
            topRatio: 85.1552734375 / DEVELOPERS_FEATURE_ARTBOARD_H,
            widthRatio: 256.96533203125 / DEVELOPERS_FEATURE_ARTBOARD_W,
            heightRatio: 363.0753479003906 / DEVELOPERS_FEATURE_ARTBOARD_H,
        },
        dataTertiary: {
            leftRatio: (91 + 367.336181640625) / DEVELOPERS_FEATURE_ARTBOARD_W,
            topRatio: 85.1552734375 / DEVELOPERS_FEATURE_ARTBOARD_H,
            widthRatio: 233.66392517089844 / DEVELOPERS_FEATURE_ARTBOARD_W,
            heightRatio: 363.2201843261719 / DEVELOPERS_FEATURE_ARTBOARD_H,
        },
        constructionUi: {
            leftRatio: 62 / DEVELOPERS_FEATURE_ARTBOARD_W,
            topRatio: 128.1689453125 / DEVELOPERS_FEATURE_ARTBOARD_H,
            widthRatio: 541.8919067382812 / DEVELOPERS_FEATURE_ARTBOARD_W,
            heightRatio: 277.1090087890625 / DEVELOPERS_FEATURE_ARTBOARD_H,
        },
        constructionPerson: {
            leftRatio: 298.5478515625 / DEVELOPERS_FEATURE_ARTBOARD_W,
            topRatio: 0,
            widthRatio: 565.452392578125 / DEVELOPERS_FEATURE_ARTBOARD_W,
            heightRatio: 565.452392578125 / DEVELOPERS_FEATURE_ARTBOARD_H,
        },
    },
    crops: {
        crm: {heightRatio: 1.2577, leftRatio: -0.0311, topRatio: -0.0937, widthRatio: 1.0794},
        sales: {heightRatio: 1.1023, leftRatio: -0.0443, topRatio: -0.0405, widthRatio: 1.0931},
        financeSecondary: {heightRatio: 1, leftRatio: -0.0179, topRatio: 0, widthRatio: 1.0179},
        feature3d: {heightRatio: 2.328, leftRatio: -0.9549, topRatio: -0.7728, widthRatio: 3.5569},
        dataPrimary: {heightRatio: 1.0372, leftRatio: -0.0437, topRatio: -0.022, widthRatio: 1.1092},
        dataSecondary: {heightRatio: 1.0475, leftRatio: -0.0448, topRatio: -0.0176, widthRatio: 1.0846},
        dataTertiary: {heightRatio: 1.0557, leftRatio: -0.0446, topRatio: -0.0191, widthRatio: 1.0718},
        constructionUi: {heightRatio: 1.1691, leftRatio: -0.0256, topRatio: -0.0846, widthRatio: 1.0261},
    },
} as const;

export const FIGMA_DEVELOPERS_ARCH = {
    cardAspect: 512 / 795,
    circleGraphicWidthRatio: 430 / 512,
    arrowGraphicWidthRatio: 448 / 512,
    arrowBottomRatio: 16 / 795,
} as const;

/** Hero demo clip frame 368:5037 — export at 4× for retina downscale (Figma embed is 735px wide). */
export const FIGMA_DEVELOPERS_DEMO = {
    clipWidth: 1279.05078125,
    clipHeight: 826.7938232421875,
    exportScale: 4,
    imageWidth: 5117,
    imageHeight: 3308,
} as const;

export const FIGMA_DEVELOPERS_CATALOG = {
    frameWidth: 1729,
    frameHeight: 1025,
    bg1WidthRatio: 2214 / 1729,
    bg2WidthRatio: 2079 / 1729,
    /** Section min-height at 70% of original Figma frame ratio */
    minHeightRatio: (1025 / 1729) * 0.7,
} as const;

export type DevelopersStackKey = keyof typeof FIGMA_DEVELOPERS_FEATURE_CARD.stacks;
export type DevelopersFeatureCropKey = keyof typeof FIGMA_DEVELOPERS_FEATURE_CARD.crops;
export type DevelopersFeatureLayoutKey = keyof typeof FIGMA_DEVELOPERS_FEATURE_CARD.layouts;

type FigmaLayoutRect = {
    leftRatio: number;
    topRatio: number;
    widthRatio: number;
    heightRatio: number;
};

export function developersFeatureLayoutStyle(layoutKey: DevelopersFeatureLayoutKey) {
    const layout = FIGMA_DEVELOPERS_FEATURE_CARD.layouts[layoutKey];
    return developersLayoutRectStyle(layout);
}

function developersLayoutRectStyle({leftRatio, topRatio, widthRatio, heightRatio}: FigmaLayoutRect) {
    return {
        left: `${leftRatio * 100}%`,
        top: `${topRatio * 100}%`,
        width: `${widthRatio * 100}%`,
        height: `${heightRatio * 100}%`,
    };
}

export function developersStackCardStyle(stackKey: DevelopersStackKey) {
    const stack = FIGMA_DEVELOPERS_FEATURE_CARD.stacks[stackKey];
    return {
        left: `${stack.leftRatio * 100}%`,
        top: `${stack.topRatio * 100}%`,
        width: `${stack.widthRatio * 100}%`,
        padding: `${stack.paddingRatio * 100}%`,
    };
}

export const FIGMA_FOOTER_SECTION = {
    canvasWidth: 1728,
    canvasHeight: 971,
    contentWidth: 1646,
    contentPadX: 41,
    headlineGap: 44,
    leftColWidth: 854,
    formColWidth: 532,
    linkColGap: 156,
    linkItemGap: 12,
    formFieldGap: 40,
    formIntroGap: 32,
    headlineAspect: 1625.24 / 230.881,
    titleFontCqwCap: (32 / 1646) * 100,
    linkFontCqwCap: (24 / 1646) * 100,
    contactFontCqwCap: (24 / 1646) * 100,
    introFontCqwCap: (24 / 1646) * 100,
    fieldFontCqwCap: (20 / 1646) * 100,
    sendFontCqwCap: (24 / 1646) * 100,
    linkColGapCqwCap: (156 / 1646) * 100,
    headlineGapCqwCap: (44 / 1646) * 100,
    formFieldGapCqwCap: (40 / 1646) * 100,
    formIntroGapCqwCap: (32 / 1646) * 100,
    sectionPadCqwCap: (53 / 1646) * 100,
} as const;
