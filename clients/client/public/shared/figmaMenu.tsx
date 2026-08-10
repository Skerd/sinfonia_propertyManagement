import {useCallback, useEffect, useRef, useState} from "react";
import {createPortal} from "react-dom";
import {Link} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import mainConfig from "@coreModule/assets/languages/mainConfig.json";
import useSelectedLanguage from "@coreModule/helpers/hooks/useSelectedLanguage.ts";
import {changeLanguage} from "@coreModule/helpers/redux/slices/languageSlice.ts";
import {RootState} from "@coreModule/helpers/redux/store/generalStore.ts";
import {figmaAssets} from "@propertyManagementModule/clients/client/public/shared/figmaAssets.ts";
import {figmaImageCropStyle, FIGMA_IMAGE_CROPS} from "@propertyManagementModule/clients/client/public/shared/layout/figmaDimensions.ts";
import {PUBLIC_HEADING} from "@propertyManagementModule/clients/client/public/shared/layout/publicLayoutTokens.ts";
import {figmaMenuLinks} from "@propertyManagementModule/clients/client/public/shared/figmaRouteMap.ts";
import {usePublicIsMobile} from "@propertyManagementModule/clients/client/public/shared/hooks/usePublicIsMobile.ts";

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

const VIEWPORT_MARGIN = 8;

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
    const panelWidth = Math.min(512, window.innerWidth - VIEWPORT_MARGIN * 2);
    const panelHeight = Math.min(480, window.innerHeight - VIEWPORT_MARGIN * 2);
    let top = anchorRect.top - 24;
    let left = anchorRect.left - Math.min(458, panelWidth * 0.85);

    if (top + panelHeight > window.innerHeight - VIEWPORT_MARGIN) {
        top = window.innerHeight - panelHeight - VIEWPORT_MARGIN;
    }
    if (left + panelWidth > window.innerWidth - VIEWPORT_MARGIN) {
        left = window.innerWidth - panelWidth - VIEWPORT_MARGIN;
    }
    if (left < VIEWPORT_MARGIN) {
        left = VIEWPORT_MARGIN;
    }

    return {top, left, panelWidth, panelHeight};
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
        <div className={className ?? "flex items-center gap-4"} role="group" aria-label={t("languageGroup")}>
            {MENU_LANGUAGES.map((language) => {
                const isActive = language.languageCode === languageCode;
                return (
                    <button
                        key={language.languageCode}
                        type="button"
                        aria-pressed={isActive}
                        aria-label={language.name}
                        onClick={() => dispatch(changeLanguage(language.languageCode))}
                        className={`cursor-pointer text-xl text-white not-italic transition-opacity duration-200 hover:opacity-70 ${
                            isActive ? "font-aeonik-medium" : "font-aeonik-light opacity-70"
                        }`}
                    >
                        {language.shortCode}
                    </button>
                );
            })}
        </div>
    );
}

