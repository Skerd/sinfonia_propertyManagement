import {useEffect, useRef, useState} from "react";
import {Link} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import DyeusMenu from "@propertyManagementModule/clients/client/dyeus/shared/dyeusMenu.tsx";
import {dyeusAssets} from "@propertyManagementModule/clients/client/dyeus/shared/dyeusAssets.ts";
import {useDyeusT} from "@propertyManagementModule/clients/client/dyeus/shared/useDyeusT.ts";
import {changeLanguage} from "@coreModule/helpers/redux/slices/languageSlice.ts";
import {RootState} from "@coreModule/helpers/redux/store/generalStore.ts";
import mainConfig from "@coreModule/assets/languages/mainConfig.json";

type DyeusHeaderProps = {
    variant?: "hero" | "solid";
};

type SupportedLanguage = {
    languageCode: string;
    shortCode: string;
};

const HEADER_LANGUAGE_PATH =
    "src/modules/propertyManagement/clients/client/dyeus/shared/dyeusHeader.tsx";

const MENU_LANGUAGES = mainConfig.supportedLanguages as SupportedLanguage[];

function DyeusHeader({variant = "solid"}: DyeusHeaderProps) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [langOpen, setLangOpen] = useState(false);
    const langRef = useRef<HTMLDivElement>(null);
    const isHero = variant === "hero";
    const {t} = useDyeusT(HEADER_LANGUAGE_PATH);
    const dispatch = useDispatch();
    const languageCode = useSelector((state: RootState) => state.language.languageCode);

    useEffect(() => {
        if (!langOpen) return;
        const onPointerDown = (event: MouseEvent) => {
            if (!langRef.current?.contains(event.target as Node)) {
                setLangOpen(false);
            }
        };
        const onKey = (event: KeyboardEvent) => {
            if (event.key === "Escape") setLangOpen(false);
        };
        window.addEventListener("mousedown", onPointerDown);
        window.addEventListener("keydown", onKey);
        return () => {
            window.removeEventListener("mousedown", onPointerDown);
            window.removeEventListener("keydown", onKey);
        };
    }, [langOpen]);

    return (
        <>
            <header
                className={`absolute inset-x-0 top-0 z-50 ${isHero ? "text-dyeus-cream" : "text-dyeus-ink"}`}
            >
                <div className="relative mx-auto flex h-[100px] max-w-[1728px] items-center justify-between px-6 md:h-[157px] md:px-[60px]">
                    <button
                        type="button"
                        onClick={() => setMenuOpen(true)}
                        className="group relative z-10 flex h-[18px] w-[56px] cursor-pointer items-center"
                        aria-label={t("openMenu")}
                        aria-haspopup="dialog"
                        aria-expanded={menuOpen}
                    >
                        <img
                            src={dyeusAssets.iconMenu}
                            alt=""
                            className={`h-[18px] w-[56px] object-contain transition-opacity duration-300 group-hover:opacity-60 ${
                                isHero ? "" : "brightness-0"
                            }`}
                        />
                    </button>

                    <Link
                        to="/"
                        className="absolute left-1/2 top-5 z-10 h-[100px] w-[140px] -translate-x-1/2 md:top-0 md:h-[157px] md:w-[210px]"
                        aria-label={t("homeAria")}
                    >
                        <div className="relative size-full overflow-hidden">
                            <img
                                src={dyeusAssets.logoHero}
                                alt={t("logoAlt")}
                                className={`absolute left-0 top-[-33.33%] h-[166.67%] w-full max-w-none object-cover ${
                                    isHero ? "" : "brightness-0"
                                }`}
                            />
                        </div>
                    </Link>

                    <div ref={langRef} className="relative z-10">
                        <button
                            type="button"
                            className="relative size-8 cursor-pointer"
                            aria-label={t("language")}
                            aria-haspopup="listbox"
                            aria-expanded={langOpen}
                            onClick={() => setLangOpen((open) => !open)}
                        >
                            <img
                                src={dyeusAssets.iconLang}
                                alt=""
                                className={`size-8 object-contain ${isHero ? "" : "brightness-0"}`}
                            />
                        </button>
                        {langOpen ? (
                            <div
                                role="listbox"
                                aria-label={t("languageGroup")}
                                className={`absolute right-0 top-[calc(100%+12px)] min-w-[88px] border border-dyeus-border bg-dyeus-cream p-2 shadow-sm ${
                                    isHero ? "text-dyeus-ink" : ""
                                }`}
                            >
                                {MENU_LANGUAGES.map((language) => {
                                    const active = language.languageCode === languageCode;
                                    return (
                                        <button
                                            key={language.languageCode}
                                            type="button"
                                            role="option"
                                            aria-selected={active}
                                            onClick={() => {
                                                dispatch(changeLanguage(language.languageCode));
                                                setLangOpen(false);
                                            }}
                                            className={`block w-full cursor-pointer px-3 py-2 text-left font-dyeus-serif text-sm tracking-[0.08em] transition-colors hover:text-dyeus-bronze ${
                                                active ? "font-bold text-dyeus-bronze" : "text-dyeus-ink"
                                            }`}
                                        >
                                            {language.shortCode}
                                        </button>
                                    );
                                })}
                            </div>
                        ) : null}
                    </div>
                </div>
            </header>
            <DyeusMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
        </>
    );
}

export default DyeusHeader;
