import {Link} from "react-router-dom";
import {cn} from "@coreModule/components/lib/utils.ts";
import {ownershipImageCropStyle, type OwnershipImageCropKey} from "@propertyManagementModule/clients/client/public/shared/layout/figmaDimensions.ts";
import {PUBLIC_BODY, PUBLIC_CARD_TITLE} from "@propertyManagementModule/clients/client/public/shared/layout/publicLayoutTokens.ts";

export type OwnershipCardContent = {
    image: string;
    title: string;
    body: string;
    checklist: string[];
    ctaLabel: string;
    ctaHref?: string;
    includedLabel: string;
    nodeId: string;
    imageCrop: OwnershipImageCropKey;
    layoutVariant?: "1" | "2" | "3";
};

type OwnershipInteractiveCardProps = {
    card: OwnershipCardContent;
    checkCircle: string;
    variant: "light" | "dark";
};

function CheckItem({label, checkCircle, variant}: {label: string; checkCircle: string; variant: "light" | "dark"}) {
    return (
        <div className="relative flex w-full min-w-0 shrink-0 items-start gap-2">
            <div className="relative size-6 shrink-0">
                <img alt="" aria-hidden className="absolute inset-0 block size-full" src={checkCircle} />
            </div>
            <p
                className={`min-w-0 flex-1 ${PUBLIC_BODY} leading-[1.2] ${
                    variant === "light" ? "text-pronix-ink" : "text-white"
                }`}
            >
                {label}
            </p>
        </div>
    );
}

function OwnershipCta({
    href,
    label,
    variant,
}: {
    href?: string;
    label: string;
    variant: "light" | "dark";
}) {
    // Match footer Send: outline CTA that inverts fill/text on hover.
    const className = cn(
        "mt-auto flex w-full min-w-0 shrink-0 cursor-pointer items-center justify-center border px-12 py-4",
        "bg-transparent transition-colors duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        variant === "light"
            ? "border-pronix-ink text-pronix-ink hover:bg-pronix-ink hover:text-white focus-visible:ring-pronix-ink/40 focus-visible:ring-offset-white"
            : "border-white text-white hover:bg-white hover:text-pronix-blue focus-visible:ring-white/70 focus-visible:ring-offset-[#181818]",
    );
    const labelClassName = "font-aeonik-medium whitespace-nowrap not-italic leading-[17.15px] text-base md:text-lg lg:text-[24px]";

    const content = <span className={labelClassName}>{label}</span>;

    if (!href) {
        return <div className={className}>{content}</div>;
    }

    if (href.startsWith("#")) {
        return (
            <a href={href} className={className}>
                {content}
            </a>
        );
    }

    return (
        <Link to={href} className={className}>
            {content}
        </Link>
    );
}

function OwnershipInteractiveCard({card, checkCircle, variant}: OwnershipInteractiveCardProps) {
    const layoutVariant = card.layoutVariant ?? "1";
    const darkHoverBlur =
        layoutVariant === "1" ? "hover:backdrop-blur-[47.5px]" : "hover:backdrop-blur-[17.5px]";

    return (
        <div
            className={cn(
                // flex-1 + self-stretch fill the grid cell; % height alone is unreliable in CSS grid.
                "group relative flex min-h-0 w-full min-w-0 flex-1 cursor-default flex-col self-stretch gap-6 rounded-[5px] p-6 transition-all duration-500 sm:p-8",
                variant === "light"
                    ? "border border-pronix-border bg-white"
                    : `border border-[rgba(255,255,255,0.4)] hover:bg-[rgba(255,255,255,0.05)] ${darkHoverBlur}`,
            )}
            data-node-id={card.nodeId}
        >
            <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col items-start gap-6">
                <div className="relative aspect-[344/213] w-full min-w-0 overflow-hidden rounded-[3.627px]">
                    <img
                        alt=""
                        aria-hidden
                        className="absolute max-w-none object-cover"
                        src={card.image}
                        style={ownershipImageCropStyle(card.imageCrop)}
                    />
                </div>
                <div className="flex w-full min-w-0 flex-col items-start gap-3 not-italic leading-[1.2]">
                    <p
                        className={`w-full min-w-0 ${PUBLIC_CARD_TITLE} ${
                            variant === "light" ? "text-pronix-ink" : "text-white"
                        }`}
                    >
                        {card.title}
                    </p>
                    <p
                        className={`w-full min-w-0 font-aeonik-light ${PUBLIC_BODY} leading-[1.2] ${
                            variant === "light" ? "text-pronix-ink" : "text-white"
                        }`}
                    >
                        {card.body}
                    </p>
                </div>
                <div className="flex w-full min-w-0 flex-col items-start gap-2">
                    <p
                        className={`w-full min-w-0 font-aeonik-medium text-base not-italic leading-[1.2] sm:text-lg ${
                            variant === "light" ? "text-pronix-ink" : "text-white"
                        }`}
                    >
                        {card.includedLabel}
                    </p>
                    <div className="flex w-full min-w-0 flex-col items-start gap-3">
                        {card.checklist.map((item) => (
                            <CheckItem key={item} label={item} checkCircle={checkCircle} variant={variant} />
                        ))}
                    </div>
                </div>
            </div>
            <OwnershipCta href={card.ctaHref} label={card.ctaLabel} variant={variant} />
        </div>
    );
}

export default OwnershipInteractiveCard;
