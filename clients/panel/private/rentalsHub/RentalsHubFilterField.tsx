import type {ReactNode} from "react";
import {Label} from "@coreModule/components/ui/label.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";

export function RentalsHubFilterField({
    label,
    children,
    className,
}: {
    label: string;
    children: ReactNode;
    className?: string;
}) {
    return (
        <div className={cn("flex min-w-[9.5rem] flex-1 flex-col gap-1.5", className)}>
            <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
            {children}
        </div>
    );
}

export function RentalsHubFilterToolbar({
    children,
    className,
}: {
    children: ReactNode;
    className?: string;
}) {
    return (
        <div className={cn("border-b bg-muted/30 px-4 py-3", className)}>
            {children}
        </div>
    );
}
