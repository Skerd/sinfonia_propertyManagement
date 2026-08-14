import {useCallback, useEffect, useRef, useState, type ReactElement} from "react";
import {createPortal} from "react-dom";
import {Link} from "react-router-dom";
import {compose} from "redux";
import {useDispatch, useSelector} from "react-redux";
import {Facebook, Instagram, Linkedin} from "lucide-react";
import mainConfig from "@coreModule/assets/languages/mainConfig.json";
import useSelectedLanguage from "@coreModule/helpers/hooks/useSelectedLanguage.ts";
import {changeLanguage} from "@coreModule/helpers/redux/slices/languageSlice.ts";
import {RootState} from "@coreModule/helpers/redux/store/generalStore.ts";
import {figmaAssets} from "@propertyManagementModule/clients/client/public/shared/figmaAssets.ts";
import {figmaImageCropStyle, FIGMA_IMAGE_CROPS} from "@propertyManagementModule/clients/client/public/shared/layout/figmaDimensions.ts";
import {lockPublicBodyScroll} from "@propertyManagementModule/clients/client/public/shared/lockPublicBodyScroll.ts";
import {figmaMenuLinks} from "@propertyManagementModule/clients/client/public/shared/figmaRouteMap.ts";
import type {MarketingCompanyResponse} from "@propertyManagementModule/clients/client/public/shared/publicTypes.ts";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";

type SupportedMenuLanguage = {
    languageCode: string;
    name: string;
    shortCode: string;
};

const MENU_LANGUAGES = mainConfig.supportedLanguages as SupportedMenuLanguage[];

const FIGMA_MENU_LANGUAGE_PATH =
    "src/modules/propertyManagement/clients/client/public/shared/figmaMenu.tsx";

const FIGMA_MENU_LINK_KEYS: Record<string, string> = {
    "/projects": "navProperties",
    "/about": "navAbout",
    "/investors": "navInvestors",
    "/developers": "navDevelopers",
    "/contact": "navContact",
};

type FigmaMenuProps = {
    variant?: "hero" | "light";
    className?: string;
};

type AnchorRect = {
    top: number;
    left: number;
};

type ControlsRect = {
    top: number;
    left: number;
    width: number;
    height: number;
};

const VIEWPORT_MARGIN = 8;
const MENU_PANEL_WIDTH = 440;

let publicMenuOpen = false;
let ignoreHeroNavigateUntil = 0;
const publicMenuOpenListeners = new Set<(open: boolean) => void>();

function setPublicMenuOpen(open: boolean) {
    publicMenuOpen = open;
    if (!open) {
        ignoreHeroNavigateUntil = Date.now() + 400;
    }
    publicMenuOpenListeners.forEach((listener) => listener(open));
}

export function shouldIgnoreHeroNavigate() {
    return publicMenuOpen || Date.now() < ignoreHeroNavigateUntil;
}

export function usePublicMenuOpen() {
    const [open, setOpen] = useState(publicMenuOpen);

    useEffect(() => {
        publicMenuOpenListeners.add(setOpen);
        return () => {
            publicMenuOpenListeners.delete(setOpen);
        };
    }, []);

    return open;
}
const MENU_NAV_LINK_CLASS =
    "cursor-pointer font-aeonik-medium text-[32px] font-medium leading-none text-white not-italic transition-colors duration-200 hover:text-white/30";

const MENU_SOCIAL_LINKS = [
    {id: "instagram" as const, labelKey: "socialInstagram", Icon: Instagram},
    {id: "facebook" as const, labelKey: "socialFacebook", Icon: Facebook},
    {id: "linkedin" as const, labelKey: "socialLinkedin", Icon: Linkedin},
];

