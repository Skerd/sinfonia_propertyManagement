import {IconBuildingSkyscraper, IconFileCheck, IconKey, IconStack2, IconTrendingUp, IconWallet} from "@tabler/icons-react";
import {
  GRID_KPI,
  DASHBOARD_TAB_STACK,
  DASHBOARD_TAB_INTRO,
} from "@coreModule/components/entityPage/list/entityCard.constants.ts";
import { AnalyticsChart, PaymentTypeChart, RevenueByPeriodChart } from "./analytics-chart.tsx";
import {formatNumber} from "@coreModule/helpers/general/numbers.ts";
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
import { DashboardKpiSection } from "@propertyManagementModule/components/custom/dashboard/DashboardKpiSection.tsx";
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

function Analytics({ resolveLanguageKey, dashboardData, drillDownContext, viewEntriesLabel }: AnalyticsProps) {
  const summary = dashboardData?.summary;
  const salesByPeriod = dashboardData?.salesByPeriod ?? [];
  const revenueByPeriod = dashboardData?.revenueByPeriod ?? [];
  const salesByPaymentType = summary?.salesByPaymentType ?? { cash: 0, payment_plan: 0 };

  const totalUnits = summary?.totalUnits ?? 0;
  const activePaymentPlans = summary?.paymentPlans?.byStatus?.active ?? 0;
  const overdueInstallments = summary?.paymentPlans?.overdueInstallmentsCount ?? 0;
  const totalProjects = summary?.totalProjects ?? 0;
  const totalEdifices = summary?.totalEdifices ?? 0;
  const totalFloors = summary?.totalFloors ?? 0;
  const occupancyRatePercent = summary?.occupancyRatePercent ?? 0;
  const followUpInspections = summary?.inspections?.followUpRequiredCount ?? 0;

  const hasData = summary != null;
  const portfolioChart = dashboardSummaryToRevenueChart(summary);
  const statusChartData = unitsByStatusToChartData(
    summary?.unitsByStatus ?? { available: 0, unavailable: 0, reserved: 0, sold: 0, leased: 0 }
  );

  const ctx = drillDownContext;
  const link = viewEntriesLabel;

  if (!hasData) {
    return (
      <div className={DASHBOARD_TAB_STACK}>
        <div className={DASHBOARD_TAB_INTRO}>
          <h2 className="text-sm font-semibold">{resolveLanguageKey("title")}</h2>
          <p className="text-xs text-muted-foreground">{resolveLanguageKey("description")}</p>
        </div>
        <Card className="py-3">
          <CardContent className="px-3 py-3">
            <div className="flex h-[260px] items-center justify-center text-muted-foreground text-xs">
              {resolveLanguageKey("loadOverviewFirst")}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={DASHBOARD_TAB_STACK}>
      <div className={DASHBOARD_TAB_INTRO}>
        <h2 className="text-sm font-semibold">{resolveLanguageKey("title")}</h2>
        <p className="text-xs text-muted-foreground">{resolveLanguageKey("description")}</p>
      </div>

      <DashboardKpiSection
        title={resolveLanguageKey("paymentPlansSection")}
        description={resolveLanguageKey("paymentPlansSectionDesc")}
      >
        <div className={GRID_KPI}>
          <KpiCard compact title={resolveLanguageKey("totalUnits")} value={formatNumber(totalUnits)} subtitle={resolveLanguageKey("totalUnitsDesc")} icon={IconStack2} href={kpi.kpiUnitsTotal(ctx)} linkLabel={link} />
          <KpiCard compact title={resolveLanguageKey("activePaymentPlans")} value={formatNumber(activePaymentPlans)} subtitle={resolveLanguageKey("activePaymentPlansDesc")} icon={IconWallet} variant="warning" href={kpi.kpiActivePaymentPlans(ctx)} linkLabel={link} />
          <KpiCard compact title={resolveLanguageKey("overdueInstallments")} value={formatNumber(overdueInstallments)} subtitle={resolveLanguageKey("overdueInstallmentsDesc")} icon={IconWallet} variant="danger" href={kpi.kpiOverdueInstallments(ctx)} linkLabel={link} />
          <KpiCard compact title={resolveLanguageKey("totalOutstanding")} value={formatRevenueByCurrencyLines(summary?.paymentPlans?.totalOutstanding)} subtitle={resolveLanguageKey("totalOutstandingDesc")} icon={IconWallet} href={kpi.kpiTotalOutstanding(ctx)} linkLabel={link} />
        </div>
      </DashboardKpiSection>

      <DashboardKpiSection
        title={resolveLanguageKey("rentalsSection")}
        description={resolveLanguageKey("rentalsSectionDesc")}
      >
        <div className={GRID_KPI}>
          <KpiCard compact title={resolveLanguageKey("rentCollected")} value={formatRevenueByCurrencyLines(summary?.rentals?.collectedAmount)} subtitle={resolveLanguageKey("rentCollectedDesc")} icon={IconWallet} variant="success" href="/realEstate/rentalsHub" linkLabel={link} />
          <KpiCard compact title={resolveLanguageKey("rentOutstanding")} value={formatRevenueByCurrencyLines(summary?.rentals?.outstandingAmount)} subtitle={resolveLanguageKey("rentOutstandingDesc")} icon={IconWallet} variant="warning" href="/realEstate/rentalsHub" linkLabel={link} />
          <KpiCard compact title={resolveLanguageKey("rentOverdue")} value={formatRevenueByCurrencyLines(summary?.rentals?.overdueAmount)} subtitle={resolveLanguageKey("rentOverdueDesc")} icon={IconWallet} variant="danger" href="/realEstate/rentalsHub" linkLabel={link} />
          <KpiCard compact title={resolveLanguageKey("activeLeases")} value={formatNumber(summary?.rentals?.activeLeases ?? 0)} subtitle={resolveLanguageKey("activeLeasesDesc")} icon={IconKey} href="/realEstate/rentalsHub" linkLabel={link} />
        </div>
      </DashboardKpiSection>

      <DashboardKpiSection
        title={resolveLanguageKey("portfolioSection")}
        description={resolveLanguageKey("portfolioSectionDesc")}
      >
        <div className={GRID_KPI}>
          <KpiCard compact title={resolveLanguageKey("totalProjects")} value={formatNumber(totalProjects)} subtitle={resolveLanguageKey("totalProjectsDesc")} icon={IconBuildingSkyscraper} href={kpi.kpiTotalProjects(ctx)} linkLabel={link} />
          <KpiCard compact title={resolveLanguageKey("totalEdifices")} value={formatNumber(totalEdifices)} subtitle={resolveLanguageKey("totalEdificesDesc")} icon={IconBuildingSkyscraper} href={kpi.kpiTotalEdifices(ctx)} linkLabel={link} />
          <KpiCard compact title={resolveLanguageKey("totalFloors")} value={formatNumber(totalFloors)} subtitle={resolveLanguageKey("totalFloorsDesc")} icon={IconStack2} href={kpi.kpiTotalFloors(ctx)} linkLabel={link} />
          <KpiCard compact title={resolveLanguageKey("occupancyRate")} value={`${occupancyRatePercent.toFixed(1)}%`} subtitle={resolveLanguageKey("occupancyRateDesc")} icon={IconTrendingUp} variant="success" href={kpi.kpiOccupancyRate(ctx)} linkLabel={link} />
          <KpiCard compact title={resolveLanguageKey("followUpInspections")} value={formatNumber(followUpInspections)} subtitle={resolveLanguageKey("followUpInspectionsDesc")} icon={IconFileCheck} href={kpi.kpiFollowUpInspections(ctx)} linkLabel={link} />
        </div>
      </DashboardKpiSection>

      <div className="grid min-w-0 gap-3 lg:grid-cols-2">
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

      <div className="grid min-w-0 gap-3 lg:grid-cols-3">
        <Card className="py-3 lg:col-span-1">
          <CardHeader className="px-3 pb-1.5 pt-0">
            <CardTitle className="text-sm font-semibold">{resolveLanguageKey("salesByPaymentType")}</CardTitle>
            <CardDescription className="text-2xs">{resolveLanguageKey("salesByPaymentTypeDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="px-3 pb-3 pt-0 max-w-md">
            <PaymentTypeChart salesByPaymentType={salesByPaymentType} noDataLabel={resolveLanguageKey("noPaymentTypeData")} />
          </CardContent>
        </Card>
        <div className="min-w-0 lg:col-span-2">
          <PortfolioValueChart series={portfolioChart} />
        </div>
      </div>

      <StatusChart data={statusChartData} title={resolveLanguageKey("unitStatusBreakdown")} />
    </div>
  );
}

export default compose(
  withLanguage("src/modules/propertyManagement/clients/panel/private/overview/analytics/index.tsx")
)(Analytics);
