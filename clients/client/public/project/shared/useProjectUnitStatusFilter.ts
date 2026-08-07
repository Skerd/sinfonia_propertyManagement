import {useCallback} from "react";
import {useSearchParams} from "react-router-dom";

export const PROJECT_UNIT_STATUS_FILTERS = ["available", "sold", "reserved", "all"] as const;
export type ProjectUnitStatusFilter = (typeof PROJECT_UNIT_STATUS_FILTERS)[number];

export function parseUnitStatusFilter(raw: string | null | undefined): ProjectUnitStatusFilter {
    if (raw === "available" || raw === "sold" || raw === "reserved" || raw === "all") {
        return raw;
    }
    return "all";
}

/** Syncs Available / Sold / Reserved / All across polygon viewer + Units grid via `unitStatus` URL param. */
export function useProjectUnitStatusFilter() {
    const [searchParams, setSearchParams] = useSearchParams();
    const activeFilter = parseUnitStatusFilter(searchParams.get("unitStatus"));

    const setActiveFilter = useCallback(
        (filter: ProjectUnitStatusFilter | string) => {
            const next = parseUnitStatusFilter(filter);
            setSearchParams(
                (prev) => {
                    const params = new URLSearchParams(prev);
                    if (next === "all") {
                        params.delete("unitStatus");
                    } else {
                        params.set("unitStatus", next);
                    }
                    return params;
                },
                {replace: true},
            );
        },
        [setSearchParams],
    );

    return {activeFilter, setActiveFilter};
}
