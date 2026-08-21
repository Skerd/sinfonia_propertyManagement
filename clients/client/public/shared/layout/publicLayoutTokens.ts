/** Figma design canvas width — carousel stage cap only; card lists use panel grids. */
export const PUBLIC_FIGMA_MAX_WIDTH = 1728;

/** Panel CardAndTableView scroll root — min-w-0 overflow-x-hidden. */
export const PUBLIC_SECTION_BASE = "relative min-w-0 w-full overflow-x-clip";

/** Panel entity card cell wrapper (CardAndTableView) + min-w-0 for grid shrink. */
export const PUBLIC_GRID_CELL = "h-full min-h-0 min-w-0";

/** Panel projects/index.tsx cardViewClassName */
export const PUBLIC_GRID_PROJECTS =
    "grid grid-cols-1 gap-2 lg:gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 pe-1";

/** Figma Projects Gallery row 268:715 — 3 cols at xl, not panel admin density */
export const PUBLIC_GRID_PROJECTS_GALLERY =
    "grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8 xl:grid-cols-3 pe-1";

/** Project units catalog — denser than projects gallery so more apartments fit per row */
export const PUBLIC_GRID_UNITS =
    "grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 pe-1";

/** Panel sales/index.tsx cardViewClassName */
export const PUBLIC_GRID_SALES =
    "grid grid-cols-1 gap-2 lg:gap-4 md:grid-cols-2 lg:grid-cols-3 pe-1";

/** Panel inspections/index.tsx cardViewClassName */
export const PUBLIC_GRID_INSPECTIONS =
    "grid grid-cols-1 gap-2 lg:gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 pe-1 mt-0.5";

/** Developers Core Platform Features — Figma 388:1265 two-up row */
export const PUBLIC_GRID_DEVELOPERS_FEATURES =
    "grid w-full min-w-0 grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-10 pe-1";

/** About founders — Figma 368:4999 equal two-up row (not panel 5-col density) */
export const PUBLIC_GRID_ABOUT_FOUNDERS =
    "grid w-full min-w-0 grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-10 pe-1";

/** Panel overview/overview/index.tsx KPI row */
export const PUBLIC_GRID_KPI = "grid gap-2 sm:grid-cols-2 lg:grid-cols-4";

/** Numbered-step row — 4 Figma cards at xl (1643px content width) */
export const PUBLIC_GRID_NUMBERED_STEPS =
    "grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-4";

/** Panel sales/createSaleChoice.tsx two-column layout */
export const PUBLIC_GRID_TWO_COL = "grid grid-cols-1 md:grid-cols-2 gap-6 max-w-full";

/** Footer link columns — panel-style progressive grid (overview KPI pattern) */
export const PUBLIC_GRID_FOOTER_LINKS =
    "grid min-w-0 grid-cols-1 gap-y-4 lg:grid-cols-3 lg:gap-8";

/** Footer main row — proportional Figma split without fixed px widths */
export const PUBLIC_GRID_FOOTER_MAIN =
    "grid min-w-0 w-full grid-cols-1 gap-10 lg:grid-cols-[minmax(0,854fr)_minmax(0,532fr)] lg:items-stretch";

/** @deprecated Use PUBLIC_GRID_PROJECTS */
export const PUBLIC_CARD_GRID = PUBLIC_GRID_PROJECTS;

/** @deprecated Use PUBLIC_GRID_SALES */
export const PUBLIC_CARD_GRID_3 = PUBLIC_GRID_SALES;

/** Page chrome matching home FigmaMenu (`35:139`) — full-bleed, 45px top on lg. */
export const PUBLIC_PAGE_HEADER =
    "w-full min-w-0 px-4 sm:px-6 lg:px-[52px] pt-8 sm:pt-10 lg:pt-[45px]";

/** Centered content column for section padding (existing marketing sections). */
export const PUBLIC_CONTENT_FRAME =
    "mx-auto w-full min-w-0 max-w-[1728px] px-4 sm:px-6 lg:px-[52px]";

/** @deprecated Use PUBLIC_CONTENT_FRAME */
export const PUBLIC_CONTAINER = PUBLIC_CONTENT_FRAME;

/** Vertical rhythm between marketing blocks — keep modest; headers are flush. */
export const PUBLIC_SECTION = "w-full py-12 md:py-12 lg:py-16";

export const PUBLIC_SECTION_FLUSH = "w-full py-0";

export const PUBLIC_TITLE =
    "cursor-default font-aeonik-medium text-pronix-ink not-italic leading-[1.2] text-3xl sm:text-4xl md:text-5xl lg:text-[56px]";

export const PUBLIC_TITLE_FIGMA =
    "cursor-default font-aeonik-medium text-pronix-ink not-italic leading-[1.2] text-3xl sm:text-4xl md:text-5xl lg:text-[56px]";

export const PUBLIC_SUBTITLE =
    "cursor-default font-aeonik-light text-pronix-ink not-italic leading-[1.4] text-lg sm:text-xl md:text-2xl lg:text-[24px]";

export const PUBLIC_BODY =
    "cursor-default font-aeonik-light text-pronix-ink-muted not-italic leading-normal text-base md:text-lg lg:text-[20px]";

/** Section / panel headings (Figma 32px at md). */
export const PUBLIC_HEADING =
    "cursor-default font-aeonik-medium text-pronix-ink not-italic leading-[1.2] text-2xl md:text-[32px]";

/** Compact type scale matching open-project floor list (`font-aeonik-light text-sm`). */
export const PUBLIC_TITLE_COMPACT =
    "cursor-default font-aeonik-medium text-pronix-ink not-italic leading-[1.2] text-xl md:text-2xl";

export const PUBLIC_SUBTITLE_COMPACT =
    "cursor-default font-aeonik-light text-pronix-ink not-italic leading-[1.3] text-sm";

export const PUBLIC_BODY_COMPACT =
    "cursor-default font-aeonik-light text-pronix-ink-muted not-italic leading-snug text-sm";

export const PUBLIC_HEADING_COMPACT =
    "cursor-default font-aeonik-medium text-pronix-ink not-italic leading-[1.2] text-base";

/** Projects Gallery page title (Figma 268:238 — ~120px at 1728 canvas). */
export const PUBLIC_GALLERY_PAGE_TITLE =
    "cursor-default font-aeonik-medium text-pronix-ink not-italic leading-[1.2] text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl";

/** Card titles inside grids (Figma 28px at lg). */
export const PUBLIC_CARD_TITLE =
    "cursor-default font-aeonik-medium text-pronix-ink not-italic leading-[1.2] text-xl md:text-2xl lg:text-[28px]";

/** @deprecated Carousel stage only — card lists use panel CSS grids */
export const PUBLIC_FIGMA_ROW = "flex flex-nowrap items-stretch";

/** Z-index for fixed AI chat FAB and panel (below menu 200). */
export const PUBLIC_LAYER_CHAT = 100;
