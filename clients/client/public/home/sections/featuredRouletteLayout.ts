import {FEATURED_STAGE_HEIGHT} from "@propertyManagementModule/clients/client/public/home/sections/featuredRouletteConfig.ts";
import {FIGMA_CANVAS_WIDTH} from "@propertyManagementModule/clients/client/public/shared/figmaRouteMap.ts";

export {computeFocusTitleAnchor} from "@propertyManagementModule/clients/client/public/home/sections/featuredRouletteTitleLayout.ts";

export const FIGMA_STAGE_CANVAS = {
    width: FIGMA_CANVAS_WIDTH,
    height: FEATURED_STAGE_HEIGHT,
} as const;

/** Progress dots inset from stage canvas edges (Figma px as canvas ratios). */
export const FIGMA_ROULETTE_DOTS = {
    insetXRatio: 48 / FIGMA_STAGE_CANVAS.width,
    insetYRatio: 48 / FIGMA_STAGE_CANVAS.height,
    sizeRatio: 45 / FIGMA_STAGE_CANVAS.width,
    dotRadiusRatio: 16 / 45,
    dotSizeRatio: 6 / 45,
} as const;

export function computeStageScaledCanvasDimensions(layoutScale: number) {
    return {
        width: FIGMA_STAGE_CANVAS.width * layoutScale,
        height: FIGMA_STAGE_CANVAS.height * layoutScale,
    };
}

export function computeStageCanvasInnerStyle(layoutScale: number) {
    return {
        width: FIGMA_STAGE_CANVAS.width,
        height: FIGMA_STAGE_CANVAS.height,
        transform: `scale(${layoutScale})`,
        transformOrigin: "top left" as const,
    };
}

export function computeRouletteDotsChromeStyle() {
    const {insetXRatio, insetYRatio, sizeRatio} = FIGMA_ROULETTE_DOTS;
    return {
        right: `${insetXRatio * 100}%`,
        bottom: `${insetYRatio * 100}%`,
        width: `${sizeRatio * 100}%`,
        aspectRatio: "1 / 1",
    };
}

export function computeRouletteDotPosition(index: number, total: number) {
    const angle = (index / total) * Math.PI * 2 - Math.PI / 2;
    const {dotRadiusRatio, dotSizeRatio} = FIGMA_ROULETTE_DOTS;
    const dotRadius = dotRadiusRatio;
    const center = 0.5;
    const x = Math.cos(angle) * dotRadius + center;
    const y = Math.sin(angle) * dotRadius + center;
    // Dot % values are relative to the chrome container (45×45), not the canvas — never use sizeRatio here.
    const dotSizePercent = dotSizeRatio * 100;
    const dotOffsetPercent = dotSizeRatio * 50;
    return {
        left: `${x * 100}%`,
        top: `${y * 100}%`,
        width: `${dotSizePercent}%`,
        aspectRatio: "1 / 1",
        marginLeft: `${-dotOffsetPercent}%`,
        marginTop: `${-dotOffsetPercent}%`,
    };
}
