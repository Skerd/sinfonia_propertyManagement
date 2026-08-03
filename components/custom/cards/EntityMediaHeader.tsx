import type {ReactNode} from "react";
import TooltipDisplayer from "@coreModule/components/custom/tooltipDisplayer.tsx";
import HiddenElement from "@coreModule/components/custom/hiddenElement.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import {MEDIA_CAROUSEL_CLASS} from "./entityCard.constants.ts";
import {EntityCardActionMenu} from "./EntityCardActionMenu.tsx";

type EntityMediaHeaderProps = {
    carouselKey: string;
    showMedia: boolean;
    gallery: ReactNode;
    title?: string | null;
    subtitle?: string | null;
    /** When false, title is masked with HiddenElement (city-style field permission). */
    showTitle?: boolean;
    /** When false, subtitle is masked with HiddenElement. */
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
    const hasTitle = title != null && title !== "";
    const hasSubtitle = subtitle != null && subtitle !== "";

    return (
        <div className="relative dark:bg-card">
            {showMedia && (
                <div className={cn(MEDIA_CAROUSEL_CLASS)} key={carouselKey}>
                    {gallery}
                </div>
            )}

            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/30 to-transparent px-3 pt-6 pb-3 z-10">
                <div className="flex items-end gap-2">
                    <div className="flex-1 min-w-0">
                        <HiddenElement randomLength={10}>
                            {showTitle && hasTitle ? (
                                <TooltipDisplayer tooltip={title} show>
                                    <p className="font-bold text-white text-2xl leading-tight line-clamp-1">
                                        {title}
                                    </p>
                                </TooltipDisplayer>
                            ) : null}
                        </HiddenElement>
                    </div>
                    {titleExtra}
                </div>
                {(hasSubtitle || !showSubtitle) && (
                    <div className="mt-0.5">
                        <HiddenElement randomLength={8}>
                            {showSubtitle && hasSubtitle ? (
                                <p className="text-white/70 text-xs leading-tight line-clamp-1">
                                    {subtitle}
                                </p>
                            ) : null}
                        </HiddenElement>
                    </div>
                )}
            </div>

            {!hideActions && actionMenu != null && (
                <EntityCardActionMenu>{actionMenu}</EntityCardActionMenu>
            )}
        </div>
    );
}
