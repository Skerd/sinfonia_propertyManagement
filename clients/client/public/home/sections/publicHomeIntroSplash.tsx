import {useEffect, useState} from "react";
import {createPortal} from "react-dom";
import {figmaAssets} from "@propertyManagementModule/clients/client/public/shared/figmaAssets.ts";
import {lockPublicBodyScroll} from "@propertyManagementModule/clients/client/public/shared/lockPublicBodyScroll.ts";
import {PUBLIC_INTRO, usePublicIntroChrome} from "@propertyManagementModule/clients/client/public/shared/publicIntroContext.tsx";

const LIGHT_MS = PUBLIC_INTRO.lightMs;
const HOLD_AFTER_LIT_MS = PUBLIC_INTRO.holdAfterLitMs;
const EXIT_MS = PUBLIC_INTRO.splashExitMs;

/** Native hero-logo.png size and the >PRONIX glyph box. */
const LOGO_NATIVE = {width: 4096, height: 1335};
const LOGO_GLYPH = {left: 514, top: 458, width: 3068, height: 419};

function PronixLogoMark() {
    const widthScale = LOGO_NATIVE.width / LOGO_GLYPH.width;
    const heightScale = LOGO_NATIVE.height / LOGO_GLYPH.height;

    return (
        <div
            style={{
                position: "relative",
                width: "min(78vw, 56rem)",
                aspectRatio: `${LOGO_GLYPH.width} / ${LOGO_GLYPH.height}`,
                overflow: "hidden",
            }}
        >
            <img
                alt="Pronix"
                src={figmaAssets.heroLogo}
                style={{
                    position: "absolute",
                    maxWidth: "none",
                    width: `${widthScale * 100}%`,
                    height: `${heightScale * 100}%`,
                    left: `${(-LOGO_GLYPH.left / LOGO_GLYPH.width) * 100}%`,
                    top: `${(-LOGO_GLYPH.top / LOGO_GLYPH.height) * 100}%`,
                }}
            />
        </div>
    );
}

function PublicHomeIntroSplash() {
    const [visible, setVisible] = useState(true);
    const [exiting, setExiting] = useState(false);
    const {revealChromeAfterSplash} = usePublicIntroChrome();

    useEffect(() => {
        const unlock = lockPublicBodyScroll();
        let released = false;
        const release = () => {
            if (released) {
                return;
            }
            released = true;
            unlock();
        };
        const timeouts: number[] = [];

        timeouts.push(
            window.setTimeout(() => {
                setExiting(true);
                release();
                timeouts.push(
                    window.setTimeout(() => {
                        setVisible(false);
                        revealChromeAfterSplash();
                    }, EXIT_MS),
                );
            }, LIGHT_MS + HOLD_AFTER_LIT_MS),
        );

        return () => {
            release();
            timeouts.forEach((id) => window.clearTimeout(id));
        };
    }, [revealChromeAfterSplash]);

    if (!visible) {
        return null;
    }

    return createPortal(
        <div
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 2147483000,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#0247fe",
                opacity: exiting ? 0 : 1,
                transition: `opacity ${EXIT_MS}ms ease-out`,
                pointerEvents: exiting ? "none" : "auto",
            }}
            role="status"
            aria-live="polite"
            aria-label="Pronix"
        >
            <style>
                {`
                    @keyframes public-intro-reveal {
                        from { width: 0; }
                        to { width: 100%; }
                    }
                `}
            </style>
            <div style={{position: "relative", display: "inline-block"}}>
                <div style={{opacity: 0.18}}>
                    <PronixLogoMark />
                </div>
                <div
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        bottom: 0,
                        overflow: "hidden",
                        animation: `public-intro-reveal ${LIGHT_MS}ms linear forwards`,
                    }}
                >
                    <PronixLogoMark />
                </div>
            </div>
        </div>,
        document.body,
    );
}

export default PublicHomeIntroSplash;