function MenuOverlay({anchorRect, onClose}: {anchorRect: AnchorRect; onClose: () => void}) {
    const t = useFigmaMenuT();
    const [controlsHovered, setControlsHovered] = useState(false);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const frame = requestAnimationFrame(() => setVisible(true));
        return () => cancelAnimationFrame(frame);
    }, []);

    const panelPosition = getPanelPosition(anchorRect);

    return (
        <div
            className="fixed inset-0 z-[200]"
            role="dialog"
            aria-modal="true"
            aria-label={t("navMenu")}
            onClick={onClose}
        >
            <div
                className="fixed overflow-hidden rounded-[5px] backdrop-blur-[17px] transition-[opacity,transform] duration-200 ease-out"
                data-node-id="41:150"
                data-name="Menu"
                style={{
                    top: panelPosition.top,
                    left: panelPosition.left,
                    width: panelPosition.panelWidth,
                    height: panelPosition.panelHeight,
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    background: "rgba(2, 71, 254, 0.6)",
                    opacity: visible ? 1 : 0,
                    transform: visible ? "scale(1)" : "scale(0.98)",
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div
                    className="absolute right-6 top-6 flex items-center gap-3"
                    onMouseEnter={() => setControlsHovered(true)}
                    onMouseLeave={() => setControlsHovered(false)}
                >
                    <MenuMoonIcon variant="hero" hovered={controlsHovered} />
                    <button type="button" onClick={onClose} className="cursor-pointer" aria-label={t("closeMenu")}>
                        <MenuGridIcon variant="hero" hovered />
                    </button>
                </div>

                <nav className="absolute left-11 top-[92px] flex flex-col gap-6">
                    {figmaMenuLinks.map((link) => (
                        <Link
                            key={link.path}
                            to={link.path}
                            onClick={onClose}
                            className={`${PUBLIC_HEADING} !cursor-pointer leading-none text-white transition-colors duration-200 hover:text-white/30`}
                        >
                            {t(FIGMA_MENU_LINK_KEYS[link.path] ?? link.path)}
                        </Link>
                    ))}
                </nav>

                <MenuLanguageButtons className="absolute left-11 top-[418px] flex items-center gap-4" />
            </div>
        </div>
    );
}

function MobileNavDrawer({open, onClose}: {open: boolean; onClose: () => void}) {
    const t = useFigmaMenuT();

    if (!open) {
        return null;
    }

    return createPortal(
        <div className="fixed inset-0 z-[200] md:hidden" role="dialog" aria-modal="true" aria-label={t("navMenu")}>
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />
            <div className="absolute inset-y-0 right-0 flex w-[min(100vw,320px)] flex-col gap-6 bg-pronix-blue p-6 text-white">
                <button
                    type="button"
                    className="self-end font-aeonik-medium text-lg"
                    onClick={onClose}
                    aria-label={t("closeMenu")}
                >
                    {t("close")}
                </button>
                <nav className="flex flex-col gap-4">
                    {figmaMenuLinks.map((link) => (
                        <Link key={link.path} to={link.path} onClick={onClose} className="font-aeonik-medium text-2xl">
                            {t(FIGMA_MENU_LINK_KEYS[link.path] ?? link.path)}
                        </Link>
                    ))}
                </nav>
                <MenuLanguageButtons className="mt-auto flex flex-wrap items-center gap-4" />
            </div>
        </div>,
        document.body,
    );
}

function FigmaMenu({variant = "hero", className}: FigmaMenuProps) {
    const t = useFigmaMenuT();
    const isMobile = usePublicIsMobile();
    const [open, setOpen] = useState(false);
    const [anchorRect, setAnchorRect] = useState<AnchorRect | null>(null);
    const [controlsHovered, setControlsHovered] = useState(false);
    const gridTriggerRef = useRef<HTMLButtonElement>(null);

    const handleOpen = () => {
        if (isMobile) {
            setOpen(true);
            return;
        }
        const rect = gridTriggerRef.current?.getBoundingClientRect();
        if (!rect) {
            return;
        }
        setAnchorRect({top: rect.top, left: rect.left});
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setAnchorRect(null);
    };

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
                <div
                    className={`group/menucontrols flex shrink-0 items-center gap-3 ${open && !isMobile ? "invisible" : ""}`}
                    onMouseEnter={() => setControlsHovered(true)}
                    onMouseLeave={() => setControlsHovered(false)}
                >
                    <MenuMoonIcon variant={variant} hovered={controlsHovered} />
                    <button
                        ref={gridTriggerRef}
                        type="button"
                        className="cursor-pointer"
                        aria-label={t("openMenu")}
                        aria-expanded={open}
                        onClick={handleOpen}
                    >
                        <MenuGridIcon variant={variant} hovered={controlsHovered} />
                    </button>
                </div>
            </div>
            {isMobile ? (
                <MobileNavDrawer open={open} onClose={handleClose} />
            ) : (
                open && anchorRect && createPortal(<MenuOverlay anchorRect={anchorRect} onClose={handleClose} />, document.body)
            )}
        </>
    );
}

export default FigmaMenu;
