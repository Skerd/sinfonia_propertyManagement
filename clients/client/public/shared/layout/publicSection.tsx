import {type ReactNode} from "react";
import {cn} from "@coreModule/components/lib/utils.ts";
import {
    PUBLIC_CONTENT_FRAME,
    PUBLIC_SECTION,
    PUBLIC_SECTION_BASE,
    PUBLIC_SECTION_FLUSH,
} from "@propertyManagementModule/clients/client/public/shared/layout/publicLayoutTokens.ts";

type PublicSectionSpacing = "default" | "none";

type PublicSectionProps = {
    nodeId?: string;
    fullBleed?: boolean;
    flush?: boolean;
    /** When true with fullBleed, still wraps children in the centered content frame (bg stays full-bleed in child). */
    contentFrame?: boolean;
    spacing?: PublicSectionSpacing;
    className?: string;
    containerClassName?: string;
    children: ReactNode;
};

function PublicSection({
    nodeId,
    fullBleed = false,
    flush = false,
    contentFrame = false,
    spacing,
    className,
    containerClassName,
    children,
}: PublicSectionProps) {
    const isFlush = flush || spacing === "none";
    const sectionClass = cn(PUBLIC_SECTION_BASE, isFlush ? PUBLIC_SECTION_FLUSH : PUBLIC_SECTION, className);

    if (fullBleed || isFlush) {
        if (contentFrame) {
            return (
                <section className={sectionClass} data-node-id={nodeId}>
                    <div className={cn(PUBLIC_CONTENT_FRAME, containerClassName)}>{children}</div>
                </section>
            );
        }

        return (
            <section className={sectionClass} data-node-id={nodeId}>
                {children}
            </section>
        );
    }

    return (
        <section className={sectionClass} data-node-id={nodeId}>
            <div className={cn(PUBLIC_CONTENT_FRAME, containerClassName)}>{children}</div>
        </section>
    );
}

export default PublicSection;
