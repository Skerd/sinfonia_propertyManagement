import {Suspense, useEffect, useState, useMemo} from "react";
import {formatNumber} from "@coreModule/helpers/general/numbers.ts";
import {GRID_KPI} from "@coreModule/components/entityPage/list/entityCard.constants.ts";
import {compose} from "redux";
import type {DashboardFormResponseType} from "armonia/src/modules/propertyManagement/api/realEstate/private/dashboard/dashboard.form.response.type.ts";
import type {DashboardFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/dashboard/dashboard.form.type.ts";
import type {Edifice} from "armonia/src/modules/propertyManagement/api/realEstate/private/edifice/edifice.dto.ts";
import {StatusChart, unitsByStatusToChartData} from "@propertyManagementModule/components/custom/dashboard/StatusChart.tsx";
import {RevenueChart, dashboardSummaryToRevenueChart} from "@propertyManagementModule/components/custom/dashboard/revenueChart.tsx";
import {EdificeGallery} from "./EdificeGallery.tsx";
import {EdificeDetailPanel} from "./EdificeDetailPanel.tsx";
import {IconCoin, IconStack, IconTrendingUp, IconWallet, IconKey} from "@tabler/icons-react";
import AllUnits from "@propertyManagementModule/clients/panel/private/units";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {ErrorView} from "@coreModule/components/custom/errors/errorView.tsx";
import Loader from "@coreModule/components/custom/loader/loader.tsx";
import Header from "@coreModule/components/custom/header.tsx";
import {readPageHelp} from "@coreModule/components/custom/pageHelp.tsx";
import {KpiCard} from "@coreModule/components/custom/kpiCard.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {PaymentAlerts} from "@propertyManagementModule/components/custom/dashboard/paymentAlerts.tsx";
import {formatRevenueByCurrencyLines} from "@propertyManagementModule/helpers/rentals/formatRevenueByCurrency.ts";
import {resolveWidget} from "@coreModule/components/viewEngine/widgetRegistry.ts";
import {buildDrillDownContextFromPeriod} from "@propertyManagementModule/helpers/dashboard/kpiDrillDown.ts";
import * as kpi from "@propertyManagementModule/helpers/dashboard/kpiDrillDown.ts";
import {useCompanyTimeZone} from "@coreModule/helpers/hooks/useCompanyTimeZone.ts";
import {
    buildDashboardFilter,
    DashboardPeriodToolbar,
} from "@propertyManagementModule/components/custom/dashboard/DashboardPeriodToolbar.tsx";
import {DashboardWidgetEmpty} from "@propertyManagementModule/components/custom/cards/DashboardWidgetCard.tsx";
import {useAccessHydrated} from "@coreModule/helpers/context/accessContext.tsx";
import {useAccess} from "@coreModule/helpers/hooks/useAccess.ts";
import Forbidden from "@coreModule/components/custom/pages/forbidden.tsx";
import {hasAnyAccessRead} from "@propertyManagementModule/helpers/access/aggregationAccess.ts";
import {getDashboardEdificeCardSources} from "@propertyManagementModule/helpers/moduleContributions/loadPropertyManagementPanelContributions.ts";
import type {DashboardEdificeCardSource} from "@propertyManagementModule/helpers/types/propertyManagementPanelContribution.types.ts";
import {useAnyModelRead} from "@propertyManagementModule/helpers/access/useAnyModelRead.ts";

type RealEstateDashboardProps = WithLanguageType & WithAxiosType<DashboardFormResponseType, DashboardFormType>;

/** A contributed edifice card, shown when its widget is registered and the caller may read one of its models. */
function ContributedEdificeCard({source, edificeId}: {source: DashboardEdificeCardSource; edificeId: string}) {
    const canRead = useAnyModelRead(source.accessModels);
    const Card = resolveWidget(source.widget);
    if (!canRead || !Card) return null;
    return (
        <Suspense fallback={null}>
            <Card edificeId={edificeId} />
        </Suspense>
    );
}

function RealEstateDashboard({
    resolveLanguageKey,
    languageCode,
    data: dashboardData,
    loading,
    error,
    onFilterChange,
}: RealEstateDashboardProps) {
    const [periodKey, setPeriodKey] = useState<string>("last12months");
    const timeZone = useCompanyTimeZone();
    // Filter, not a hard gate: null means portfolio aggregate.
    const [selectedEdifice, setSelectedEdifice] = useState<Edifice | null>(null);
    const accessHydrated = useAccessHydrated();
    const canRead = hasAnyAccessRead([
        useAccess("sales"),
        useAccess("units"),
        useAccess("projects"),
        useAccess("edifices"),
        useAccess("floors"),
        useAccess("reservations"),
        useAccess("paymentplans"),
        useAccess("inspections"),
        useAccess("modificationrequests"),
        useAccess("unitcosts"),
        useAccess("rentalpayments"),
        useAccess("leases"),
    ]);
    // Edifice cards other modules contribute (D119), e.g. delivery readiness: PM names neither the module nor its models.
    const edificeCards = getDashboardEdificeCardSources();

    useEffect(() => {
        if (accessHydrated === false || !canRead) return;
        onFilterChange(buildDashboardFilter(periodKey, timeZone, {edificeId: selectedEdifice?._id}));
    }, [selectedEdifice, periodKey, accessHydrated, canRead, timeZone]);

    const handlePeriodChange = (value: string) => {
        setPeriodKey(value);
        if (!canRead) return;
        onFilterChange(buildDashboardFilter(value, timeZone, {edificeId: selectedEdifice?._id}));
    };

    const summary = dashboardData?.summary;
    const totalUnits = summary?.totalUnits ?? 0;
    const unitsSold = summary?.unitsByStatus?.sold ?? 0;
    const statusChartData = summary?.unitsByStatus ? unitsByStatusToChartData(summary.unitsByStatus) : {
        available: 0,
        reserved: 0,
        sold: 0,
        blocked: 0,
        leased: 0,
    };
    const revenueChartSeries = dashboardSummaryToRevenueChart(summary);

    const drillDownContext = useMemo(() => {
        const f = buildDashboardFilter(periodKey, timeZone, {edificeId: selectedEdifice?._id});
        return buildDrillDownContextFromPeriod(f.from ?? "", f.to ?? "", selectedEdifice);
    }, [periodKey, selectedEdifice, timeZone]);

    const viewEntriesLabel = resolveLanguageKey("viewEntries");
    const hasData = !!dashboardData?.summary;

    if (accessHydrated === false) return <Loader/>;
    if (!canRead) return <Forbidden />;
    if (loading && !dashboardData) return <Loader/>;
    if (error) {
        return (
            <ErrorView
                title={resolveLanguageKey("failTitle")}
                description={resolveLanguageKey("failDescription")}
                onClick={() => onFilterChange(buildDashboardFilter(periodKey, timeZone, {edificeId: selectedEdifice?._id}))}
            />
        );
    }

    return (
        <div className="flex-full gap-4">
            <Header
                title={resolveLanguageKey("title")}
                description={resolveLanguageKey("description")}
                help={readPageHelp(resolveLanguageKey)}
            >
                <DashboardPeriodToolbar
                    periodKey={periodKey}
                    onPeriodChange={handlePeriodChange}
                    onRefresh={() => onFilterChange(buildDashboardFilter(periodKey, timeZone, {edificeId: selectedEdifice?._id}))}
                    periodLabel={resolveLanguageKey("period")}
                    periodLast7Days={resolveLanguageKey("periodLast7Days")}
                    periodLast30Days={resolveLanguageKey("periodLast30Days")}
                    periodLast3Months={resolveLanguageKey("periodLast3Months")}
                    periodLast12Months={resolveLanguageKey("periodLast12Months")}
                    refreshLabel={resolveLanguageKey("refresh")}
                />
            </Header>

            <div className="flex flex-col gap-4">
                <EdificeGallery
                    selectedEdificeId={selectedEdifice?._id ?? null}
                    onSelectEdifice={(e: Edifice) =>
                        setSelectedEdifice((prev) => (prev?._id === e._id ? null : e))
                    }
                />

                {!selectedEdifice ? (
                    <p className="text-xs text-muted-foreground">
                        {resolveLanguageKey("companyScope")}
                    </p>
                ) : null}

                {!hasData ? (
                    <DashboardWidgetEmpty
                        message={String(resolveLanguageKey("noData") || "No dashboard data yet")}
                    />
                ) : (
                    <>
                        <div className={GRID_KPI}>
                            <KpiCard
                                compact
                                title={resolveLanguageKey("totalUnits") ?? "Total Units"}
                                value={formatNumber(totalUnits)}
                                icon={IconStack}
                                href={kpi.kpiUnitsTotal(drillDownContext)}
                                linkLabel={viewEntriesLabel}
                            />
                            <KpiCard
                                compact
                                title={resolveLanguageKey("unitsSold") ?? "Sold"}
                                value={formatNumber(unitsSold)}
                                icon={IconTrendingUp}
                                variant="success"
                                href={kpi.kpiUnitsSold(drillDownContext)}
                                linkLabel={viewEntriesLabel}
                            />
                            <KpiCard
                                compact
                                title={resolveLanguageKey("collected") ?? "Collected"}
                                value={formatRevenueByCurrencyLines(summary?.collected, languageCode || "en-US")}
                                icon={IconWallet}
                                variant="primary"
                                href={kpi.kpiCollected(drillDownContext)}
                                linkLabel={String(resolveLanguageKey("viewCollectedPlanPayments"))}
                            />
                            <KpiCard
                                compact
                                title={resolveLanguageKey("avgSalePrice")}
                                value={formatRevenueByCurrencyLines(summary?.averageSalePrice, languageCode || "en-US")}
                                icon={IconCoin}
                                href={kpi.kpiAvgSalePrice(drillDownContext)}
                                linkLabel={viewEntriesLabel}
                            />
                        </div>

                        <div className={GRID_KPI}>
                            <KpiCard
                                compact
                                title={resolveLanguageKey("rentCollected") ?? "Rent collected"}
                                value={formatRevenueByCurrencyLines(summary?.rentals?.collectedAmount, languageCode || "en-US")}
                                icon={IconWallet}
                                variant="success"
                                href="/realEstate/rentalsHub"
                                linkLabel={String(resolveLanguageKey("viewRentalsHub") ?? viewEntriesLabel)}
                            />
                            <KpiCard
                                compact
                                title={resolveLanguageKey("rentOutstanding") ?? "Rent outstanding"}
                                value={formatRevenueByCurrencyLines(summary?.rentals?.outstandingAmount, languageCode || "en-US")}
                                icon={IconWallet}
                                variant="warning"
                                href="/realEstate/rentalsHub"
                                linkLabel={String(resolveLanguageKey("viewRentalsHub") ?? viewEntriesLabel)}
                            />
                            <KpiCard
                                compact
                                title={resolveLanguageKey("rentOverdue") ?? "Rent overdue"}
                                value={formatRevenueByCurrencyLines(summary?.rentals?.overdueAmount, languageCode || "en-US")}
                                icon={IconWallet}
                                variant="danger"
                                href="/realEstate/rentalsHub"
                                linkLabel={String(resolveLanguageKey("viewRentalsHub") ?? viewEntriesLabel)}
                            />
                            <KpiCard
                                compact
                                title={resolveLanguageKey("activeLeases") ?? "Active leases"}
                                value={formatNumber(summary?.rentals?.activeLeases ?? 0)}
                                icon={IconKey}
                                href="/realEstate/rentalsHub"
                                linkLabel={String(resolveLanguageKey("viewRentalsHub") ?? viewEntriesLabel)}
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                            <StatusChart
                                data={statusChartData}
                                title={resolveLanguageKey("unitStatusBreakdown") ?? "Unit status"}
                            />
                            <RevenueChart series={revenueChartSeries} />

                            <PaymentAlerts
                                overdueCount={
                                    (dashboardData?.summary?.paymentPlans?.overdueInstallmentsCount ?? 0)
                                    + (dashboardData?.summary?.rentals?.overdueCount ?? 0)
                                }
                                alerts={dashboardData?.paymentAlerts ?? []}
                                title={resolveLanguageKey("paymentAlerts")}
                                viewAllLabel={resolveLanguageKey("viewPaymentPlans")}
                                drillDownContext={drillDownContext}
                            />
                        </div>

                        {selectedEdifice && (
                            <>
                                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                                    {edificeCards.map((source) => (
                                        <ContributedEdificeCard key={source.widget} source={source} edificeId={selectedEdifice._id} />
                                    ))}
                                </div>

                                <EdificeDetailPanel
                                    edificeId={selectedEdifice._id}
                                    edificeName={selectedEdifice.name}
                                    projectId={selectedEdifice.project?._id}
                                    projectName={selectedEdifice.project?.name}
                                    onClose={() => setSelectedEdifice(null)}
                                />
                            </>
                        )}
                    </>
                )}

                {
                    !!selectedEdifice?._id &&
                    <div className="mt-8 flex min-h-dvh flex-col">
                        <div className="flex min-h-0 flex-1 flex-col">
                            <AllUnits showHeader={false} edificeId={selectedEdifice?._id}/>
                        </div>
                    </div>
                }
            </div>
        </div>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/dashboard/index.tsx"),
    withAxios(
        {
            url: "/api/realEstate/dashboard",
            method: "post",
            data: {},
        },
        true
    ),
    withDebug(true, true, ["units", "edifices", "projects"])
)(RealEstateDashboard);
