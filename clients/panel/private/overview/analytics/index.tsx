import { Building2, Wallet, Layers, TrendingUp, FileCheck } from "lucide-react";
import { AnalyticsChart, PaymentTypeChart, RevenueChart } from "./analytics-chart.tsx";
import { compose } from "redux";
import type { DashboardFormResponseType } from "armonia/src/modules/propertyManagement/api/realEstate/private/dashboard/dashboard.form.response.type.ts";
import {
  StatusChart,
  unitsByStatusToChartData,
} from "@propertyManagementModule/components/custom/dashboard/StatusChart.tsx";
import {
  RevenueChart as FinancialOverviewChart,
  dashboardSummaryToRevenueChart,
} from "@propertyManagementModule/components/custom/dashboard/revenueChart.tsx";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@coreModule/components/ui/card.tsx";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {KpiCard} from "@coreModule/components/custom/kpiCard.tsx";
import type {KpiDrillDownContext} from "@propertyManagementModule/helpers/dashboard/kpiDrillDown.ts";
import * as kpi from "@propertyManagementModule/helpers/dashboard/kpiDrillDown.ts";

type AnalyticsProps = WithLanguageType & {
  dashboardData: DashboardFormResponseType | null | undefined;
  drillDownContext: KpiDrillDownContext;
  viewEntriesLabel: string;
};

function Analytics({ resolveLanguageKey, dashboardData, drillDownContext, viewEntriesLabel }: AnalyticsProps) {
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
      <div className="space-y-3">
        <Card className="py-3">
          <CardHeader className="px-3 pb-1.5 pt-0">
            <CardTitle className="text-sm font-semibold">{resolveLanguageKey("title")}</CardTitle>
            <CardDescription className="text-[11px]">{resolveLanguageKey("description")}</CardDescription>
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
    <div className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard compact title={resolveLanguageKey("totalUnits")} value={totalUnits.toLocaleString()} subtitle={resolveLanguageKey("totalUnitsDesc")} icon={Layers} href={kpi.kpiUnitsTotal(ctx)} linkLabel={link} />
        <KpiCard compact title={resolveLanguageKey("activePaymentPlans")} value={activePaymentPlans.toLocaleString()} subtitle={resolveLanguageKey("activePaymentPlansDesc")} icon={Wallet} variant="warning" href={kpi.kpiActivePaymentPlans(ctx)} linkLabel={link} />
        <KpiCard compact title={resolveLanguageKey("overdueInstallments")} value={overdueInstallments.toLocaleString()} subtitle={resolveLanguageKey("overdueInstallmentsDesc")} icon={Wallet} variant="danger" href={kpi.kpiOverdueInstallments(ctx)} linkLabel={link} />
        <KpiCard compact title={resolveLanguageKey("totalOutstanding")} value={`$${totalOutstanding.toLocaleString()}`} subtitle={resolveLanguageKey("totalOutstandingDesc")} icon={Wallet} href={kpi.kpiTotalOutstanding(ctx)} linkLabel={link} />
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        <KpiCard compact title={resolveLanguageKey("totalProjects")} value={totalProjects.toLocaleString()} subtitle={resolveLanguageKey("totalProjectsDesc")} icon={Building2} href={kpi.kpiTotalProjects(ctx)} linkLabel={link} />
        <KpiCard compact title={resolveLanguageKey("totalEdifices")} value={totalEdifices.toLocaleString()} subtitle={resolveLanguageKey("totalEdificesDesc")} icon={Building2} href={kpi.kpiTotalEdifices(ctx)} linkLabel={link} />
        <KpiCard compact title={resolveLanguageKey("totalFloors")} value={totalFloors.toLocaleString()} subtitle={resolveLanguageKey("totalFloorsDesc")} icon={Layers} href={kpi.kpiTotalFloors(ctx)} linkLabel={link} />
        <KpiCard compact title={resolveLanguageKey("occupancyRate")} value={`${occupancyRatePercent.toFixed(1)}%`} subtitle={resolveLanguageKey("occupancyRateDesc")} icon={TrendingUp} variant="success" href={kpi.kpiOccupancyRate(ctx)} linkLabel={link} />
        <KpiCard compact title={resolveLanguageKey("followUpInspections")} value={followUpInspections.toLocaleString()} subtitle={resolveLanguageKey("followUpInspectionsDesc")} icon={FileCheck} href={kpi.kpiFollowUpInspections(ctx)} linkLabel={link} />
      </div>

      <div className="grid gap-2 lg:grid-cols-2">
        <Card className="py-3">
          <CardHeader className="px-3 pb-1.5 pt-0">
            <CardTitle className="text-sm font-semibold">{resolveLanguageKey("salesByMonth")}</CardTitle>
            <CardDescription className="text-[11px]">{resolveLanguageKey("salesByMonthDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="px-3 pb-3 pt-0">
            <AnalyticsChart salesByPeriod={salesByPeriod} noDataLabel={resolveLanguageKey("noSalesData")} />
          </CardContent>
        </Card>
        <Card className="py-3">
          <CardHeader className="px-3 pb-1.5 pt-0">
            <CardTitle className="text-sm font-semibold">{resolveLanguageKey("revenueByMonth")}</CardTitle>
            <CardDescription className="text-[11px]">{resolveLanguageKey("revenueByMonthDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="px-3 pb-3 pt-0">
            <RevenueChart revenueByPeriod={revenueByPeriod} noDataLabel={resolveLanguageKey("noRevenueData")} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-2 lg:grid-cols-3">
        <Card className="py-3 lg:col-span-1">
          <CardHeader className="px-3 pb-1.5 pt-0">
            <CardTitle className="text-sm font-semibold">{resolveLanguageKey("salesByPaymentType")}</CardTitle>
            <CardDescription className="text-[11px]">{resolveLanguageKey("salesByPaymentTypeDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="px-3 pb-3 pt-0 max-w-md">
            <PaymentTypeChart salesByPaymentType={salesByPaymentType} noDataLabel={resolveLanguageKey("noPaymentTypeData")} />
          </CardContent>
        </Card>
        <div className="lg:col-span-2">
          <FinancialOverviewChart {...dashboardSummaryToRevenueChart(summary)} />
        </div>
      </div>

      <StatusChart data={statusChartData} title={resolveLanguageKey("unitStatusBreakdown")} />
    </div>
  );
}

export default compose(
  withLanguage("src/modules/propertyManagement/clients/panel/private/overview/analytics/index.tsx")
)(Analytics);
