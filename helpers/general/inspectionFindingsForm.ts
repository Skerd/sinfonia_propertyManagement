export const INSPECTION_FINDINGS_FORM_KEYS = [
    "structuralIssues",
    "electricalIssues",
    "plumbingIssues",
    "hvacIssues",
    "safetyConcerns",
    "cosmeticIssues",
    "otherObservations",
] as const;

export type InspectionFindingEntry = {
    notes: string;
    /** Existing persisted media ObjectId strings to keep, plus any new File objects not yet uploaded. */
    media: (string | File)[];
    /** ISO date string (yyyy-MM-dd) when the finding was resolved. */
    resolvedAt?: string;
    /** ObjectId string of the user who resolved the finding. */
    resolvedBy?: string;
};

export function normalizeFindingsFromApi(
    findings: Record<string, unknown> | undefined | null
): Record<string, InspectionFindingEntry[]> | undefined {
    if (!findings || typeof findings !== "object") return undefined;
    const out: Record<string, InspectionFindingEntry[]> = {};
    for (const key of INSPECTION_FINDINGS_FORM_KEYS) {
        const arr = findings[key];
        if (!Array.isArray(arr) || arr.length === 0) continue;
        out[key] = arr.map((item: unknown): InspectionFindingEntry => {
            if (typeof item === "string") {
                return {notes: item, media: []};
            }
            if (item && typeof item === "object") {
                const o = item as {notes?: string; text?: string; media?: unknown[]; resolvedAt?: unknown; resolvedBy?: unknown};
                const notes = String(o.notes ?? o.text ?? "");
                const mediaIds = Array.isArray(o.media)
                    ? o.media
                          .map((m: any) => m._id?.toString?.() ?? m?.toString?.() ?? "")
                          .filter(Boolean)
                    : [];
                const resolvedAt = o.resolvedAt
                    ? new Date(String(o.resolvedAt)).toISOString().split("T")[0]
                    : undefined;
                const resolvedBy = o.resolvedBy
                    ? (typeof o.resolvedBy === "object"
                        ? (o.resolvedBy as any)._id?.toString()
                        : String(o.resolvedBy))
                    : undefined;
                return {notes, media: mediaIds, resolvedAt, resolvedBy};
            }
            return {notes: String(item), media: []};
        });
    }
    return Object.keys(out).length > 0 ? out : undefined;
}
