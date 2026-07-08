import type {ReactNode} from "react";
import TooltipDisplayer from "@coreModule/components/custom/tooltipDisplayer.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import {MEDIA_CAROUSEL_CLASS} from "./entityCard.constants.ts";
import {EntityCardActionMenu} from "./EntityCardActionMenu.tsx";

type EntityMediaHeaderProps = {
    carouselKey: string;
    showMedia: boolean;
    gallery: ReactNode;
    title?: string | null;
    subtitle?: string | null;
    showTitle?: boolean;
    showSubtitle?: boolean;
    actionMenu?: ReactNode;
    hideActions?: boolean;
    /** Optional badge overlay (e.g. unit status on image). */
    titleExtra?: ReactNode;
};

export function EntityMediaHeader({
    carouselKey,
    showMedia,
    gallery,
    title,
    subtitle,
    showTitle = true,
    showSubtitle = true,
    actionMenu,
    hideActions = false,
    titleExtra,
}: EntityMediaHeaderProps) {
    return (
        <div className="relative dark:bg-card">
            {showMedia && (
                <div className={cn(MEDIA_CAROUSEL_CLASS)} key={carouselKey}>
                    {gallery}
                </div>
            )}

            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent px-3 pt-10 pb-2.5 z-10">
                <div className="flex items-end gap-2">
                    {showTitle && title != null && title !== "" && (
                        <TooltipDisplayer tooltip={title} show>
                            <p className="font-bold text-white text-base leading-tight line-clamp-1 flex-1 min-w-0">
                                {title}
                            </p>
                        </TooltipDisplayer>
                    )}
                    {titleExtra}
                </div>
                {showSubtitle && subtitle != null && subtitle !== "" && (
                    <p className="text-white/70 text-xs leading-tight line-clamp-1 mt-0.5">
                        {subtitle}
                    </p>
                )}
            </div>

            {!hideActions && actionMenu != null && (
                <EntityCardActionMenu>{actionMenu}</EntityCardActionMenu>
            )}
        </div>
    );
}
