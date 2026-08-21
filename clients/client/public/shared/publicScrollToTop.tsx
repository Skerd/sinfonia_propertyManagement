import {useEffect} from "react";
import {useLocation} from "react-router-dom";

/** Resets window scroll on pathname change. Hash targets (e.g. /investors#tokenization) are scrolled into view after the lazy page mounts. */
function PublicScrollToTop() {
    const {pathname, hash} = useLocation();

    useEffect(() => {
        if (!hash) {
            window.scrollTo(0, 0);
            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;
            return;
        }

        const id = decodeURIComponent(hash.replace(/^#/, ""));
        let cancelled = false;
        let attempts = 0;
        const maxAttempts = 20;

        const tryScroll = () => {
            if (cancelled) return;
            const el = document.getElementById(id);
            if (el) {
                el.scrollIntoView({behavior: "smooth", block: "start"});
                return;
            }
            attempts += 1;
            if (attempts < maxAttempts) {
                window.setTimeout(tryScroll, 50);
            }
        };

        tryScroll();
        return () => {
            cancelled = true;
        };
    }, [pathname, hash]);

    return null;
}

export default PublicScrollToTop;
