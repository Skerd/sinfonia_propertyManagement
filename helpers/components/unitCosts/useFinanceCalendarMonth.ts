import { useEffect, useMemo, useState } from "react";
import type { UnitCost } from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/unitCost/unitCost.dto.ts";
import useAllPages from "@coreModule/helpers/hooks/useAllPages.ts";
import type { HttpRequest } from "@coreModule/helpers/hooks/useHttpRequest.ts";
import { buildFinanceCalendarFetchFilter } from "@propertyManagementModule/helpers/components/unitCosts/financeFilterDsl.ts";

const PAGE_LIMIT = 200;
const UNIT_COSTS_REQUEST: HttpRequest = { method: "post", url: "/api/realEstate/unit/cost" };
/** Hard cap to avoid unbounded memory; UI shows a warning when results are truncated. */
export const FINANCE_CALENDAR_MAX_ROWS = 5000;

export type FinanceCalendarFetchOptions = {
    project?: string;
    edifice?: string;
    floor?: string;
    unit?: string;
    verificationStatus?: string;
    paymentStatus?: string;
    vendorContains?: string;
    purchasePersonId?: string;
};

function toYmd(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function monthRangeYmd(month: Date): { start: string; end: string } {
    const start = new Date(month.getFullYear(), month.getMonth(), 1);
    const end = new Date(month.getFullYear(), month.getMonth() + 1, 0);
    return { start: toYmd(start), end: toYmd(end) };
}

export function useFinanceCalendarMonth(month: Date, options: FinanceCalendarFetchOptions = {}) {
    const y = month.getFullYear();
    const mo = month.getMonth();
    const { project, edifice, floor, unit, verificationStatus, paymentStatus, vendorContains, purchasePersonId } = options;

    const requestData = useMemo(() => {
        const { start, end } = monthRangeYmd(new Date(y, mo, 1));
        const filter = buildFinanceCalendarFetchFilter(start, end, {
            vendorContains,
            purchasePersonId,
            verificationStatus,
            paymentStatus,
            unit,
            project,
            edifice,
            floor,
        });
        return { sortBy: "paymentDate", sortOrder: "asc", filter };
    }, [y, mo, project, edifice, floor, unit, verificationStatus, paymentStatus, vendorContains, purchasePersonId]);

    // One load of every page per month/filter change.
    const [fetchCount, setFetchCount] = useState(0);
    useEffect(() => {
        setFetchCount((count) => count + 1);
    }, [requestData]);
    const { rows, total, loading: pagesLoading, error, truncated } = useAllPages<UnitCost>(UNIT_COSTS_REQUEST, requestData, fetchCount, {
        pageSize: PAGE_LIMIT,
        maxRows: FINANCE_CALENDAR_MAX_ROWS,
    });
    const loading = fetchCount === 0 || pagesLoading;

    return { rows, total, loading, error, truncated };
}
