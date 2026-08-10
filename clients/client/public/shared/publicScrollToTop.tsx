import {useEffect} from "react";
import {useLocation} from "react-router-dom";

/** Resets window scroll when navigating between public routes (pathname only; query changes keep scroll). */
function PublicScrollToTop() {
    const {pathname} = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
    }, [pathname]);

    return null;
}

export default PublicScrollToTop;
