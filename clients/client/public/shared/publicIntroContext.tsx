import {createContext, useCallback, useContext, useMemo, useState, type CSSProperties, type ReactNode} from "react";

/** Intro splash + first-paint chrome timing (ms). */
export const PUBLIC_INTRO = {
    lightMs: 900,
    holdAfterLitMs: 400,
    splashExitMs: 700,
    /** Pause after the splash is gone, before menu / title / orb fade in. */
    chromeHoldMs: 200,
    chromeFadeMs: 500,
} as const;

type PublicIntroContextValue = {
    chromeRevealed: boolean;
    revealChromeAfterSplash: () => void;
};

const PublicIntroContext = createContext<PublicIntroContextValue | null>(null);

export function PublicIntroProvider({children}: {children: ReactNode}) {
    const [chromeRevealed, setChromeRevealed] = useState(false);

    const revealChromeAfterSplash = useCallback(() => {
        window.setTimeout(() => {
            setChromeRevealed(true);
        }, PUBLIC_INTRO.chromeHoldMs);
    }, []);

    const value = useMemo(
        () => ({chromeRevealed, revealChromeAfterSplash}),
        [chromeRevealed, revealChromeAfterSplash],
    );

    return <PublicIntroContext.Provider value={value}>{children}</PublicIntroContext.Provider>;
}

export function usePublicIntroChrome() {
    const context = useContext(PublicIntroContext);
    return {
        chromeRevealed: context?.chromeRevealed ?? true,
        revealChromeAfterSplash: context?.revealChromeAfterSplash ?? (() => undefined),
        chromeFadeMs: PUBLIC_INTRO.chromeFadeMs,
    };
}

export function publicIntroChromeStyle(revealed: boolean): CSSProperties {
    return {
        opacity: revealed ? 1 : 0,
        transition: `opacity ${PUBLIC_INTRO.chromeFadeMs}ms ease-out`,
        pointerEvents: revealed ? "auto" : "none",
    };
}
