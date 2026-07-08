import type {ReactNode} from "react";
import {cn} from "@coreModule/components/lib/utils.ts";
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
};

/** Header row for text-first entity cards: optional icon tile, title, badges, inline action menu. */
export function EntityTextCardHeader({
    iconTile,
    title,
    subtitle,
    badges,
    titleExtra,
    actionMenu,
    hideActions = false,
    className,
}: EntityTextCardHeaderProps) {
    return (
        <div className={cn("flex items-start gap-2 p-2 pb-1", className)}>
            {iconTile != null && <div className="shrink-0">{iconTile}</div>}
            <div className="flex flex-1 min-w-0 flex-col gap-1">
                <div className="flex min-w-0 items-start justify-between gap-2">
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <div className="flex min-w-0 items-center gap-1">
                            <div className="min-w-0 truncate font-semibold">{title}</div>
                            {titleExtra}
                        </div>
                        {subtitle != null && subtitle !== "" && (
                            <div className="truncate text-xs text-muted-foreground">{subtitle}</div>
                        )}
                    </div>
                    {!hideActions && actionMenu != null && (
                        <EntityCardActionMenu variant="inline">{actionMenu}</EntityCardActionMenu>
                    )}
                </div>
                {badges != null && (
                    <div className="flex flex-wrap items-center gap-1.5">{badges}</div>
                )}
            </div>
        </div>
    );
}
