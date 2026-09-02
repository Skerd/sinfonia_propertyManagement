import { Building2, Wallet, Layers, TrendingUp, FileCheck, KeyRound } from "lucide-react";
import {GRID_KPI} from "@coreModule/components/custom/cards/entityCard.constants.ts";
import { AnalyticsChart, PaymentTypeChart, RevenueByPeriodChart } from "./analytics-chart.tsx";
import { formatCurrency, formatNumber } from "@coreModule/helpers/general";
import { compose } from "redux";
import type { DashboardFormResponseType } from "armonia/src/modules/propertyManagement/api/realEstate/private/dashboard/dashboard.form.response.type.ts";
import {
  StatusChart,
  unitsByStatusToChartData,
} from "@propertyManagementModule/components/custom/dashboard/StatusChart.tsx";
import {
  RevenueChart as PortfolioValueChart,
  dashboardSummaryToRevenueChart,
} from "@propertyManagementModule/components/custom/dashboard/revenueChart.tsx";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@coreModule/components/ui/card.tsx";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {KpiCard} from "@coreModule/components/custom/kpiCard.tsx";
import {formatRevenueByCurrencyLines} from "@propertyManagementModule/helpers/rentals/formatRevenueByCurrency.ts";
import type {KpiDrillDownContext} from "@propertyManagementModule/helpers/dashboard/kpiDrillDown.ts";
import * as kpi from "@propertyManagementModule/helpers/dashboard/kpiDrillDown.ts";

type AnalyticsProps = WithLanguageType & {
  dashboardData: DashboardFormResponseType | null | undefined;
  drillDownContext: KpiDrillDownContext;
  viewEntriesLabel: string;
};

