/** Prevents layout twitch when modals hide the body scrollbar. */
let lockCount = 0;
let previousOverflow = "";
let previousPaddingRight = "";

export function lockPublicBodyScroll() {
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    if (lockCount === 0) {
        previousOverflow = document.body.style.overflow;
        previousPaddingRight = document.body.style.paddingRight;
        document.body.style.overflow = "hidden";
        if (scrollbarWidth > 0) {
            const currentPadding = Number.parseFloat(getComputedStyle(document.body).paddingRight) || 0;
            document.body.style.paddingRight = `${currentPadding + scrollbarWidth}px`;
        }
    }

    lockCount += 1;

    return () => {
        lockCount = Math.max(0, lockCount - 1);
        if (lockCount === 0) {
            document.body.style.overflow = previousOverflow;
            document.body.style.paddingRight = previousPaddingRight;
        }
    };
}
