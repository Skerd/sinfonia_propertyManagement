const PRIVATE_MEDIA_PREFIX = "/api/auxiliary/media/";
const PUBLIC_MEDIA_PREFIX = "/api/auxiliary/public/media/";

/** Normalizes marketing API media paths for use in img src (Vite proxies /api to Maestro). */
export function resolveMarketingMediaUrl(value: string | undefined | null): string | undefined {
    if (!value) {
        return undefined;
    }
    if (value.startsWith(PRIVATE_MEDIA_PREFIX)) {
        return `${PUBLIC_MEDIA_PREFIX}${value.slice(PRIVATE_MEDIA_PREFIX.length)}`;
    }
    if (value.startsWith("http://") || value.startsWith("https://") || value.startsWith("/api/")) {
        return value;
    }
    if (value.startsWith("/")) {
        return value;
    }
    return `${PUBLIC_MEDIA_PREFIX}${value}`;
}
