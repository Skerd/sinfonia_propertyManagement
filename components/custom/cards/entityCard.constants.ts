/** Shared layout tokens for property management entity cards and list grids. */

export const CARD_SHELL_CLASS =
    "group p-0 gap-0 h-fit shadow-md transition-all duration-300 hover:shadow-lg";

export const CARD_SHELL_CLICKABLE_CLASS = `${CARD_SHELL_CLASS} hover:cursor-pointer`;

export const CARD_BODY_CLASS = "w-full p-2 flex flex-col gap-1";

export const CARD_INFO_ROWS_CLASS = "flex flex-wrap gap-x-2 gap-y-1";

export const MEDIA_HEADER_MIN_HEIGHT = "min-h-[200px]";

export const MEDIA_CAROUSEL_CLASS =
    "w-full rounded-te-2xl rounded-b-none overflow-hidden min-h-[200px]";

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
    default: 5,
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
    "ring-2 ring-primary shadow-lg shadow-primary/20";

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
