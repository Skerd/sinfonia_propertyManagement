import {compose} from "redux";
import {useCallback, useEffect, useMemo, useState} from "react";
import {useSearchParams} from "react-router-dom";
import withLanguage, {type WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {readQuickFiltersFromUrl} from "@coreModule/helpers/hooks/useListUrlState.ts";
import apiClient from "@coreModule/helpers/axiosClients/apiClient.ts";
import Loader from "@coreModule/components/custom/loader.tsx";
import SimpleError from "@coreModule/components/custom/errorViewWrapper.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import {Badge} from "@coreModule/components/ui/badge.tsx";
import {Card} from "@coreModule/components/ui/card.tsx";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@coreModule/components/ui/collapsible.tsx";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@coreModule/components/ui/tooltip.tsx";
import type {ConstructionUpdate} from "armonia/src/modules/propertyManagement/api/realEstate/private/constructionUpdate/constructionUpdate.dto.ts";
import type {TableResponse} from "armonia/src/modules/core/types/shared.types.ts";
import {IconRoute} from "@tabler/icons-react";
import {Building, CalendarDays, ChevronRight, FolderOpen} from "lucide-react";

type ConstructionUpdatesTimelineSectionProps = WithLanguageType & {
    /** Route-scoped project (e.g. navigated from a project page). Overridden by quick filter. */
    projectId?: string;
    onSelectUpdate?: (update: ConstructionUpdate) => void;
};

const NODE_MIN_WIDTH_REM = 10;
const QUICK_FILTER_FIELDS = ["project", "edifice"] as const;

function formatDate(value?: string) {
    if (!value) return "";
    try {
        return new Date(value).toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    } catch {
        return value;
    }
}

const NODE_SIZE_REM = 2.75; // h-11 / w-11

function progressTone(percent: number) {
    if (percent >= 75) return "border-success text-success ring-4 ring-success/15";
    if (percent >= 40) return "border-warning text-warning ring-4 ring-warning/15";
    return "border-info text-info ring-4 ring-info/15";
}

function TimelinePreview({
    update,
    resolveLanguageKey,
}: {
    update: ConstructionUpdate;
    resolveLanguageKey: (key: string) => unknown;
}) {
    const thumb = update.photos?.[0];
    const thumbUrl = thumb?._id ? `/api/auxiliary/media/${thumb._id}` : undefined;

    return (
        <div className="w-64 overflow-hidden rounded-md">
            {thumbUrl ? (
                <div className="h-28 w-full overflow-hidden bg-muted">
                    <img src={thumbUrl} alt="" className="h-full w-full object-cover" />
                </div>
            ) : (
                <div className="flex h-20 items-center justify-center bg-muted/50 text-xs text-muted-foreground">
                    {String(resolveLanguageKey("noPhoto"))}
                </div>
            )}
            <div className="flex flex-col gap-y-1.5 bg-card px-3 py-2.5 text-card-foreground">
                <p className="text-sm font-semibold leading-tight">{update.title}</p>
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                        <CalendarDays className="h-3 w-3 shrink-0" />
                        {formatDate(update.updateDate)}
                    </span>
                    {update.project?.name && (
                        <span className="inline-flex items-center gap-1">
                            <FolderOpen className="h-3 w-3 shrink-0" />
                            <span className="line-clamp-1">{update.project.name}</span>
                        </span>
                    )}
                    {update.edifice?.name && (
                        <span className="inline-flex items-center gap-1">
                            <Building className="h-3 w-3 shrink-0" />
                            <span className="line-clamp-1">{update.edifice.name}</span>
                        </span>
                    )}
                </div>
                {update.description && (
                    <p className="text-xs text-muted-foreground line-clamp-3">{update.description}</p>
                )}
            </div>
        </div>
    );
}

function ConstructionUpdatesTimelineSection({
    projectId,
    onSelectUpdate,
    resolveLanguageKey,
}: ConstructionUpdatesTimelineSectionProps) {
    const [searchParams] = useSearchParams();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [updates, setUpdates] = useState<ConstructionUpdate[]>([]);

    const {filterProject, filterEdifice} = useMemo(() => {
        const fromUrl = readQuickFiltersFromUrl(searchParams, [...QUICK_FILTER_FIELDS]);
        return {
            filterProject: fromUrl.project ?? projectId ?? undefined,
            filterEdifice: fromUrl.edifice ?? undefined,
        };
    }, [searchParams, projectId]);

    const fetchTimeline = useCallback(async () => {
        setLoading(true);
        setError(false);
        try {
            const body: Record<string, unknown> = {
                limit: 250,
                offset: 0,
                sortBy: "updateDate",
                sortOrder: "asc",
            };
            if (filterProject) body.project = filterProject;
            if (filterEdifice) body.edifice = filterEdifice;

            const res = await apiClient.post<TableResponse<ConstructionUpdate>>(
                "/api/realEstate/constructionUpdate",
                body,
            );
            const rows = [...(res.data?.data ?? [])].sort(
                (a, b) => new Date(a.updateDate).getTime() - new Date(b.updateDate).getTime(),
            );
            setUpdates(rows);
        } catch {
            setError(true);
            setUpdates([]);
        } finally {
            setLoading(false);
        }
    }, [filterProject, filterEdifice]);

    useEffect(() => {
        void fetchTimeline();
    }, [fetchTimeline]);

    const dateRangeLabel = useMemo(() => {
        if (updates.length === 0) return "";
        if (updates.length === 1) return formatDate(updates[0].updateDate);
        return `${formatDate(updates[0].updateDate)} → ${formatDate(updates[updates.length - 1].updateDate)}`;
    }, [updates]);

    const latestProgress = updates[updates.length - 1]?.progressPercent;
    const showContext = !filterEdifice;

    return (
        <Collapsible open={open} onOpenChange={setOpen} className="group/timeline mb-3">
            <Card className="gap-0 overflow-hidden py-0 shadow-none">
                <CollapsibleTrigger
                    type="button"
                    className={cn(
                        "flex w-full items-center gap-3 px-4 py-3 text-left outline-none",
                        "transition-colors hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    )}
                >
                    <ChevronRight
                        className={cn(
                            "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
                            "group-data-[state=open]/timeline:rotate-90",
                        )}
                    />
                    <IconRoute className="h-4 w-4 shrink-0 text-primary" />
                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold leading-tight">
                            {String(resolveLanguageKey("title"))}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
                            {String(resolveLanguageKey("description"))}
                        </p>
                    </div>
                    <div className="flex shrink-0 flex-wrap items-center justify-end gap-1.5">
                        {loading && (
                            <Badge variant="outline" className="text-3xs">
                                {String(resolveLanguageKey("loading"))}
                            </Badge>
                        )}
                        {!loading && !error && updates.length > 0 && (
                            <>
                                {latestProgress != null && (
                                    <Badge variant="secondary" className="text-3xs">
                                        {latestProgress}%
                                    </Badge>
                                )}
                                <Badge variant="outline" className="text-3xs">
                                    {updates.length} {String(resolveLanguageKey("updatesCount"))}
                                </Badge>
                                {dateRangeLabel && (
                                    <Badge variant="outline" className="hidden text-3xs sm:inline-flex">
                                        {dateRangeLabel}
                                    </Badge>
                                )}
                            </>
                        )}
                    </div>
                </CollapsibleTrigger>

                <CollapsibleContent>
                    <div className="border-t px-4 pb-4 pt-3">
                        {loading && (
                            <div className="flex min-h-[120px] items-center justify-center">
                                <Loader />
                            </div>
                        )}

                        {!loading && error && (
                            <SimpleError
                                title={String(resolveLanguageKey("failTitle"))}
                                description={String(resolveLanguageKey("failDescription"))}
                                onClick={() => void fetchTimeline()}
                            />
                        )}

                        {!loading && !error && updates.length === 0 && (
                            <div className="flex min-h-[100px] flex-col items-center justify-center gap-1 text-center text-muted-foreground">
                                <p className="text-sm font-medium">{String(resolveLanguageKey("emptyTitle"))}</p>
                                <p className="text-xs">{String(resolveLanguageKey("emptyDescription"))}</p>
                            </div>
                        )}

                        {!loading && !error && updates.length > 0 && (
                            <TooltipProvider delayDuration={200}>
                                <div className="overflow-x-auto pb-1">
                                    <div
                                        className="relative flex w-full items-start pt-1"
                                        style={{minWidth: `${updates.length * NODE_MIN_WIDTH_REM}rem`}}
                                    >
                                        {updates.map((update, index) => {
                                            const contextLabel =
                                                update.edifice?.name ?? update.project?.name;
                                            const isLast = index === updates.length - 1;

                                            return (
                                                <div
                                                    key={update._id}
                                                    className="relative flex min-w-0 flex-1 flex-col items-center"
                                                    style={{minWidth: `${NODE_MIN_WIDTH_REM}rem`}}
                                                >
                                                    {!isLast && (
                                                        <div
                                                            className="pointer-events-none absolute z-0 h-0.5 bg-gradient-to-r from-primary/40 to-border"
                                                            style={{
                                                                top: `${NODE_SIZE_REM / 2}rem`,
                                                                left: `calc(50% + ${NODE_SIZE_REM / 2}rem)`,
                                                                width: `calc(100% - ${NODE_SIZE_REM}rem)`,
                                                            }}
                                                            aria-hidden
                                                        />
                                                    )}

                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <button
                                                                type="button"
                                                                className={cn(
                                                                    "relative z-10 flex h-11 w-11 items-center justify-center rounded-full border-2 bg-card text-xs font-bold shadow-sm outline-none",
                                                                    "transition-transform hover:scale-110 focus-visible:scale-110 focus-visible:ring-2 focus-visible:ring-ring",
                                                                    progressTone(update.progressPercent ?? 0),
                                                                )}
                                                                onClick={() => onSelectUpdate?.(update)}
                                                                aria-label={update.title}
                                                            >
                                                                {update.progressPercent}%
                                                            </button>
                                                        </TooltipTrigger>
                                                        <TooltipContent
                                                            side="top"
                                                            sideOffset={10}
                                                            className="w-auto max-w-none border bg-card p-0 text-card-foreground shadow-xl [&>svg]:hidden"
                                                        >
                                                            <TimelinePreview
                                                                update={update}
                                                                resolveLanguageKey={resolveLanguageKey}
                                                            />
                                                        </TooltipContent>
                                                    </Tooltip>

                                                    <div className="mt-3 flex h-[4.25rem] w-full flex-col items-center px-2 text-center">
                                                        <p className="text-2xs font-medium tabular-nums text-muted-foreground">
                                                            {formatDate(update.updateDate)}
                                                        </p>
                                                        <p className="mt-0.5 w-full text-xs font-semibold leading-snug line-clamp-2">
                                                            {update.title}
                                                        </p>
                                                        {showContext && contextLabel && (
                                                            <p className="mt-0.5 w-full text-2xs text-muted-foreground line-clamp-1">
                                                                {contextLabel}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t pt-3 text-xs text-muted-foreground">
                                    <span>{String(resolveLanguageKey("hint"))}</span>
                                    <div className="flex flex-wrap gap-2">
                                        <Badge variant="outline" className="text-3xs">
                                            {updates.length} {String(resolveLanguageKey("updatesCount"))}
                                        </Badge>
                                        {dateRangeLabel && (
                                            <Badge variant="outline" className="text-3xs">
                                                {dateRangeLabel}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </TooltipProvider>
                        )}
                    </div>
                </CollapsibleContent>
            </Card>
        </Collapsible>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/constructionUpdates/center/timeline/constructionUpdatesTimelineSection.tsx"),
    withDebug(true, true),
)(ConstructionUpdatesTimelineSection);
