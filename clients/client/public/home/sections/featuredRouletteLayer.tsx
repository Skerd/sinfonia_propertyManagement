import {useEffect, useState} from "react";
import {PUBLIC_LAYER_CAROUSEL} from "@propertyManagementModule/clients/client/public/shared/layout/publicLayoutTokens.ts";

const LAYER_ID = "featured-roulette-layer";

function ensureFeaturedRouletteLayerRoot(): HTMLElement | null {
    if (typeof document === "undefined") {
        return null;
    }

    let root = document.getElementById(LAYER_ID);
    if (!root) {
        root = document.createElement("div");
        root.id = LAYER_ID;
        root.setAttribute("data-name", "Featured roulette layer");
        root.style.position = "fixed";
        root.style.inset = "0";
        root.style.pointerEvents = "none";
        root.style.overflow = "clip";
        root.style.contain = "layout paint style";
        root.style.isolation = "isolate";
        root.style.zIndex = String(PUBLIC_LAYER_CAROUSEL);
        document.body.appendChild(root);
    }

    return root;
}

export function useFeaturedRouletteLayerRoot(): HTMLElement | null {
    const [root, setRoot] = useState<HTMLElement | null>(null);

    useEffect(() => {
        setRoot(ensureFeaturedRouletteLayerRoot());
    }, []);

    return root;
}