function Analytics({ resolveLanguageKey, languageCode, dashboardData, drillDownContext, viewEntriesLabel }: AnalyticsProps) {
  const summary = dashboardData?.summary;
  const salesByPeriod = dashboardData?.salesByPeriod ?? [];
  const revenueByPeriod = dashboardData?.revenueByPeriod ?? [];
  const salesByPaymentType = summary?.salesByPaymentType ?? { cash: 0, payment_plan: 0 };

  const totalUnits = summary?.totalUnits ?? 0;
  const activePaymentPlans = summary?.paymentPlans?.byStatus?.active ?? 0;
  const overdueInstallments = summary?.paymentPlans?.overdueInstallmentsCount ?? 0;
  const totalOutstanding = summary?.paymentPlans?.totalOutstanding ?? 0;
  const totalProjects = summary?.totalProjects ?? 0;
  const totalEdifices = summary?.totalEdifices ?? 0;
  const totalFloors = summary?.totalFloors ?? 0;
  const occupancyRatePercent = summary?.occupancyRatePercent ?? 0;
  const followUpInspections = summary?.inspections?.followUpRequiredCount ?? 0;

  const hasData = summary != null;
  const statusChartData = unitsByStatusToChartData(
    summary?.unitsByStatus ?? { available: 0, unavailable: 0, reserved: 0, sold: 0, leased: 0 }
  );

  const ctx = drillDownContext;
  const link = viewEntriesLabel;

  if (!hasData) {
    return (
      <div className="flex flex-col gap-y-3">
        <Card className="py-3">
          <CardHeader className="px-3 pb-1.5 pt-0">
            <CardTitle className="text-sm font-semibold">{resolveLanguageKey("title")}</CardTitle>
            <CardDescription className="text-2xs">{resolveLanguageKey("description")}</CardDescription>
          </CardHeader>
          <CardContent className="px-3 pb-3 pt-0">
            <div className="flex h-[260px] items-center justify-center text-muted-foreground text-xs">
              {resolveLanguageKey("loadOverviewFirst")}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-y-3">
      <div className={GRID_KPI}>
        <KpiCard compact title={resolveLanguageKey("totalUnits")} value={formatNumber(totalUnits)} subtitle={resolveLanguageKey("totalUnitsDesc")} icon={Layers} href={kpi.kpiUnitsTotal(ctx)} linkLabel={link} />
        <KpiCard compact title={resolveLanguageKey("activePaymentPlans")} value={formatNumber(activePaymentPlans)} subtitle={resolveLanguageKey("activePaymentPlansDesc")} icon={Wallet} variant="warning" href={kpi.kpiActivePaymentPlans(ctx)} linkLabel={link} />
        <KpiCard compact title={resolveLanguageKey("overdueInstallments")} value={formatNumber(overdueInstallments)} subtitle={resolveLanguageKey("overdueInstallmentsDesc")} icon={Wallet} variant="danger" href={kpi.kpiOverdueInstallments(ctx)} linkLabel={link} />
        <KpiCard compact title={resolveLanguageKey("totalOutstanding")} value={formatCurrency(totalOutstanding)} subtitle={resolveLanguageKey("totalOutstandingDesc")} icon={Wallet} href={kpi.kpiTotalOutstanding(ctx)} linkLabel={link} />
      </div>

      <div className={GRID_KPI}>
        <KpiCard compact title={resolveLanguageKey("rentCollected")} value={formatRevenueByCurrencyLines(summary?.rentals?.collectedAmount, languageCode || "en-US")} subtitle={resolveLanguageKey("rentCollectedDesc")} icon={Wallet} variant="success" href="/realEstate/rentalsHub" linkLabel={link} />
        <KpiCard compact title={resolveLanguageKey("rentOutstanding")} value={formatRevenueByCurrencyLines(summary?.rentals?.outstandingAmount, languageCode || "en-US")} subtitle={resolveLanguageKey("rentOutstandingDesc")} icon={Wallet} variant="warning" href="/realEstate/rentalsHub" linkLabel={link} />
        <KpiCard compact title={resolveLanguageKey("rentOverdue")} value={formatRevenueByCurrencyLines(summary?.rentals?.overdueAmount, languageCode || "en-US")} subtitle={resolveLanguageKey("rentOverdueDesc")} icon={Wallet} variant="danger" href="/realEstate/rentalsHub" linkLabel={link} />
        <KpiCard compact title={resolveLanguageKey("activeLeases")} value={formatNumber(summary?.rentals?.activeLeases ?? 0)} subtitle={resolveLanguageKey("activeLeasesDesc")} icon={KeyRound} href="/realEstate/rentalsHub" linkLabel={link} />
      </div>

      <div className={GRID_KPI}>
        <KpiCard compact title={resolveLanguageKey("totalProjects")} value={formatNumber(totalProjects)} subtitle={resolveLanguageKey("totalProjectsDesc")} icon={Building2} href={kpi.kpiTotalProjects(ctx)} linkLabel={link} />
        <KpiCard compact title={resolveLanguageKey("totalEdifices")} value={formatNumber(totalEdifices)} subtitle={resolveLanguageKey("totalEdificesDesc")} icon={Building2} href={kpi.kpiTotalEdifices(ctx)} linkLabel={link} />
        <KpiCard compact title={resolveLanguageKey("totalFloors")} value={formatNumber(totalFloors)} subtitle={resolveLanguageKey("totalFloorsDesc")} icon={Layers} href={kpi.kpiTotalFloors(ctx)} linkLabel={link} />
        <KpiCard compact title={resolveLanguageKey("occupancyRate")} value={`${occupancyRatePercent.toFixed(1)}%`} subtitle={resolveLanguageKey("occupancyRateDesc")} icon={TrendingUp} variant="success" href={kpi.kpiOccupancyRate(ctx)} linkLabel={link} />
        <KpiCard compact title={resolveLanguageKey("followUpInspections")} value={formatNumber(followUpInspections)} subtitle={resolveLanguageKey("followUpInspectionsDesc")} icon={FileCheck} href={kpi.kpiFollowUpInspections(ctx)} linkLabel={link} />
      </div>

      <div className="grid gap-2 lg:grid-cols-2">
        <Card className="py-3">
          <CardHeader className="px-3 pb-1.5 pt-0">
            <CardTitle className="text-sm font-semibold">{resolveLanguageKey("salesByMonth")}</CardTitle>
            <CardDescription className="text-2xs">{resolveLanguageKey("salesByMonthDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="px-3 pb-3 pt-0">
            <AnalyticsChart salesByPeriod={salesByPeriod} noDataLabel={resolveLanguageKey("noSalesData")} />
          </CardContent>
        </Card>
        <Card className="py-3">
          <CardHeader className="px-3 pb-1.5 pt-0">
            <CardTitle className="text-sm font-semibold">{resolveLanguageKey("revenueByMonth")}</CardTitle>
            <CardDescription className="text-2xs">{resolveLanguageKey("revenueByMonthDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="px-3 pb-3 pt-0">
            <RevenueByPeriodChart revenueByPeriod={revenueByPeriod} noDataLabel={resolveLanguageKey("noRevenueData")} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-2 lg:grid-cols-3">
        <Card className="py-3 lg:col-span-1">
          <CardHeader className="px-3 pb-1.5 pt-0">
            <CardTitle className="text-sm font-semibold">{resolveLanguageKey("salesByPaymentType")}</CardTitle>
            <CardDescription className="text-2xs">{resolveLanguageKey("salesByPaymentTypeDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="px-3 pb-3 pt-0 max-w-md">
            <PaymentTypeChart salesByPaymentType={salesByPaymentType} noDataLabel={resolveLanguageKey("noPaymentTypeData")} />
          </CardContent>
        </Card>
        <div className="lg:col-span-2">
          <PortfolioValueChart {...dashboardSummaryToRevenueChart(summary)} />
        </div>
      </div>

      <StatusChart data={statusChartData} title={resolveLanguageKey("unitStatusBreakdown")} />
    </div>
  );
}

export default compose(
  withLanguage("src/modules/propertyManagement/clients/panel/private/overview/analytics/index.tsx")
)(Analytics);
