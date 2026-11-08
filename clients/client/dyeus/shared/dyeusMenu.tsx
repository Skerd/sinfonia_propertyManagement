import {useEffect, useRef, useState} from "react";
import {Dialog, DialogFrame} from "@coreModule/components/ui/dialog.tsx";
import {Link, useLocation} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import {dyeusAssets} from "@propertyManagementModule/clients/client/dyeus/shared/dyeusAssets.ts";
import {dyeusMenuLinks} from "@propertyManagementModule/clients/client/dyeus/shared/dyeusRouteMap.ts";
import {useDyeusSocialLinks} from "@propertyManagementModule/clients/client/dyeus/shared/useDyeusSocialLinks.ts";
import {useDyeusT} from "@propertyManagementModule/clients/client/dyeus/shared/useDyeusT.ts";
import {pickLanguage} from "@coreModule/helpers/redux/slices/languageSlice.ts";
import {RootState} from "@coreModule/helpers/redux/store/generalStore.ts";
import mainConfig from "@coreModule/assets/languages/mainConfig.json";
import {useOutsideClick} from "@coreModule/helpers/hooks/useOutsideClick.ts";
import {Button} from "@coreModule/components/ui/button.tsx";

type DyeusMenuProps = {
    open: boolean;
    onClose: () => void;
};

type SupportedLanguage = {
    languageCode: string;
    shortCode: string;
};

const MENU_LANGUAGE_PATH =
    "src/modules/propertyManagement/clients/client/dyeus/shared/dyeusMenu.tsx";

const MENU_LANGUAGES = mainConfig.supportedLanguages as SupportedLanguage[];

/** Same underline/hover treatment as footer Explore links, scaled for the overlay. */
const menuLinkClassName =
    "w-fit font-dyeus-serif text-[clamp(1.75rem,3.2vw,2.5rem)] leading-[1.2] text-dyeus-ink underline decoration-transparent underline-offset-4 transition-[color,text-decoration-color] duration-300 hover:text-dyeus-bronze hover:decoration-dyeus-bronze";

const menuLinkActiveClassName = "text-dyeus-ink decoration-dyeus-ink hover:decoration-dyeus-bronze";

const fallbackSocialIcons = [
    {name: "Facebook", icon: dyeusAssets.iconFacebook},
    {name: "Instagram", icon: dyeusAssets.iconInstagram},
    {name: "Pinterest", icon: dyeusAssets.iconPinterest},
] as const;

function resolveSocialIcon(name: string): string | undefined {
    const key = name.trim().toLowerCase();
    if (key.includes("facebook") || key === "fb") return dyeusAssets.iconFacebook;
    if (key.includes("instagram") || key === "ig") return dyeusAssets.iconInstagram;
    if (key.includes("pinterest") || key === "pin") return dyeusAssets.iconPinterest;
    return undefined;
}

