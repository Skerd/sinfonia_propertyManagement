import {compose} from "redux";
import {useCallback, useEffect, useMemo, useState} from "react";
import withLanguage, {type WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
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
    projectId?: string;
    onSelectUpdate?: (update: ConstructionUpdate) => void;
};

const NODE_WIDTH_REM = 7;

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

function progressTone(percent: number) {
    if (percent >= 75) return "border-success/50 bg-success/10 text-success";
    if (percent >= 40) return "border-warning/50 bg-warning/10 text-warning";
    return "border-info/50 bg-info/10 text-info";
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
            <div className="space-y-1.5 bg-card px-3 py-2.5 text-card-foreground">
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
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [updates, setUpdates] = useState<ConstructionUpdate[]>([]);

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
            if (projectId) body.projectId = projectId;

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
    }, [projectId]);

    useEffect(() => {
        void fetchTimeline();
    }, [fetchTimeline]);

    const dateRangeLabel = useMemo(() => {
        if (updates.length === 0) return "";
        if (updates.length === 1) return formatDate(updates[0].updateDate);
        return `${formatDate(updates[0].updateDate)} → ${formatDate(updates[updates.length - 1].updateDate)}`;
    }, [updates]);

    const latestProgress = updates[updates.length - 1]?.progressPercent;

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
                            <Badge variant="outline" className="text-[10px]">
                                {String(resolveLanguageKey("loading"))}
                            </Badge>
                        )}
                        {!loading && !error && updates.length > 0 && (
                            <>
                                {latestProgress != null && (
                                    <Badge variant="secondary" className="text-[10px]">
                                        {latestProgress}%
                                    </Badge>
                                )}
                                <Badge variant="outline" className="text-[10px]">
                                    {updates.length} {String(resolveLanguageKey("updatesCount"))}
                                </Badge>
                                {dateRangeLabel && (
                                    <Badge variant="outline" className="hidden text-[10px] sm:inline-flex">
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
                                        className="relative mx-auto flex min-w-max items-start pt-1"
                                        style={{minWidth: `${updates.length * NODE_WIDTH_REM}rem`}}
                                    >
                                        <div
                                            className="pointer-events-none absolute top-[1.375rem] h-0.5 rounded-full bg-gradient-to-r from-border via-primary/35 to-border"
                                            style={{
                                                left: `${NODE_WIDTH_REM / 2}rem`,
                                                right: `${NODE_WIDTH_REM / 2}rem`,
                                            }}
                                        />

                                        {updates.map((update) => (
                                            <div
                                                key={update._id}
                                                className="relative flex shrink-0 flex-col items-center"
                                                style={{width: `${NODE_WIDTH_REM}rem`}}
                                            >
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <button
                                                            type="button"
                                                            className={cn(
                                                                "relative z-10 flex h-11 w-11 items-center justify-center rounded-full border-2 text-xs font-bold shadow-sm outline-none",
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

                                                <div className="mt-3 w-full px-1 text-center">
                                                    <p className="text-[11px] font-medium text-muted-foreground">
                                                        {formatDate(update.updateDate)}
                                                    </p>
                                                    <p className="mt-0.5 text-xs font-semibold leading-snug line-clamp-2">
                                                        {update.title}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t pt-3 text-xs text-muted-foreground">
                                    <span>{String(resolveLanguageKey("hint"))}</span>
                                    <div className="flex flex-wrap gap-2">
                                        <Badge variant="outline" className="text-[10px]">
                                            {updates.length} {String(resolveLanguageKey("updatesCount"))}
                                        </Badge>
                                        {dateRangeLabel && (
                                            <Badge variant="outline" className="text-[10px]">
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
