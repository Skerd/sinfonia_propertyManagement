import {useEffect, useState} from "react";
import {createPortal} from "react-dom";
import {Link} from "react-router-dom";
import {dyeusMenuLinks} from "@propertyManagementModule/clients/client/dyeus/shared/dyeusRouteMap.ts";

type DyeusMenuProps = {
    open: boolean;
    onClose: () => void;
};

function DyeusMenu({open, onClose}: DyeusMenuProps) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (!open) {
            setVisible(false);
            return;
        }
        const frame = requestAnimationFrame(() => setVisible(true));
        return () => cancelAnimationFrame(frame);
    }, [open]);

    useEffect(() => {
        if (!open) return;
        const onKey = (event: KeyboardEvent) => {
            if (event.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKey);
        const previous = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            window.removeEventListener("keydown", onKey);
            document.body.style.overflow = previous;
        };
    }, [open, onClose]);

    if (!open) return null;

    return createPortal(
        <div
            className={`fixed inset-0 z-[200] bg-dyeus-cream transition-opacity duration-300 ${visible ? "opacity-100" : "opacity-0"}`}
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
        >
            <div className="mx-auto flex h-full max-w-[1440px] flex-col px-6 py-6 md:px-12 md:py-10">
                <div className="flex items-center justify-between">
                    <Link to="/" onClick={onClose} className="font-dyeus-serif text-2xl tracking-[0.18em] text-dyeus-ink md:text-3xl">
                        DYEUS
                    </Link>
                    <button
                        type="button"
                        onClick={onClose}
                        className="font-dyeus-sans text-sm uppercase tracking-[0.22em] text-dyeus-ink-muted transition hover:text-dyeus-ink"
                    >
                        Close
                    </button>
                </div>

                <nav className="flex flex-1 flex-col justify-center gap-4 md:gap-6">
                    {dyeusMenuLinks.map((link, index) => (
                        <Link
                            key={link.path}
                            to={link.path}
                            onClick={onClose}
                            className="group flex items-baseline gap-4 font-dyeus-serif text-4xl text-dyeus-ink transition hover:text-dyeus-bronze md:text-6xl"
                            style={{transitionDelay: `${index * 40}ms`}}
                        >
                            <span className="font-dyeus-sans text-xs tracking-[0.2em] text-dyeus-ink-faded">
                                {String(index + 1).padStart(2, "0")}
                            </span>
                            {link.label}
                        </Link>
                    ))}
                </nav>

                <div className="flex items-end justify-between gap-4 pb-4">
                    <p className="max-w-sm font-dyeus-sans text-sm leading-relaxed text-dyeus-ink-muted">
                        Luxury living on one of Europe&apos;s last untouched Mediterranean coastlines.
                    </p>
                    <div
                        aria-hidden
                        className="size-16 shrink-0 rounded-full border border-dyeus-border bg-[radial-gradient(circle_at_30%_30%,#c9b089,transparent_55%),radial-gradient(circle_at_70%_70%,#9a7b4f33,transparent_50%)] md:size-24"
                    />
                </div>
            </div>
        </div>,
        document.body,
    );
}

export default DyeusMenu;