function DyeusMenu({open, onClose}: DyeusMenuProps) {
    const [visible, setVisible] = useState(false);
    const [langOpen, setLangOpen] = useState(false);
    const langRef = useRef<HTMLDivElement>(null);
    const dimRef = useRef<HTMLDivElement>(null);
    const {pathname} = useLocation();
    const {socialLinks} = useDyeusSocialLinks();
    const {t} = useDyeusT(MENU_LANGUAGE_PATH);
    const dispatch = useDispatch();
    const languageCode = useSelector((state: RootState) => state.language.languageCode);

    useEffect(() => {
        if (!open) {
            setVisible(false);
            setLangOpen(false);
            return;
        }
        const frame = requestAnimationFrame(() => setVisible(true));
        return () => cancelAnimationFrame(frame);
    }, [open]);

    useOutsideClick(langRef, () => setLangOpen(false), {enabled: langOpen});

    if (!open) return null;

    const socialItems =
        socialLinks.length > 0
            ? socialLinks.map((item) => ({
                  name: item.name,
                  link: item.link,
                  icon: item.logo || resolveSocialIcon(item.name),
              }))
            : fallbackSocialIcons.map((item) => ({
                  name: item.name,
                  link: undefined as string | undefined,
                  icon: item.icon,
              }));

    // Radix: focus trap and return, Escape, scroll lock (D23). Escape closes the language list first, then the menu;
    // a click on the dimmed page (not on the language picker) closes the menu.
    return (
        <Dialog open onOpenChange={(next) => !next && onClose()}>
            <DialogFrame
                title={String(t("menuAria"))}
                overlayClassName="fixed inset-0 z-[200]"
                className={`fixed inset-0 z-[200] transition-opacity duration-300 ${visible ? "opacity-100" : "opacity-0"}`}
                onEscapeKeyDown={(event) => {
                    if (!langOpen) return;
                    event.preventDefault();
                    setLangOpen(false);
                }}
                onClick={(event) => {
                    const target = event.target as Node;
                    if (dimRef.current?.contains(target) && !langRef.current?.contains(target)) onClose();
                }}
            >
                <div className="flex h-full w-full flex-col md:flex-row">
                    {/* Cream panel */}
                    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-dyeus-cream px-6 py-6 md:w-[58%] md:flex-none md:px-12 md:py-10 lg:px-16">
                        <Button
                            type="button"
                            variant="bare"
                            className="absolute left-6 top-6 z-20 flex size-10 cursor-pointer items-center justify-center text-dyeus-ink transition-opacity hover:opacity-60 md:left-12 md:top-10 lg:left-16"
                            aria-label={t("close")}
                            onClick={onClose}
                        >
                            <span aria-hidden className="relative block size-5">
                                <span className="absolute left-1/2 top-1/2 h-px w-full -translate-x-1/2 -translate-y-1/2 rotate-45 bg-dyeus-ink" />
                                <span className="absolute left-1/2 top-1/2 h-px w-full -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-dyeus-ink" />
                            </span>
                        </Button>

                        <nav className="flex flex-1 flex-col justify-center gap-5 md:gap-6">
                            {dyeusMenuLinks.map((link) => {
                                const active = pathname === link.path || pathname.startsWith(`${link.path}/`);
                                return (
                                    <Link
                                        key={link.path}
                                        to={link.path}
                                        onClick={onClose}
                                        className={`${menuLinkClassName} ${active ? menuLinkActiveClassName : ""}`}
                                        aria-current={active ? "page" : undefined}
                                    >
                                        {t(link.labelKey)}
                                    </Link>
                                );
                            })}
                        </nav>

                        <div className="relative z-10 flex items-center gap-8 pb-2 md:pb-4">
                            {socialItems.map((item) => {
                                const content = item.icon ? (
                                    <img src={item.icon} alt="" className="size-5 object-contain" />
                                ) : (
                                    <span className="font-dyeus-serif text-sm">{item.name}</span>
                                );

                                if (!item.link) {
                                    return (
                                        <span
                                            key={item.name}
                                            className="inline-flex size-6 items-center justify-center text-dyeus-ink opacity-80"
                                            aria-hidden
                                        >
                                            {content}
                                        </span>
                                    );
                                }

                                return (
                                    <a
                                        key={`${item.name}-${item.link}`}
                                        href={item.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label={item.name}
                                        className="inline-flex size-6 items-center justify-center text-dyeus-ink opacity-80 transition-opacity duration-300 hover:opacity-100"
                                    >
                                        {content}
                                    </a>
                                );
                            })}
                        </div>

                        <img
                            src={dyeusAssets.mandala}
                            alt=""
                            aria-hidden
                            className="pointer-events-none absolute right-0 top-1/2 hidden w-[min(42vw,420px)] -translate-y-1/2 translate-x-[42%] opacity-70 md:block"
                        />
                    </div>

                    {/* Dimmed live page (no static image) */}
                    <div
                        ref={dimRef}
                        className="relative hidden min-h-0 flex-1 overflow-hidden bg-dyeus-ink/55 md:block md:w-[42%] md:flex-none"
                    >
                        <div
                            ref={langRef}
                            className="absolute right-8 top-8 z-10 md:right-12 md:top-10"
                        >
                            <Button
                                type="button"
                                variant="bare"
                                className="relative size-8 cursor-pointer"
                                aria-label={t("language")}
                                aria-haspopup="listbox"
                                aria-expanded={langOpen}
                                onClick={() => setLangOpen((open) => !open)}
                            >
                                <img
                                    src={dyeusAssets.iconLang}
                                    alt=""
                                    className="size-8 object-contain"
                                />
                            </Button>
                            {langOpen ? (
                                <div
                                    role="listbox"
                                    aria-label={t("languageGroup")}
                                    className="absolute right-0 top-[calc(100%+12px)] min-w-[88px] border border-dyeus-border bg-dyeus-cream p-2 text-dyeus-ink shadow-sm"
                                >
                                    {MENU_LANGUAGES.map((language) => {
                                        const active = language.languageCode === languageCode;
                                        return (
                                            <Button
                                                type="button"
                                                variant="bare"
                                                key={language.languageCode}
                                                aria-selected={active}
                                                className={`block w-full cursor-pointer px-3 py-2 text-left font-dyeus-serif text-sm tracking-[0.08em] transition-colors hover:text-dyeus-bronze ${
                                                    active
                                                        ? "font-bold text-dyeus-bronze"
                                                        : "text-dyeus-ink"
                                                }`}
                                                onClick={() => {
                                                    dispatch(pickLanguage(language.languageCode));
                                                    setLangOpen(false);
                                                }}
                                                role="option"
                                            >
                                                {language.shortCode}
                                            </Button>
                                        );
                                    })}
                                </div>
                            ) : null}
                        </div>

                        <p className="pointer-events-none absolute bottom-10 left-8 right-8 z-10 max-w-[320px] font-dyeus-serif text-sm leading-relaxed text-dyeus-cream md:bottom-12 md:left-10 md:right-10 md:text-base">
                            {t("tagline")}
                        </p>
                    </div>
                </div>
            </DialogFrame>
        </Dialog>
    );
}

export default DyeusMenu;
