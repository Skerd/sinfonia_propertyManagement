import {useState} from "react";
import {Link} from "react-router-dom";
import DyeusMenu from "@propertyManagementModule/clients/client/dyeus/shared/dyeusMenu.tsx";

type DyeusHeaderProps = {
    variant?: "hero" | "solid";
};

function DyeusHeader({variant = "solid"}: DyeusHeaderProps) {
    const [menuOpen, setMenuOpen] = useState(false);
    const isHero = variant === "hero";

    return (
        <>
            <header
                className={`absolute inset-x-0 top-0 z-50 ${isHero ? "text-dyeus-white" : "text-dyeus-ink"}`}
            >
                <div className="mx-auto flex max-w-[1440px] items-center justify-between px-6 py-5 md:px-12 md:py-7">
                    <Link
                        to="/"
                        className="font-dyeus-serif text-xl tracking-[0.22em] md:text-2xl"
                    >
                        DYEUS
                    </Link>
                    <button
                        type="button"
                        onClick={() => setMenuOpen(true)}
                        className={`font-dyeus-sans text-xs uppercase tracking-[0.24em] transition ${
                            isHero ? "text-dyeus-white/90 hover:text-dyeus-white" : "text-dyeus-ink-muted hover:text-dyeus-ink"
                        }`}
                        aria-haspopup="dialog"
                        aria-expanded={menuOpen}
                    >
                        Menu
                    </button>
                </div>
            </header>
            <DyeusMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
        </>
    );
}

export default DyeusHeader;