/** Loads figmaMenu locale JSON for the active language (works inside portals). */
function useFigmaMenuT() {
    const {currentLanguage} = useSelectedLanguage(
        FIGMA_MENU_LANGUAGE_PATH.replaceAll("/", "_"),
        FIGMA_MENU_LANGUAGE_PATH,
    );

    return useCallback(
        (key: string) => {
            if (!currentLanguage || typeof currentLanguage !== "object") {
                return `---${key}---`;
            }
            const value = (currentLanguage as Record<string, unknown>)[key];
            return typeof value === "string" ? value : `---${key}---`;
        },
        [currentLanguage],
    );
}

function getPanelPosition(anchorRect: AnchorRect) {
    const panelWidth = Math.min(MENU_PANEL_WIDTH, window.innerWidth - VIEWPORT_MARGIN * 2);
    const maxHeight = window.innerHeight - VIEWPORT_MARGIN * 2;
    let top = anchorRect.top - 24;
    let left = anchorRect.left - (panelWidth - 52);

    if (top < VIEWPORT_MARGIN) {
        top = VIEWPORT_MARGIN;
    }
    if (left + panelWidth > window.innerWidth - VIEWPORT_MARGIN) {
        left = window.innerWidth - panelWidth - VIEWPORT_MARGIN;
    }
    if (left < VIEWPORT_MARGIN) {
        left = VIEWPORT_MARGIN;
    }

    return {top, left, panelWidth, maxHeight};
}

function MenuMoonIcon({variant, hovered}: {variant: "hero" | "light"; hovered: boolean}) {
    const toneClass = variant === "light" ? "brightness-0" : "";
    return (
        <div className="relative size-4 shrink-0" data-name="Component 1">
            <img
                alt=""
                aria-hidden
                className={`absolute inset-0 block size-full transition-opacity duration-200 ${toneClass} ${hovered ? "opacity-0" : "opacity-100"}`}
                src={figmaAssets.menuDot}
            />
            <img
                alt=""
                aria-hidden
                className={`absolute inset-0 block size-full transition-opacity duration-200 ${toneClass} ${hovered ? "opacity-100" : "opacity-0"}`}
                src={figmaAssets.menuDotHalf}
            />
        </div>
    );
}

function MenuGridIcon({variant, hovered}: {variant: "hero" | "light"; hovered: boolean}) {
    const toneClass = variant === "light" ? "brightness-0" : "";
    return (
        <div className="flex w-[30px] flex-col gap-1.5" data-node-id={hovered ? "37:102" : "37:103"}>
            {[0, 1, 2].map((row) => (
                <div key={row} className="flex w-full items-center gap-1.5">
                    {[0, 1, 2].map((col) => {
                        const isDim = hovered && (row + col) % 2 === 1;
                        return (
                            <div key={col} className="relative size-1.5 shrink-0">
                                <img
                                    alt=""
                                    aria-hidden
                                    className={`absolute inset-0 block size-full max-w-none transition-opacity duration-200 ${toneClass} ${isDim ? "opacity-40" : "opacity-100"}`}
                                    src={figmaAssets.menuGridDot}
                                />
                            </div>
                        );
                    })}
                </div>
            ))}
        </div>
    );
}

function MenuLanguageButtons({className}: {className?: string}) {
    const t = useFigmaMenuT();
    const dispatch = useDispatch();
    const languageCode = useSelector((state: RootState) => state.language.languageCode);

    return (
        <div className={className ?? "flex items-center"} role="group" aria-label={t("languageGroup")}>
            {MENU_LANGUAGES.map((language, index) => {
                const isActive = language.languageCode === languageCode;
                return (
                    <span key={language.languageCode} className="flex items-center">
                        {index > 0 && (
                            <span className="mx-2.5 h-3.5 w-px shrink-0 bg-white/40" aria-hidden />
                        )}
                        <button
                            type="button"
                            aria-pressed={isActive}
                            aria-label={language.name}
                            onClick={() => dispatch(changeLanguage(language.languageCode))}
                            className={`cursor-pointer text-base text-white not-italic transition-opacity duration-200 hover:opacity-70 ${
                                isActive ? "font-aeonik-medium" : "font-aeonik-light opacity-70"
                            }`}
                        >
                            {language.shortCode}
                        </button>
                    </span>
                );
            })}
        </div>
    );
}

