import type {ReactNode} from "react";
import {
    CardAction,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@coreModule/components/ui/card.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import HiddenElement from "@coreModule/components/custom/hiddenElement.tsx";
import {EntityCardActionMenu} from "./EntityCardActionMenu.tsx";

type EntityTextCardHeaderProps = {
    /** Left tile: avatar, MdiIcon box, or Tabler icon wrapper. */
    iconTile?: ReactNode;
    title: ReactNode;
    subtitle?: ReactNode;
    badges?: ReactNode;
    titleExtra?: ReactNode;
    actionMenu?: ReactNode;
    hideActions?: boolean;
    className?: string;
    /** When false, title is masked with HiddenElement (city-style field permission). */
    showTitle?: boolean;
    /** When false, subtitle is masked with HiddenElement. */
    showSubtitle?: boolean;
    /** When false, badges are masked with HiddenElement. */
    showBadges?: boolean;
};

/**
 * Header row for text-first entity cards: optional icon tile, title, badges,
 * inline action menu.
 *
 * Built on the Card header slots so spacing, the action column and the
 * title/description type scale come from the primitive. That is what keeps
 * ~119 entity cards consistent without each one restating its own layout.
 */
export function EntityTextCardHeader({
    iconTile,
    title,
    subtitle,
    badges,
    titleExtra,
    actionMenu,
    hideActions = false,
    className,
    showTitle = true,
    showSubtitle = true,
    showBadges = true,
}: EntityTextCardHeaderProps) {
    const hasSubtitle = subtitle != null && subtitle !== "";
    const hasBadges = badges != null;
    const showActions = !hideActions && actionMenu != null;

    return (
        <CardHeader className={cn("gap-1.5 px-2 pt-2 pb-1", className)}>
            <div className="flex min-w-0 items-center gap-2">
                {iconTile != null && <div className="shrink-0 self-center">{iconTile}</div>}
                <div className="flex min-w-0 flex-1 flex-col justify-center gap-0.5">
                    <div className="flex min-w-0 items-center gap-1">
                        <CardTitle className="min-w-0 truncate text-sm leading-none font-semibold">
                            <HiddenElement randomLength={10}>
                                {showTitle ? title : null}
                            </HiddenElement>
                        </CardTitle>
                        {titleExtra}
                    </div>
                    {(hasSubtitle || !showSubtitle) && (
                        <CardDescription className="truncate text-xs leading-none">
                            <HiddenElement randomLength={8}>
                                {showSubtitle && hasSubtitle ? subtitle : null}
                            </HiddenElement>
                        </CardDescription>
                    )}
                </div>
            </div>
            {showActions && (
                <CardAction className="-mr-1">
                    <EntityCardActionMenu variant="inline">{actionMenu}</EntityCardActionMenu>
                </CardAction>
            )}
            {(hasBadges || !showBadges) && (
                <div className="col-start-1 flex flex-wrap items-center gap-1.5">
                    <HiddenElement randomLength={6}>
                        {showBadges && hasBadges ? badges : null}
                    </HiddenElement>
                </div>
            )}
        </CardHeader>
    );
}
