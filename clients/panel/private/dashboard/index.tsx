import {useEffect, useState, useMemo} from "react";
import {compose} from "redux";
import type {DashboardFormResponseType} from "armonia/src/modules/propertyManagement/api/realEstate/private/dashboard/dashboard.form.response.type.ts";
import type {DashboardFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/dashboard/dashboard.form.type.ts";
import type {Edifice} from "armonia/src/modules/propertyManagement/api/realEstate/private/edifice/edifice.dto.ts";
import {StatusChart, unitsByStatusToChartData} from "@propertyManagementModule/components/custom/dashboard/StatusChart.tsx";
import {RevenueChart, dashboardSummaryToRevenueChart} from "@propertyManagementModule/components/custom/dashboard/revenueChart.tsx";
import {EdificeGallery} from "./EdificeGallery.tsx";
import {EdificeDetailPanel} from "./EdificeDetailPanel.tsx";
import {IconCoin, IconStack, IconTrendingUp, IconWallet} from "@tabler/icons-react";
import AllUnits from "@propertyManagementModule/clients/panel/private/units";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {ErrorView} from "@coreModule/components/custom/errorView.tsx";
import Loader from "@coreModule/components/custom/loader.tsx";
import Header from "@coreModule/components/custom/header.tsx";
import {KpiCard} from "@coreModule/components/custom/kpiCard.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {PaymentAlerts} from "@propertyManagementModule/components/custom/dashboard/paymentAlerts.tsx";
import {buildDrillDownContextFromPeriod} from "@propertyManagementModule/helpers/dashboard/kpiDrillDown.ts";
import * as kpi from "@propertyManagementModule/helpers/dashboard/kpiDrillDown.ts";
import {
    buildDashboardFilter,
    DashboardPeriodToolbar,
} from "@propertyManagementModule/components/custom/dashboard/DashboardPeriodToolbar.tsx";
import {DashboardWidgetEmpty} from "@propertyManagementModule/components/custom/cards/DashboardWidgetCard.tsx";

type RealEstateDashboardProps = WithLanguageType & WithAxiosType<DashboardFormResponseType, DashboardFormType>;

function RealEstateDashboard({
    resolveLanguageKey,
    data: dashboardData,
    loading,
    error,
    onFilterChange,
}: RealEstateDashboardProps) {
    const [periodKey, setPeriodKey] = useState<string>("last12months");
    const [selectedEdifice, setSelectedEdifice] = useState<Edifice | null>(null);

    useEffect(() => {
        if (selectedEdifice) {
            onFilterChange(buildDashboardFilter(periodKey, {edificeId: selectedEdifice._id}));
        }
    }, [selectedEdifice, periodKey]);

    const handlePeriodChange = (value: string) => {
        setPeriodKey(value);
        if (selectedEdifice) {
            onFilterChange(buildDashboardFilter(value, {edificeId: selectedEdifice._id}));
        }
    };

    const handleEdificesLoaded = (edifices: Edifice[]) => {
        setSelectedEdifice((prev) => (prev === null && edifices.length > 0 ? edifices[0] : prev));
    };

    const summary = dashboardData?.summary;
    const totalUnits = summary?.totalUnits ?? 0;
    const unitsSold = summary?.unitsByStatus?.sold ?? 0;
    const collectedAmount = summary?.totalRevenue?.reduce((acc, r) => acc + (r?.value ?? 0), 0) ?? 0;
    const avgPricePerSqm = summary?.averageSalePrice != null && summary.averageSalePrice > 0 ? Math.round(summary.averageSalePrice) : 0;
    const statusChartData = summary?.unitsByStatus ? unitsByStatusToChartData(summary.unitsByStatus) : {
        available: 0,
        reserved: 0,
        sold: 0,
        blocked: 0,
        leased: 0,
    };
    const revenueChartProps = dashboardSummaryToRevenueChart(summary);

    const drillDownContext = useMemo(() => {
        const f = buildDashboardFilter(periodKey, {edificeId: selectedEdifice?._id});
        return buildDrillDownContextFromPeriod(f.from ?? "", f.to ?? "", selectedEdifice);
    }, [periodKey, selectedEdifice]);

    const viewEntriesLabel = resolveLanguageKey("viewEntries") as string;

    const hasSelection = !!selectedEdifice;
    if (loading && !dashboardData && hasSelection) return <Loader/>;
    if (error && hasSelection) {
        return (
            <ErrorView
                title={resolveLanguageKey("failTitle")}
                description={resolveLanguageKey("failDescription")}
                onClick={() => selectedEdifice && onFilterChange(buildDashboardFilter(periodKey, {edificeId: selectedEdifice._id}))}
            />
        );
    }

    return (
        <div className="flex-full gap-4">
            <Header
                title={resolveLanguageKey("title")}
                description={resolveLanguageKey("description")}
            >
                <DashboardPeriodToolbar
                    periodKey={periodKey}
                    onPeriodChange={handlePeriodChange}
                    onRefresh={() => selectedEdifice && onFilterChange(buildDashboardFilter(periodKey, {edificeId: selectedEdifice._id}))}
                    periodLabel={resolveLanguageKey("period") as string}
                    periodLast7Days={resolveLanguageKey("periodLast7Days") as string}
                    periodLast30Days={resolveLanguageKey("periodLast30Days") as string}
                    periodLast3Months={resolveLanguageKey("periodLast3Months") as string}
                    periodLast12Months={resolveLanguageKey("periodLast12Months") as string}
                    refreshLabel={resolveLanguageKey("refresh") as string}
                />
            </Header>

            <div className="flex flex-col gap-4">
                <EdificeGallery
                    selectedEdificeId={selectedEdifice?._id ?? null}
                    onSelectEdifice={(e: Edifice) => setSelectedEdifice(e)}
                    onEdificesLoaded={handleEdificesLoaded}
                />

                {!hasSelection && (
                    <DashboardWidgetEmpty
                        message={resolveLanguageKey("selectEdifice") ?? "Select an edifice to view KPIs and charts"}
                    />
                )}

                {
                    hasSelection &&
                    <>
                        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                            <KpiCard
                                compact
                                title={resolveLanguageKey("totalUnits") ?? "Total Units"}
                                value={totalUnits.toLocaleString()}
                                icon={IconStack as never}
                                href={kpi.kpiUnitsTotal(drillDownContext)}
                                linkLabel={viewEntriesLabel}
                            />
                            <KpiCard
                                compact
                                title={resolveLanguageKey("unitsSold") ?? "Sold"}
                                value={unitsSold.toLocaleString()}
                                icon={IconTrendingUp as never}
                                variant="success"
                                href={kpi.kpiUnitsSold(drillDownContext)}
                                linkLabel={viewEntriesLabel}
                            />
                            <KpiCard
                                compact
                                title={resolveLanguageKey("collected") ?? "Collected"}
                                value={`$${collectedAmount.toLocaleString(undefined, {maximumFractionDigits: 0})}`}
                                icon={IconWallet as never}
                                variant="primary"
                                href={kpi.kpiCollected(drillDownContext)}
                                linkLabel={viewEntriesLabel}
                            />
                            <KpiCard
                                compact
                                title={resolveLanguageKey("avgPricePerSqm") ?? "Avg €/m²"}
                                value={`$${avgPricePerSqm.toLocaleString()}`}
                                icon={IconCoin as never}
                                href={kpi.kpiAvgPricePerSqm(drillDownContext)}
                                linkLabel={viewEntriesLabel}
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                            <StatusChart
                                data={statusChartData}
                                title={resolveLanguageKey("unitStatusBreakdown") ?? "Unit status"}
                            />
                            <RevenueChart {...revenueChartProps} />

                            <PaymentAlerts
                                overdueCount={dashboardData?.summary?.paymentPlans?.overdueInstallmentsCount ?? 0}
                                alerts={dashboardData?.paymentAlerts ?? []}
                                title={resolveLanguageKey("paymentAlerts")}
                                viewAllLabel={resolveLanguageKey("viewPaymentPlans")}
                            />

                        </div>

                        <EdificeDetailPanel
                            edificeId={selectedEdifice._id}
                            edificeName={selectedEdifice.name}
                            projectId={selectedEdifice.project?._id}
                            projectName={selectedEdifice.project?.name}
                            onClose={() => setSelectedEdifice(null)}
                        />
                    </>
                }

                <div className="min-h-dvh flex flex-col" style={{marginTop: "30px"}}>
                    <div className="min-h-0 flex-1 flex flex-col">
                        <AllUnits showHeader={false} edificeId={selectedEdifice?._id}/>
                    </div>
                </div>
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
    withDebug(true, true)
)(RealEstateDashboard);
