import type {ReactNode} from "react";
import {cn} from "@coreModule/components/lib/utils.ts";
import {
    DASHBOARD_SECTION,
    DASHBOARD_TAB_INTRO,
} from "@coreModule/components/entityPage/list/entityCard.constants.ts";

type DashboardKpiSectionProps = {
    title: string;
    description?: string;
    children: ReactNode;
    className?: string;
};

/**
 * Uniform KPI block for overview tabs: title + muted description (same rhythm
 * as the edifices tab intro), then the KPI grid / section body.
 */
export function DashboardKpiSection({
    title,
    description,
    children,
    className,
}: DashboardKpiSectionProps) {
    return (
        <div className={cn(DASHBOARD_SECTION, className)}>
            <div className={DASHBOARD_TAB_INTRO}>
                <h2 className="text-sm font-semibold">{title}</h2>
                {description ? (
                    <p className="text-xs text-muted-foreground">{description}</p>
                ) : null}
            </div>
            {children}
        </div>
    );
}
