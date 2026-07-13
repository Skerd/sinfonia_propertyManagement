/** Visual stage height in Figma px (node 71:1839). */
export const FEATURED_STAGE_HEIGHT = 1117;

export const FEATURED_INTRO_RATIO = 0.1;
export const FEATURED_SLIDE_COUNT = 8;
export const FEATURED_RUNWAY_VIEWPORTS = 8;

export const FEATURED_ORBIT_RADIUS = 420;
export const FEATURED_TILE_SIZE = 148;
export const FEATURED_TILE_SIZE_MIN = 72;

/** Focus slot at 9 o'clock (left edge) — items scroll vertically there when zoomed. */
export const FEATURED_FOCUS_ANGLE = 270;

/** Intro: full ring centered. Carousel: orbit shifts right + scales up to crop the left arc. */
export const FEATURED_ZOOM_SCALE = 2.35;
export const FEATURED_ORBIT_SHIFT_X = 780;
export const FEATURED_ZOOM_RAMP = 0.12;

/** Center copy fully hidden at/before this zoomBlend. */
export const FEATURED_COPY_HIDE_ZOOM = 0.08;

/** Property titles hidden below this zoomBlend (after center copy is gone). */
export const FEATURED_TITLE_REVEAL_ZOOM = 0.12;

/** Gap between focus tile bottom and property title (Figma px). */
export const FEATURED_TITLE_GAP_BELOW = 56;

/** Active tile scale when fully zoomed (hero size on focus track). */
export const FEATURED_ZOOM_ACTIVE_SCALE = 2.2;

/** Uniform scale for every non-focused tile when zoomed. */
export const FEATURED_ZOOM_REST_SCALE = 0.72;
export const FEATURED_ZOOM_REST_OPACITY = 0.42;

export const FEATURED_CENTER_COPY = {
    width: 333,
    fontSize: 20,
    lineHeight: 1,
} as const;

export const FEATURED_CENTER_TEXT =
    "Explore our collection of premium properties — apartments, villas and commercial spaces in the best locations.";

export const FEATURED_TITLE_OFFSET_Y = 32;

export const FEATURED_SPRING = {
    stiffness: 80,
    damping: 22,
    mass: 0.5,
} as const;

export const FEATURED_SPRING_REDUCED = {
    stiffness: 1000,
    damping: 100,
} as const;

export const FEATURED_ACTIVE_SCALE = 1.15;
export const FEATURED_REST_SCALE = 0.85;
export const FEATURED_REST_OPACITY = 0.35;
export const FEATURED_ACTIVE_OPACITY = 1;

export const FEATURED_RUNWAY_EXTRA_FIGMA = FEATURED_RUNWAY_VIEWPORTS * 1400;
export const FEATURED_SECTION_HEIGHT = FEATURED_STAGE_HEIGHT + FEATURED_RUNWAY_EXTRA_FIGMA;

export function smootherstep(t: number) {
    const x = Math.min(1, Math.max(0, t));
    return x * x * x * (x * (x * 6 - 15) + 10);
}

export function lerp(a: number, b: number, t: number) {
    return a + (b - a) * t;
}

/** Shortest distance between two angles on a circle (degrees). */
export function angularDistance(a: number, b: number) {
    const delta = Math.abs(((a - b) % 360) + 360) % 360;
    return delta > 180 ? 360 - delta : delta;
}
