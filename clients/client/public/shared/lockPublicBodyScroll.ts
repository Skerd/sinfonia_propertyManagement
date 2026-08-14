/** Prevents layout twitch when modals hide the body scrollbar. */
let lockCount = 0;
let previousBodyOverflow = "";
let previousHtmlOverflow = "";
let previousPaddingRight = "";
let previousOverscroll = "";

export function lockPublicBodyScroll() {
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    const html = document.documentElement;

    if (lockCount === 0) {
        previousBodyOverflow = document.body.style.overflow;
        previousHtmlOverflow = html.style.overflow;
        previousPaddingRight = document.body.style.paddingRight;
        previousOverscroll = html.style.overscrollBehavior;
        document.body.style.overflow = "hidden";
        html.style.overflow = "hidden";
        html.style.overscrollBehavior = "none";
        if (scrollbarWidth > 0) {
            const currentPadding = Number.parseFloat(getComputedStyle(document.body).paddingRight) || 0;
            document.body.style.paddingRight = `${currentPadding + scrollbarWidth}px`;
        }
    }

    lockCount += 1;

    return () => {
        lockCount = Math.max(0, lockCount - 1);
        if (lockCount === 0) {
            document.body.style.overflow = previousBodyOverflow;
            document.body.style.paddingRight = previousPaddingRight;
            html.style.overflow = previousHtmlOverflow;
            html.style.overscrollBehavior = previousOverscroll;
        }
    };
}
