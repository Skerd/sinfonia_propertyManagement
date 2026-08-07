import {useState} from "react";
import {Link} from "react-router-dom";
import DyeusMenu from "@propertyManagementModule/clients/client/dyeus/shared/dyeusMenu.tsx";
import {dyeusAssets} from "@propertyManagementModule/clients/client/dyeus/shared/dyeusAssets.ts";

type DyeusHeaderProps = {
    variant?: "hero" | "solid";
};

function DyeusHeader({variant = "solid"}: DyeusHeaderProps) {
    const [menuOpen, setMenuOpen] = useState(false);
    const isHero = variant === "hero";

    return (
        <>
            <header
                className={`absolute inset-x-0 top-0 z-50 ${isHero ? "text-dyeus-cream" : "text-dyeus-ink"}`}
            >
                <div className="relative mx-auto flex h-[100px] max-w-[1728px] items-center justify-between px-6 md:h-[157px] md:px-[60px]">
                    <button
                        type="button"
                        onClick={() => setMenuOpen(true)}
                        className="relative z-10 flex h-[18px] w-[56px] items-center"
                        aria-label="Open menu"
                        aria-haspopup="dialog"
                        aria-expanded={menuOpen}
                    >
                        <img
                            src={dyeusAssets.iconMenu}
                            alt=""
                            className={`h-[18px] w-[56px] object-contain ${isHero ? "" : "brightness-0"}`}
                        />
                    </button>

                    <Link
                        to="/"
                        className="absolute left-1/2 top-5 z-10 h-[100px] w-[140px] -translate-x-1/2 md:top-0 md:h-[157px] md:w-[210px]"
                        aria-label="Dyeus home"
                    >
                        <div className="relative size-full overflow-hidden">
                            <img
                                src={dyeusAssets.logoHero}
                                alt="DYEUS"
                                className={`absolute left-0 top-[-33.33%] h-[166.67%] w-full max-w-none object-cover ${
                                    isHero ? "" : "brightness-0"
                                }`}
                            />
                        </div>
                    </Link>

                    <button
                        type="button"
                        className="relative z-10 size-8"
                        aria-label="Language"
                    >
                        <img
                            src={dyeusAssets.iconLang}
                            alt=""
                            className={`size-8 object-contain ${isHero ? "" : "brightness-0"}`}
                        />
                    </button>
                </div>
            </header>
            <DyeusMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
        </>
    );
}

export default DyeusHeader;
