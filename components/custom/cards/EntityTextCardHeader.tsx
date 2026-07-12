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
        <div className={cn("flex flex-col gap-1.5 p-2 pb-1", className)}>
            <div className="flex min-w-0 items-center gap-2">
                {iconTile != null && <div className="shrink-0 self-center">{iconTile}</div>}
                <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
                    <div className="flex min-w-0 flex-1 flex-col justify-center gap-0.5">
                        <div className="flex min-w-0 items-center gap-1">
                            <div className="min-w-0 truncate font-semibold leading-none">{title}</div>
                            {titleExtra}
                        </div>
                        {subtitle != null && subtitle !== "" && (
                            <div className="truncate text-xs leading-none text-muted-foreground">{subtitle}</div>
                        )}
                    </div>
                    {!hideActions && actionMenu != null && (
                        <EntityCardActionMenu variant="inline">{actionMenu}</EntityCardActionMenu>
                    )}
                </div>
            </div>
            {badges != null && (
                <div className="flex flex-wrap items-center gap-1.5">{badges}</div>
            )}
        </div>
    );
}
