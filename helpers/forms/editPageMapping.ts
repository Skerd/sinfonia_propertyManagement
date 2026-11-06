import {calendarDayUtc} from "@coreModule/helpers/general/dateTime.ts";

/** A reference as the API returns it (populated) or as a form holds it (the id). */
type Ref = {_id: string} | string;

/** Edit forms hold ids; the single endpoint returns populated references. */
export function refId(value: Ref | null | undefined): string | undefined {
    if (value == null) return undefined;
    return typeof value === "string" ? value : value._id;
}

export function refIds(values: readonly Ref[] | null | undefined): string[] {
    return (values ?? []).map((value) => (typeof value === "string" ? value : value._id));
}

/** A date-only field as the date picker holds it (`YYYY-MM-DD`), or nothing when empty. */
export function calendarDay(value: string | Date | null | undefined): string | undefined {
    return calendarDayUtc(value) || undefined;
}

/**
 * The multipart body the real-estate media endpoints take on edit: the written fields as JSON
 * in `data` (kept media ids under `mediaField`) and each newly picked file as `files`.
 */
export function mediaEditPayload(
    data: Record<string, unknown>,
    writeFields: Record<string, unknown>,
    mediaField: string,
): FormData {
    const fields: Record<string, unknown> = {_id: data._id};
    for (const [key, value] of Object.entries(data)) {
        if (key === mediaField) continue;
        if (writeFields[key] !== undefined) fields[key] = value;
    }
    const media: unknown[] = Array.isArray(data[mediaField]) ? data[mediaField] : [];
    if (writeFields[mediaField] !== undefined) {
        fields[mediaField] = media.filter((item): item is string => typeof item === "string" && item.trim() !== "");
    }
    const formData = new FormData();
    formData.append("data", JSON.stringify(fields));
    if (writeFields[mediaField]) {
        media.filter((item): item is File => item instanceof File).forEach((file) => formData.append("files", file));
    }
    return formData;
}
