import React, {useEffect} from "react";
import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import {PUBLIC_TITLE} from "@propertyManagementModule/clients/client/public/shared/layout/publicLayoutTokens.ts";
import type {
    MarketingConstructionProgressFormResponseType,
    MarketingMilestone,
    MarketingConstructionUpdate,
} from "armonia/src/modules/propertyManagement/api/realEstate/public/marketingConstructionProgress/marketingConstructionProgress.form.response.type";

type ConstructionProgressSectionProps = WithLanguageType &
    WithAxiosType<MarketingConstructionProgressFormResponseType, {projectId: string}> & {
        projectId: string;
    };

function milestoneStatusKey(status: string): string {
    switch (status) {
        case "completed": return "milestoneCompleted";
        case "in_progress": return "milestoneInProgress";
        case "delayed": return "milestoneDelayed";
        default: return "milestonePlanned";
    }
}

function milestoneDotClass(status: string): string {
    switch (status) {
        case "completed": return "bg-pronix-blue";
        case "in_progress": return "bg-pronix-blue/60";
        case "delayed": return "bg-amber-500";
        default: return "bg-pronix-border";
    }
}

function formatMonth(iso: string | undefined, languageCode: string): string | null {
    if (!iso) return null;
    try {
        return new Date(iso).toLocaleDateString(languageCode, {year: "numeric", month: "short"});
    } catch {
        return null;
    }
}

function MilestoneRow({milestone, resolveLanguageKey, languageCode}: {
    milestone: MarketingMilestone;
    resolveLanguageKey: WithLanguageType["resolveLanguageKey"];
    languageCode: string;
}) {
    const planned = formatMonth(milestone.plannedEnd ?? milestone.plannedStart, languageCode);
    return (
        <li className="flex items-center gap-4 py-3">
            <span className={`h-3 w-3 shrink-0 rounded-full ${milestoneDotClass(milestone.status)}`} />
            <span className="flex-1 font-aeonik-light text-base text-pronix-ink not-italic md:text-xl">
                {milestone.title}
            </span>
            {planned && (
                <span className="font-aeonik-light text-sm text-pronix-ink-muted not-italic md:text-base">
                    {planned}
                </span>
            )}
            <span className="w-28 text-right font-aeonik-light text-sm text-pronix-ink-muted not-italic md:text-base">
                {resolveLanguageKey(milestoneStatusKey(milestone.status))}
            </span>
        </li>
    );
}

function UpdateCard({update, languageCode}: {update: MarketingConstructionUpdate; languageCode: string}) {
    const date = formatMonth(update.updateDate, languageCode);
    return (
        <article className="flex flex-col gap-3 rounded-[5px] border border-pronix-border p-4">
            {update.photos.length > 0 && (
                <img
                    src={update.photos[0]}
                    alt={update.title}
                    loading="lazy"
                    className="aspect-video w-full rounded-[5px] object-cover"
                />
            )}
            <div className="flex items-center justify-between gap-3">
                <h4 className="font-aeonik-light text-base text-pronix-ink not-italic md:text-xl">{update.title}</h4>
                <span className="shrink-0 font-aeonik-light text-sm text-pronix-blue not-italic md:text-base">
                    {update.progressPercent}%
                </span>
            </div>
            {date && (
                <p className="font-aeonik-light text-sm text-pronix-ink-muted not-italic">{date}</p>
            )}
            {update.description && (
                <p className="line-clamp-3 font-aeonik-light text-sm text-pronix-ink-muted not-italic md:text-base">
                    {update.description}
                </p>
            )}
        </article>
    );
}

function ConstructionProgressSectionInner({
    resolveLanguageKey,
    languageCode,
    data,
    loading,
    onFilterChange,
    projectId,
}: ConstructionProgressSectionProps) {
    useEffect(() => {
        if (projectId) {
            onFilterChange({projectId});
        }
        // onFilterChange identity changes every withAxios render — do not add to deps.
    }, [projectId]);

    const progress = data?.progress;
    if (loading || !progress) return null;
    if (progress.milestones.length === 0 && progress.updates.length === 0) return null;

    const percent = progress.overallPercent ?? progress.latestUpdatePercent;

    return (
        <div className="flex w-full flex-col gap-8" data-node-id="construction-progress">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <h2 className={PUBLIC_TITLE}>{resolveLanguageKey("title")}</h2>
                {percent != null && (
                    <p className="font-aeonik-light text-lg text-pronix-ink not-italic md:text-2xl">
                        {percent}% {resolveLanguageKey("completeLabel")}
                    </p>
                )}
            </div>
            {percent != null && (
                <div className="h-2 w-full overflow-hidden rounded-full bg-pronix-border/50">
                    <div
                        className="h-full rounded-full bg-pronix-blue transition-all"
                        style={{width: `${Math.min(100, Math.max(0, percent))}%`}}
                    />
                </div>
            )}
            {progress.milestones.length > 0 && (
                <ul className="divide-y divide-pronix-border/50">
                    {progress.milestones.map((milestone) => (
                        <MilestoneRow
                            key={milestone.id}
                            milestone={milestone}
                            resolveLanguageKey={resolveLanguageKey}
                            languageCode={languageCode}
                        />
                    ))}
                </ul>
            )}
            {progress.updates.length > 0 && (
                <div className="flex flex-col gap-4">
                    <h3 className="font-aeonik-light text-lg text-pronix-ink not-italic md:text-2xl">
                        {resolveLanguageKey("updatesTitle")}
                    </h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {progress.updates.map((update) => (
                            <UpdateCard key={update.id} update={update} languageCode={languageCode} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/client/public/project/sections/constructionProgressSection.tsx"),
    withAxios<MarketingConstructionProgressFormResponseType, {projectId: string}>(
        {method: "post", url: "/api/realEstate/marketingConstructionProgress/single", data: {}},
        true,
    ),
    withDebug(true, true),
)(ConstructionProgressSectionInner) as unknown as React.ComponentType<{projectId: string}>;
