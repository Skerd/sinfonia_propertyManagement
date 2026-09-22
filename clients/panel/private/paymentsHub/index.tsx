import {compose} from "redux";
import {useCallback, useEffect, useMemo, useState} from "react";
import {useSelector} from "react-redux";
import {useSearchParams} from "react-router-dom";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import Header from "@coreModule/components/custom/header.tsx";
import {readPageHelp} from "@coreModule/components/custom/pageHelp.tsx";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@coreModule/components/ui/tabs.tsx";
import apiClient from "@coreModule/helpers/apiClient/apiClient.ts";
import type {RootState} from "@coreModule/helpers/redux/store/generalStore.ts";
import type {PaymentsHubRow} from "armonia/src/modules/propertyManagement/api/realEstate/private/paymentsHub/paymentsHub.dto.ts";
import type {PaymentsSummaryFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/paymentsHub/paymentsHub.form.type.ts";
import type {PaymentsSummaryResponseType} from "armonia/src/modules/propertyManagement/api/realEstate/private/paymentsHub/paymentsHub.response.type.ts";
import type {
    PaymentsHubGroupBy,
    PaymentsHubStatus,
} from "armonia/src/modules/propertyManagement/api/realEstate/private/paymentsHub/paymentsHub.constants.ts";
import PaymentPlanSheetView from "@propertyManagementModule/clients/panel/private/sales/center/sheetView/paymentPlanSheetView.tsx";
import {useAccessHydrated} from "@coreModule/helpers/context/accessContext.tsx";
import {useAccess} from "@coreModule/helpers/hooks/useAccess.ts";
import Forbidden from "@coreModule/components/custom/pages/forbidden.tsx";
import Loader from "@coreModule/components/custom/loader/loader.tsx";
import {hasAnyAccessRead} from "@propertyManagementModule/helpers/access/aggregationAccess.ts";
import PaymentsHubFilters from "./PaymentsHubFilters.tsx";
import PaymentsHubKpis from "./PaymentsHubKpis.tsx";
import PaymentsTableSection from "./PaymentsTableSection.tsx";
import PaymentsCalendarTab from "./PaymentsCalendarTab.tsx";
import {EMPTY_PAYMENTS_SCOPE, type PaymentsHubScope, scopeToBody} from "./paymentsHubHelpers.ts";

type PaymentsHubTab = "list" | "calendar";

function parsePaymentsHubTab(value: string | null): PaymentsHubTab {
    return value === "calendar" ? "calendar" : "list";
}

function PaymentsHubPage({resolveLanguageKey, languageCode}: WithLanguageType) {
    const {timezone} = useSelector((state: RootState) => state.authentication.user);
    const locale = languageCode || "en-US";
    const [searchParams, setSearchParams] = useSearchParams();
    const accessHydrated = useAccessHydrated();
    const canRead = hasAnyAccessRead([useAccess("paymentplans"), useAccess("sales")]);

    // `?status=` lets the dashboard link straight to, say, everything overdue.
    const [scope, setScope] = useState<PaymentsHubScope>(() => ({
        ...EMPTY_PAYMENTS_SCOPE,
        status: (searchParams.get("status") as PaymentsHubStatus | null) ?? "",
        unit: searchParams.get("unit") ?? "",
    }));
    const [searchInput, setSearchInput] = useState("");
    const [groupBy, setGroupBy] = useState<PaymentsHubGroupBy | "none">("none");
    const [summary, setSummary] = useState<PaymentsSummaryResponseType | null>(null);
    const [summaryLoading, setSummaryLoading] = useState(true);
    const [openPlanId, setOpenPlanId] = useState<string | null>(null);
    // Bumped when the payment-plan sheet closes: a payment may have been recorded there.
    const [refreshToken, setRefreshToken] = useState(0);

    const tab = useMemo(() => parsePaymentsHubTab(searchParams.get("tab")), [searchParams]);

    const setTab = useCallback(
        (next: string) => {
            const parsed = parsePaymentsHubTab(next);
            setSearchParams(
                (prev) => {
                    const params = new URLSearchParams(prev);
                    if (parsed === "list") params.delete("tab");
                    else params.set("tab", parsed);
                    return params;
                },
                {replace: true},
            );
        },
        [setSearchParams],
    );

    useEffect(() => {
        const timer = setTimeout(
            () => setScope((prev) => (prev.search === searchInput ? prev : {...prev, search: searchInput})),
            300,
        );
        return () => clearTimeout(timer);
    }, [searchInput]);

    const patchScope = useCallback((patch: Partial<PaymentsHubScope>) => {
        setScope((prev) => ({...prev, ...patch}));
    }, []);

    const resetFilters = useCallback(() => {
        setSearchInput("");
        setScope(EMPTY_PAYMENTS_SCOPE);
        setSearchParams(
            (prev) => {
                const params = new URLSearchParams(prev);
                params.delete("status");
                params.delete("unit");
                return params;
            },
            {replace: true},
        );
    }, [setSearchParams]);

    const scopeBody = useMemo(() => scopeToBody(scope), [scope]);
    const summaryGroupBy: PaymentsHubGroupBy = groupBy === "none" ? "month" : groupBy;

    useEffect(() => {
        let cancelled = false;
        setSummaryLoading(true);
        const body: PaymentsSummaryFormType = {
            ...scopeBody,
            groupBy: summaryGroupBy,
            dateField: scope.dateField,
        };
        if (scope.dateFrom) body.dateFrom = scope.dateFrom;
        if (scope.dateTo) body.dateTo = scope.dateTo;

        void apiClient
            .post<PaymentsSummaryResponseType>("/api/realEstate/paymentsHub/payments/summary", body)
            .then((res) => {
                if (!cancelled) setSummary(res.data);
            })
            .catch(() => {
                if (!cancelled) setSummary(null);
            })
            .finally(() => {
                if (!cancelled) setSummaryLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [scopeBody, summaryGroupBy, scope.dateField, scope.dateFrom, scope.dateTo, refreshToken]);

    const openRow = useCallback((row: PaymentsHubRow) => {
        setOpenPlanId(row.planId);
    }, []);

    const closeSheet = useCallback(() => {
        setOpenPlanId(null);
        setRefreshToken((token) => token + 1);
    }, []);

    if (accessHydrated === false) return <Loader />;
    if (!canRead) return <Forbidden />;

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <Header
                title={String(resolveLanguageKey("title"))}
                description={String(resolveLanguageKey("description"))}
                help={readPageHelp(resolveLanguageKey)}
            />

            <div className="flex-1 overflow-auto p-4">
                <div className="flex flex-col gap-4">

                    <PaymentsHubKpis
                        resolveLanguageKey={resolveLanguageKey}
                        locale={locale}
                        summary={summary}
                        loading={summaryLoading}
                    />

                    <PaymentsHubFilters
                        resolveLanguageKey={resolveLanguageKey}
                        scope={scope}
                        searchInput={searchInput}
                        onSearchInputChange={setSearchInput}
                        onScopeChange={patchScope}
                        onReset={resetFilters}
                    />

                    <Tabs value={tab} onValueChange={setTab} className="flex flex-col gap-4">
                        <TabsList variant="line" className="h-auto w-fit gap-0 border-b bg-transparent p-0">
                            <TabsTrigger className="cursor-pointer flex-none shrink-0 px-3 py-2" value="list">
                                {String(resolveLanguageKey("tabs.list"))}
                            </TabsTrigger>
                            <TabsTrigger className="cursor-pointer flex-none shrink-0 px-3 py-2" value="calendar">
                                {String(resolveLanguageKey("tabs.calendar"))}
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value="list">
                            <PaymentsTableSection
                                resolveLanguageKey={resolveLanguageKey}
                                locale={locale}
                                timezone={timezone}
                                scope={scope}
                                groupBy={groupBy}
                                onGroupByChange={setGroupBy}
                                summary={summary}
                                summaryLoading={summaryLoading}
                                onScopeChange={patchScope}
                                onViewRow={openRow}
                                refreshToken={refreshToken}
                            />
                        </TabsContent>
                        <TabsContent value="calendar">
                            <PaymentsCalendarTab
                                resolveLanguageKey={resolveLanguageKey}
                                locale={locale}
                                scope={scope}
                                onViewRow={openRow}
                                refreshToken={refreshToken}
                            />
                        </TabsContent>
                    </Tabs>
                </div>
            </div>

            {openPlanId && (
                <PaymentPlanSheetView
                    open
                    fetchId={openPlanId}
                    onOpenChange={(open: boolean) => {
                        if (!open) closeSheet();
                    }}
                />
            )}
        </div>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/paymentsHub/index.tsx"),
    withDebug(true, true, ["paymentplans", "sales"]),
)(PaymentsHubPage);
