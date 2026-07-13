import {
    FEATURED_ACTIVE_SCALE,
    FEATURED_FOCUS_ANGLE,
    FEATURED_ORBIT_RADIUS,
    FEATURED_ORBIT_SHIFT_X,
    FEATURED_STAGE_HEIGHT,
    FEATURED_TILE_SIZE,
    FEATURED_TITLE_GAP_BELOW,
    FEATURED_ZOOM_ACTIVE_SCALE,
    FEATURED_ZOOM_SCALE,
    lerp,
} from "@propertyManagementModule/clients/client/public/home/sections/featuredRouletteConfig.ts";
import {FIGMA_CANVAS_WIDTH} from "@propertyManagementModule/clients/client/public/shared/figmaRouteMap.ts";

export type FocusTitleAnchor = {
    left: number;
    top: number;
};

/** Focus slot position on ring: rotate(angle) translateY(-radius) in orbit local space. */
function computeFocusRingOffset(radius: number, angleDeg: number) {
    const angleRad = (angleDeg * Math.PI) / 180;
    return {
        x: radius * Math.sin(angleRad),
        y: -radius * Math.cos(angleRad),
    };
}

/**
 * Property title anchor in Figma canvas px (inside the 1728×1117 stage).
 * Mirrors orbit wrapper shift/scale and hero tile footprint at the focus slot.
 */
export function computeFocusTitleAnchor(zoom: number, layoutScale = 1): FocusTitleAnchor {
    const centerX = FIGMA_CANVAS_WIDTH / 2;
    const centerY = FEATURED_STAGE_HEIGHT / 2;

    const orbitZoomScale = lerp(1, FEATURED_ZOOM_SCALE, zoom);
    const orbitShiftX = lerp(0, FEATURED_ORBIT_SHIFT_X, zoom);
    const heroScale = lerp(FEATURED_ACTIVE_SCALE, FEATURED_ZOOM_ACTIVE_SCALE, zoom);

    const ringRadius = FEATURED_ORBIT_RADIUS * layoutScale;
    const focusOffset = computeFocusRingOffset(ringRadius, FEATURED_FOCUS_ANGLE);

    const focusX = centerX + focusOffset.x * orbitZoomScale + orbitShiftX;
    const focusY = centerY + focusOffset.y * orbitZoomScale;

    const heroRadius = ((FEATURED_TILE_SIZE * layoutScale) / 2) * heroScale * orbitZoomScale;
    const zoomGapBoost = lerp(0, 16, zoom);

    return {
        left: focusX,
        top: focusY + heroRadius + FEATURED_TITLE_GAP_BELOW + zoomGapBoost,
    };
}
