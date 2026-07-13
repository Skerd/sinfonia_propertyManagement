/** Normalizes marketing API media paths for use in img src (Vite proxies /api to Maestro). */
export function resolveMarketingMediaUrl(value: string | undefined | null): string | undefined {
    if (!value) {
        return undefined;
    }
    if (value.startsWith("http://") || value.startsWith("https://") || value.startsWith("/api/")) {
        return value;
    }
    if (value.startsWith("/")) {
        return value;
    }
    return `/api/auxiliary/media/${value}`;
}