function MenuSocialLinksInner({data, onFilterChange}: WithAxiosType<MarketingCompanyResponse>) {
    const t = useFigmaMenuT();
    const initialFetchDone = useRef(false);

    useEffect(() => {
        if (initialFetchDone.current) {
            return;
        }
        initialFetchDone.current = true;
        onFilterChange({});
    }, []);

    const items = MENU_SOCIAL_LINKS.flatMap(({id, labelKey, Icon}) => {
        const href = data?.[id];
        if (!href) {
            return [];
        }
        return [{id, href, labelKey, Icon}];
    });

    if (items.length === 0) {
        return null;
    }

    return (
        <div className="flex items-center gap-4" aria-label={t("socialGroup")}>
            {items.map(({id, href, labelKey, Icon}) => (
                <a
                    key={id}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={t(labelKey)}
                    className="flex size-6 items-center justify-center text-white transition-colors duration-200 hover:text-white/30"
                >
                    <Icon className="size-5" strokeWidth={1.6} />
                </a>
            ))}
        </div>
    );
}

const MenuSocialLinks = compose(
    withAxios<MarketingCompanyResponse>(
        {method: "post", url: "/api/realEstate/marketingCompany", data: {}},
        true,
    ),
)(MenuSocialLinksInner) as unknown as () => ReactElement | null;

function MenuChromeRow({className}: {className?: string}) {
    return (
        <div className={className ?? "flex items-center justify-between gap-6"}>
            <MenuLanguageButtons />
            <MenuSocialLinks />
        </div>
    );
}

function MenuOverlay({anchorRect, onClose}: {anchorRect: AnchorRect; onClose: () => void}) {
    const t = useFigmaMenuT();
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const frame = requestAnimationFrame(() => setVisible(true));
        return () => cancelAnimationFrame(frame);
    }, []);

    const panelPosition = getPanelPosition(anchorRect);

    return (
        <div
            className="fixed inset-0 z-[200] cursor-default"
            role="dialog"
            aria-modal="true"
            aria-label={t("navMenu")}
            onPointerDown={(event) => event.preventDefault()}
            onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onClose();
            }}
            onWheel={(event) => event.preventDefault()}
        >
            <div
                className="absolute inset-0 bg-black/50 transition-opacity duration-200 ease-out"
                style={{opacity: visible ? 1 : 0}}
            />
            <div
                className="pointer-events-auto fixed overflow-hidden rounded-[5px] backdrop-blur-[17px] transition-opacity duration-200 ease-out"
                data-node-id="41:150"
                data-name="Menu"
                data-figma-menu-panel
                style={{
                    top: panelPosition.top,
                    left: panelPosition.left,
                    width: panelPosition.panelWidth,
                    maxHeight: panelPosition.maxHeight,
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    background: "rgba(2, 71, 254, 0.6)",
                    opacity: visible ? 1 : 0
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex flex-col pb-10 pl-11 pr-14 pt-18">
                    <nav className="flex flex-col gap-8">
                        {figmaMenuLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                onClick={onClose}
                                className={MENU_NAV_LINK_CLASS}
                            >
                                {t(FIGMA_MENU_LINK_KEYS[link.path] ?? link.path)}
                            </Link>
                        ))}
                    </nav>

                    <div className="mt-8 h-px w-full bg-white/40" aria-hidden />
                    <MenuChromeRow className="mt-6 flex items-center justify-between gap-4" />
                </div>
            </div>
        </div>
    );
}

