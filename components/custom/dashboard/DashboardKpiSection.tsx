import {Children, useId, type ReactNode} from "react";
import {cn} from "@coreModule/components/lib/utils.ts";
import {DASHBOARD_SECTION} from "@coreModule/components/entityPage/list/entityCard.constants.ts";

type DashboardKpiSectionProps = {
    title: string;
    description?: string;
    children: ReactNode;
    className?: string;
};

/**
 * Each group is its own panel, and neighbouring panels alternate gray and plain so the eye can tell where one group
 * ends and the next begins. The alternation counts `section` siblings only (`nth-of-type`), so a tab's intro, its chart
 * rows or a group left out for lack of data never put two panels of the same shade next to each other.
 *
 * The tiles invert with the panel: white tiles on a gray panel, gray tiles on a plain one. Two neighbouring groups then
 * differ in both layers, not just in a background a few percent apart. `--panel` and `--tile` carry the pair so the
 * two-column checkerboard in {@link DashboardSectionGrid} flips both at once. `--gray` is the theme's muted surface
 * pulled 6% toward the text colour: clearly darker than `--muted` on white, a step above it on the dark page.
 *
 * The panel is a size container: {@link DashboardKpiGrid} picks its columns from the panel's width, not the window's.
 */
const PANEL = cn(
    "@container rounded-md p-(--density-pad) ring-1 ring-foreground/15 bg-(--panel)",
    "[--gray:color-mix(in_oklab,var(--color-muted),var(--color-foreground)_6%)]",
    "[--panel:transparent] [--tile:var(--gray)]",
    "[&:nth-of-type(odd)]:[--panel:var(--gray)] [&:nth-of-type(odd)]:[--tile:var(--color-card)]",
);

/** One titled group of an overview tab: title and description on one line, then the group's tiles or body. */
export function DashboardKpiSection({
    title,
    description,
    children,
    className,
}: DashboardKpiSectionProps) {
    const titleId = useId();
    return (
        <section aria-labelledby={titleId} className={cn(DASHBOARD_SECTION, PANEL, className)}>
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <h2 id={titleId} className="text-sm font-semibold leading-tight">{title}</h2>
                {description ? (
                    <p className="text-xs leading-tight text-muted-foreground">{description}</p>
                ) : null}
            </div>
            {children}
        </section>
    );
}

/**
 * Two groups per row once the tab is wide enough (measured on the tab, so an open sidebar counts). A group left alone on
 * the last row takes the whole row. With two columns the shading becomes a checkerboard (1 and 4 gray, 2 and 3 plain),
 * otherwise the left column would be all gray and the right all plain.
 *
 * `p-px` is the ring's room. Each panel's `ring-1` is drawn outside its border box, and the first row sits flush with
 * the tab's `overflow: auto` scrollport, which clips that ink. One pixel of inset keeps the top and side edges whole.
 */
const SECTION_GRID = cn(
    "grid gap-3 p-px @4xl/sections:grid-cols-2 @4xl/sections:[&>*:last-child:nth-child(odd)]:col-span-2",
    "@4xl/sections:[&>section:nth-of-type(4n+3)]:[--panel:transparent] @4xl/sections:[&>section:nth-of-type(4n+3)]:[--tile:var(--gray)]",
    "@4xl/sections:[&>section:nth-of-type(4n)]:[--panel:var(--gray)] @4xl/sections:[&>section:nth-of-type(4n)]:[--tile:var(--color-card)]",
);

export function DashboardSectionGrid({children}: {children: ReactNode}) {
    return (
        <div className="@container/sections">
            <div className={SECTION_GRID}>{children}</div>
        </div>
    );
}

/*
 * Tile widths per column count. Each step switches on at the panel width where a tile still gets about 10rem, enough for
 * a full money amount on one line: 3 per row from 30rem, 4 from 42rem, 5 from 52rem.
 */
const HALF = "*:basis-[calc((100%_-_var(--density-gap-sm))/2)]";
const THIRD = "@[30rem]:*:basis-[calc((100%_-_2*var(--density-gap-sm))/3)]";
const QUARTER = "@[42rem]:*:basis-[calc((100%_-_3*var(--density-gap-sm))/4)]";
const FIFTH = "@[52rem]:*:basis-[calc((100%_-_4*var(--density-gap-sm))/5)]";

/**
 * All tiles on one row when they fit, else balanced rows: four go 2 × 2 (never 3 + 1), five go 3 + 2 (never 4 + 1).
 * Groups side by side then usually end up with the same number of rows, so neither has a gap under its tiles.
 */
function tileBasis(count: number): string {
    if (count <= 1) return "*:basis-full";
    if (count === 2) return HALF;
    if (count === 3) return cn(HALF, THIRD);
    if (count === 4) return cn(HALF, QUARTER);
    if (count === 5) return cn(HALF, THIRD, FIFTH);
    return cn(HALF, THIRD, QUARTER);
}

/**
 * The tiles of one group. Every row is full: tiles grow into a short last row instead of leaving a hole beside it.
 * The grid also grows into the panel's height, so when the group beside it is taller the tiles stretch rather than
 * leaving an empty band under them.
 */
export function DashboardKpiGrid({children}: {children: ReactNode}) {
    return (
        <div className={cn("flex flex-1 flex-wrap gap-(--density-gap-sm) *:grow *:bg-(--tile)", tileBasis(Children.toArray(children).length))}>
            {children}
        </div>
    );
}
