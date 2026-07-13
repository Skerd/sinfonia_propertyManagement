import {useCallback, useEffect, useRef, useState, type MouseEvent} from "react";
import {createPortal} from "react-dom";
import {useNavigate} from "react-router-dom";
import {figmaAssets} from "@propertyManagementModule/clients/client/public/shared/figmaAssets.ts";
import FigmaMenu from "@propertyManagementModule/clients/client/public/shared/figmaMenu.tsx";
import {usePublicIsMobile} from "@propertyManagementModule/clients/client/public/shared/hooks/usePublicIsMobile.ts";

const CURSOR_SIZE = 239;
const CURSOR_RADIUS = CURSOR_SIZE / 2;

type CursorPosition = {
    x: number;
    y: number;
};

function ViewPropertiesCursor({position}: {position: CursorPosition}) {
    return (
        <div
            className="pointer-events-none fixed z-[50] flex size-[15rem] items-center justify-center rounded-full backdrop-blur-[17px] transition-opacity duration-200"
            data-node-id="49:33"
            style={{
                left: position.x - CURSOR_RADIUS,
                top: position.y - CURSOR_RADIUS,
                background: "rgba(255, 255, 255, 0.15)",
            }}
            aria-hidden
        >
            <p
                className="font-aeonik-light text-xl not-italic leading-tight text-white uppercase whitespace-pre"
                data-node-id="49:34"
            >
                {`View  properties`}
            </p>
        </div>
    );
}

function HeroSection() {
    const navigate = useNavigate();
    const isMobile = usePublicIsMobile();
    const heroRef = useRef<HTMLDivElement>(null);
    const [heroInView, setHeroInView] = useState(false);
    const [cursorPos, setCursorPos] = useState<CursorPosition | null>(null);
    const [cursorOverMenu, setCursorOverMenu] = useState(false);

    useEffect(() => {
        const element = heroRef.current;
        if (!element) {
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                setHeroInView(entry.isIntersecting);
                if (!entry.isIntersecting) {
                    setCursorPos(null);
                    setCursorOverMenu(false);
                }
            },
            {threshold: 0.01},
        );

        observer.observe(element);
        return () => observer.disconnect();
    }, []);

    const isMenuTarget = useCallback((target: EventTarget | null) => {
        return target instanceof Element && Boolean(target.closest('[data-name="Menu"]'));
    }, []);

    const handleMouseMove = useCallback(
        (event: MouseEvent<HTMLDivElement>) => {
            if (!heroInView || isMobile) {
                return;
            }

            if (isMenuTarget(event.target)) {
                setCursorOverMenu(true);
                setCursorPos(null);
                return;
            }

            setCursorOverMenu(false);
            setCursorPos({x: event.clientX, y: event.clientY});
        },
        [heroInView, isMenuTarget, isMobile],
    );

    const handleMouseLeave = useCallback(() => {
        setCursorPos(null);
        setCursorOverMenu(false);
    }, []);

    const handleClick = useCallback(
        (event: MouseEvent<HTMLDivElement>) => {
            if (isMenuTarget(event.target)) {
                return;
            }
            navigate("/projects");
        },
        [isMenuTarget, navigate],
    );

    const showCustomCursor = !isMobile && heroInView && cursorPos !== null && !cursorOverMenu;

    return (
        <>
            {showCustomCursor && createPortal(<ViewPropertiesCursor position={cursorPos} />, document.body)}
            <div
                ref={heroRef}
                className={`relative min-h-[100svh] min-w-0 w-full overflow-hidden ${showCustomCursor ? "cursor-none" : ""}`}
                data-node-id="18:67"
                data-name="Hero"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                onClick={handleClick}
            >
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    aria-hidden
                    className="pointer-events-none absolute inset-0 h-full w-full object-cover"
                    src={figmaAssets.heroVideo}
                    data-node-id="78:1914"
                    data-name="BG video 1"
                />

                <div className="relative z-10 flex min-h-[100svh] w-full min-w-0 flex-col px-4 sm:px-6 lg:px-[52px]">
                    <div className="pt-8 sm:pt-10 lg:pt-[45px]" data-node-id="35:139" data-name="Menu">
                        <FigmaMenu variant="hero" />
                    </div>

                    <p
                        className="mt-auto max-w-4xl pb-10 font-aeonik-medium text-3xl leading-none text-white not-italic sm:pb-12 sm:text-4xl md:text-5xl lg:max-w-5xl lg:pb-16 lg:text-[64px]"
                        data-node-id="37:133"
                    >
                        Real estate, reimagined without the complexity, commitment, or compromise.
                    </p>
                </div>
            </div>
        </>
    );
}

export default HeroSection;
