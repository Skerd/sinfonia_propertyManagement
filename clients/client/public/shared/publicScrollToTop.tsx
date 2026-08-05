import {useEffect} from "react";
import {useLocation} from "react-router-dom";

/** Resets window scroll when navigating between public routes (incl. query changes). */
function PublicScrollToTop() {
    const {pathname, search} = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
    }, [pathname, search]);

    return null;
}

export default PublicScrollToTop;