function FigmaMenu({variant = "hero", className}: FigmaMenuProps) {
    const t = useFigmaMenuT();
    const [open, setOpen] = useState(false);
    const [anchorRect, setAnchorRect] = useState<AnchorRect | null>(null);
    const [controlsRect, setControlsRect] = useState<ControlsRect | null>(null);
    const [controlsHovered, setControlsHovered] = useState(false);
    const gridTriggerRef = useRef<HTMLButtonElement>(null);
    const controlsRef = useRef<HTMLDivElement>(null);

    const handleOpen = () => {
        if (open) {
            handleClose();
            return;
        }
        const gridRect = gridTriggerRef.current?.getBoundingClientRect();
        const groupRect = controlsRef.current?.getBoundingClientRect();
        if (!gridRect || !groupRect) {
            return;
        }
        setAnchorRect({top: gridRect.top, left: gridRect.left});
        setControlsRect({
            top: groupRect.top,
            left: groupRect.left,
            width: groupRect.width,
            height: groupRect.height,
        });
        setControlsHovered(true);
        setPublicMenuOpen(true);
        setOpen(true);
    };

    const handleClose = () => {
        setPublicMenuOpen(false);
        setOpen(false);
        setAnchorRect(null);
        setControlsRect(null);
    };

    useEffect(() => {
        setPublicMenuOpen(open);
        if (!open) {
            return;
        }
        const unlock = lockPublicBodyScroll();
        const preventScroll = (event: Event) => {
            event.preventDefault();
        };
        window.addEventListener("wheel", preventScroll, {passive: false});
        window.addEventListener("touchmove", preventScroll, {passive: false});
        return () => {
            setPublicMenuOpen(false);
            unlock();
            window.removeEventListener("wheel", preventScroll);
            window.removeEventListener("touchmove", preventScroll);
        };
    }, [open]);

    const menuControls = (
        <div
            ref={controlsRef}
            className="flex shrink-0 items-center gap-3"
            onMouseEnter={() => setControlsHovered(true)}
            onMouseLeave={() => setControlsHovered(false)}
        >
            <MenuMoonIcon variant={variant} hovered={controlsHovered} />
            <button
                ref={gridTriggerRef}
                type="button"
                className="cursor-pointer"
                aria-label={open ? t("closeMenu") : t("openMenu")}
                aria-expanded={open}
                onClick={handleOpen}
            >
                <MenuGridIcon variant={variant} hovered={controlsHovered} />
            </button>
        </div>
    );

    return (
        <>
            <div className={`flex w-full items-center justify-between ${className ?? ""}`} data-node-id="35:139" data-name="Menu">
                <Link to="/" className="relative block h-8 w-[160px] shrink-0 overflow-hidden md:h-10 md:w-[213px]" data-name="Logo">
                    <img
                        alt="Pronix"
                        className={`absolute max-w-none ${variant === "light" ? "brightness-0" : ""}`}
                        src={figmaAssets.heroLogo}
                        style={figmaImageCropStyle(FIGMA_IMAGE_CROPS.menuLogo)}
                    />
                </Link>
                <div className={open ? "invisible" : undefined}>
                    {menuControls}
                </div>
            </div>
            {open && controlsRect && createPortal(
                <div
                    className="fixed z-[210] flex items-center gap-3"
                    data-figma-menu-controls
                    style={{
                        top: controlsRect.top,
                        left: controlsRect.left,
                        width: controlsRect.width,
                        height: controlsRect.height,
                    }}
                    onMouseEnter={() => setControlsHovered(true)}
                    onMouseLeave={() => setControlsHovered(false)}
                    onClick={(event) => event.stopPropagation()}
                    onPointerDown={(event) => event.stopPropagation()}
                >
                    <MenuMoonIcon variant={variant} hovered={controlsHovered} />
                    <button
                        type="button"
                        className="cursor-pointer"
                        aria-label={t("closeMenu")}
                        aria-expanded
                        onClick={handleClose}
                    >
                        <MenuGridIcon variant={variant} hovered={controlsHovered} />
                    </button>
                </div>,
                document.body,
            )}
            {open && anchorRect && createPortal(<MenuOverlay anchorRect={anchorRect} onClose={handleClose} />, document.body)}
        </>
    );
}

export default FigmaMenu;
