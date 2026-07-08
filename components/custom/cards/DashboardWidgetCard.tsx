import type {ReactNode} from "react";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@coreModule/components/ui/card.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";

type DashboardWidgetCardProps = {
    title: string;
    description?: string;
    children: ReactNode;
    className?: string;
    contentClassName?: string;
    /** Subtle glass elevation on analytics widgets. */
    glass?: boolean;
    footer?: ReactNode;
};

export function DashboardWidgetCard({
    title,
    description,
    children,
    className,
    contentClassName,
    glass = true,
    footer,
}: DashboardWidgetCardProps) {
    return (
        <Card className={cn(glass && "glass-card", className)}>
            <CardHeader className="pb-2">
                <CardTitle className="font-display text-lg">{title}</CardTitle>
                {description != null && description !== "" && (
                    <CardDescription>{description}</CardDescription>
                )}
            </CardHeader>
            <CardContent className={cn("pt-0", contentClassName)}>{children}</CardContent>
            {footer != null && (
                <div className="px-6 pb-4 pt-0 border-t border-border mt-2">{footer}</div>
            )}
        </Card>
    );
}

export function DashboardWidgetEmpty({message}: {message: string}) {
    return (
        <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
            {message}
        </div>
    );
}
