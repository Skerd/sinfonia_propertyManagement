import type {ReactNode, KeyboardEvent} from "react";
import {Card} from "@coreModule/components/ui/card.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import {
    CARD_SHELL_CLASS,
    CARD_SHELL_CLICKABLE_CLASS,
    DASHBOARD_SELECTABLE_RING,
} from "./entityCard.constants.ts";

type EntityCardShellProps = {
    children: ReactNode;
    className?: string;
    onClick?: () => void;
    /** Dashboard / overview selectable card. */
    selectable?: boolean;
    isSelected?: boolean;
    /** Disable pointer cursor (e.g. fetch-only preview). */
    disableClick?: boolean;
};

function handleSelectableKeyDown(
    e: KeyboardEvent<HTMLDivElement>,
    onClick?: () => void,
) {
    if (onClick && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        onClick();
    }
}

export function EntityCardShell({
    children,
    className,
    onClick,
    selectable = false,
    isSelected = false,
    disableClick = false,
}: EntityCardShellProps) {
    const interactive = !!onClick && !disableClick;

    if (selectable) {
        return (
            <Card
                role="button"
                tabIndex={0}
                onClick={onClick}
                onKeyDown={(e) => handleSelectableKeyDown(e, onClick)}
                className={cn(
                    CARD_SHELL_CLASS,
                    "cursor-pointer p-5 gap-4 relative overflow-hidden",
                    isSelected && DASHBOARD_SELECTABLE_RING,
                    className,
                )}
            >
                {children}
            </Card>
        );
    }

    return (
        <Card
            className={cn(
                interactive ? CARD_SHELL_CLICKABLE_CLASS : CARD_SHELL_CLASS,
                className,
            )}
            onClick={interactive ? onClick : undefined}
        >
            {children}
        </Card>
    );
}
