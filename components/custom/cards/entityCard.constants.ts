/** Shared layout tokens for property management entity cards and list grids. */

/**
 * Elevation comes from Card's own `ring-1 ring-foreground/10`, which is
 * token-driven and therefore correct in both themes. The previous `shadow-md`
 * was a fixed black shadow that all but disappeared on a dark surface.
 */
export const CARD_SHELL_CLASS =
    "group h-fit gap-0 p-0 transition-[box-shadow,--tw-ring-color] duration-200";

export const CARD_SHELL_CLICKABLE_CLASS =
    `${CARD_SHELL_CLASS} hover:cursor-pointer hover:shadow-md hover:ring-primary/40`;

export const CARD_BODY_CLASS = "w-full p-2 flex flex-col gap-1";

export const CARD_INFO_ROWS_CLASS = "flex flex-wrap gap-x-2 gap-y-1";

export const MEDIA_HEADER_MIN_HEIGHT = "min-h-[200px]";

/**
 * Corner rounding is intentionally absent: Card clips its children with
 * `overflow-hidden rounded-xl`. A previous `rounded-te-2xl` here emitted no CSS
 * at all, so the media was already relying on the Card to clip it.
 */
export const MEDIA_CAROUSEL_CLASS =
    "w-full overflow-hidden min-h-[200px]";

/** Hierarchy entity lists (projects, edifices, floors, units) — CSS grid fallback. */
export const GRID_HIERARCHY =
    "grid grid-cols-1 gap-2 md:grid-cols-2 md:gap-4 lg:grid-cols-3 xl:grid-cols-5";

/**
 * Pinterest masonry column counts for hierarchy lists.
 * Keys are max-width breakpoints (react-masonry-css); mirrors GRID_HIERARCHY density.
 */
export const MASONRY_HIERARCHY_BREAKPOINTS: {
    default: number;
    [key: number]: number;
} = {
    default: 4,
    1280: 3,
    1024: 2,
    768: 1,
};

/** CRM / workflow entity lists. */
export const GRID_TRANSACTIONAL =
    "grid grid-cols-1 gap-2 lg:gap-4 md:grid-cols-2 md:gap-4 lg:grid-cols-3 pe-1";

/** Wider transactional grids (leads, snags, etc.). */
export const GRID_TRANSACTIONAL_WIDE =
    "grid grid-cols-1 gap-2 md:grid-cols-2 md:gap-4 lg:grid-cols-3 xl:grid-cols-4";

export const DASHBOARD_SELECTABLE_RING =
    "ring-2 ring-primary shadow-lg shadow-primary/20 hover:ring-primary";

/** Semantic status badge tokens (maps to --status-* CSS variables). */
export const STATUS_BADGE_SUCCESS =
    "border-status-sold/30 bg-status-sold/10 text-status-sold";
export const STATUS_BADGE_WARNING =
    "border-status-reserved/30 bg-status-reserved/10 text-status-reserved";
export const STATUS_BADGE_DANGER =
    "border-status-blocked/30 bg-status-blocked/10 text-status-blocked";
export const STATUS_BADGE_INFO =
    "border-status-available/30 bg-status-available/10 text-status-available";
export const STATUS_BADGE_NEUTRAL =
    "border-border bg-muted/50 text-muted-foreground";
