import React, {useEffect} from "react";
import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import {
    DashboardWidgetCard,
    DashboardWidgetEmpty,
} from "@propertyManagementModule/components/custom/cards/DashboardWidgetCard.tsx";
import type {
    DeliveryReadinessFormResponseType,
} from "armonia/src/modules/propertyManagement/api/realEstate/private/dashboard/deliveryReadiness.form.response.type.ts";

type DeliveryReadinessCardProps = WithLanguageType &
    WithAxiosType<DeliveryReadinessFormResponseType, {projectId?: string; edificeId?: string}> & {
        projectId?: string;
        edificeId?: string;
    };

function barColor(percent: number): string {
    if (percent >= 80) return "bg-status-available";
    if (percent >= 40) return "bg-primary";
    return "bg-status-reserved";
}

function DeliveryReadinessCardInner({
    resolveLanguageKey,
    data,
    loading,
    onFilterChange,
    projectId,
    edificeId,
}: DeliveryReadinessCardProps) {
    useEffect(() => {
        onFilterChange({projectId, edificeId});
        // onFilterChange identity changes every withAxios render — do not add to deps.
    }, [projectId, edificeId]);

    const activeDomains = data?.domains?.filter((d) => d.percent != null) ?? [];

    return (
        <DashboardWidgetCard title={resolveLanguageKey("title") as string}>
            {loading && !data ? null : activeDomains.length === 0 ? (
                <DashboardWidgetEmpty message={resolveLanguageKey("empty") as string} />
            ) : (
                <div className="flex flex-col gap-3">
                    {data?.overallScore != null && (
                        <div className="flex items-baseline justify-between">
                            <span className="text-sm text-muted-foreground">{resolveLanguageKey("overall")}</span>
                            <span className="text-2xl font-semibold">{data.overallScore}%</span>
                        </div>
                    )}
                    {activeDomains.map((d) => (
                        <div key={d.key} className="flex flex-col gap-1">
                            <div className="flex items-center justify-between text-sm">
                                <span>{resolveLanguageKey(`domain.${d.key}`)}</span>
                                <span className="text-muted-foreground">
                                    {d.done}/{d.total} · {d.percent}%
                                </span>
                            </div>
                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                                <div
                                    className={cn("h-full rounded-full transition-all", barColor(d.percent as number))}
                                    style={{width: `${d.percent}%`}}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </DashboardWidgetCard>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/components/custom/dashboard/deliveryReadinessCard.tsx"),
    withAxios<DeliveryReadinessFormResponseType, {projectId?: string; edificeId?: string}>(
        {method: "post", url: "/api/realEstate/dashboard/deliveryReadiness", data: {}},
        true,
    ),
    withDebug(true, true),
)(DeliveryReadinessCardInner) as unknown as React.ComponentType<{projectId?: string; edificeId?: string}>;
