import { compose } from "redux";
import {formatNumber} from "@coreModule/helpers/general/numbers.ts";
import {formatRevenueByCurrencyLines} from "@propertyManagementModule/helpers/rentals/formatRevenueByCurrency.ts";
import {GRID_KPI, DASHBOARD_TAB_STACK, DASHBOARD_CHART_GRID} from "@coreModule/components/entityPage/list/entityCard.constants.ts";
import {
  IconCash,
  IconCircleCheck,
  IconClock,
  IconCoin,
  IconCreditCard,
  IconFileCheck,
  IconFileText,
  IconPackage,
  IconPercentage,
  IconReceipt,
  IconTrendingUp,
  IconUsers,
  IconWallet,
} from "@tabler/icons-react";
import { Overview } from "./overview.tsx";
import { RecentSales } from "./recent-sales.tsx";
import type {
  DashboardFormResponseType,
  DashboardSummary,
  RevenueByCurrency,
} from "armonia/src/modules/propertyManagement/api/realEstate/private/dashboard/dashboard.form.response.type.ts";
import { ActionException } from "armonia/src/modules/core/types";
import {
  StatusChart,
  unitsByStatusToChartData,
} from "@propertyManagementModule/components/custom/dashboard/StatusChart.tsx";
import { PaymentAlerts } from "@propertyManagementModule/components/custom/dashboard/paymentAlerts.tsx";
import { DashboardKpiSection } from "@propertyManagementModule/components/custom/dashboard/DashboardKpiSection.tsx";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {ErrorView} from "@coreModule/components/custom/errors/errorView.tsx";
import Loader from "@coreModule/components/custom/loader/loader.tsx";
import {KpiCard} from "@coreModule/components/custom/kpiCard.tsx";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@coreModule/components/ui/card.tsx";
import type {KpiDrillDownContext} from "@propertyManagementModule/helpers/dashboard/kpiDrillDown.ts";
import * as kpi from "@propertyManagementModule/helpers/dashboard/kpiDrillDown.ts";
import {companyToday} from "@coreModule/helpers/general/dateTime.ts";
import {useCompanyTimeZone} from "@coreModule/helpers/hooks/useCompanyTimeZone.ts";

type DashboardOverviewProps = WithLanguageType & {
  dashboardData: DashboardFormResponseType | null | undefined;
  loading: boolean;
  error: ActionException | null;
  onRefresh: () => void;
  drillDownContext: KpiDrillDownContext;
  viewEntriesLabel: string;
};

function DashboardOverview({
  resolveLanguageKey,
  dashboardData,
  loading,
  error,
  onRefresh,
  drillDownContext,
  viewEntriesLabel,
}: DashboardOverviewProps) {
  const timeZone = useCompanyTimeZone();
  if (loading) {
    return <Loader />;
  }
  if (error) {
    return (
      <ErrorView
        title={resolveLanguageKey("failTitle")}
        description={resolveLanguageKey("failDescription")}
        onClick={onRefresh}
      />
    );
  }

  const summary: DashboardSummary | undefined = dashboardData?.summary;
  const revenueByPeriod = dashboardData?.revenueByPeriod ?? [];
  const recentSales = dashboardData?.recentSales ?? [];
  const paymentAlerts = dashboardData?.paymentAlerts;

  const activeReservations = summary?.activeReservations ?? 0;
  const totalSales = summary?.totalSales ?? 0;
  const unitsSold = summary?.unitsByStatus?.sold ?? 0;
  const cashSales = summary?.salesByPaymentType?.cash ?? 0;
  const paymentPlanSales = summary?.salesByPaymentType?.payment_plan ?? 0;
  const occupancyRatePercent = summary?.occupancyRatePercent ?? 0;
  const totalInspections = summary?.totalInspections ?? 0;
  const openModificationRequests = summary?.openModificationRequests ?? 0;
  const expiringReservationsCount = summary?.expiringReservationsCount ?? 0;
  const paymentPlansCompleted = summary?.paymentPlansCompleted ?? 0;
  const revenueTrend = dashboardData?.comparisons?.revenue;
  const salesTrend = dashboardData?.comparisons?.sales;
  // Money is shown per currency, never summed across currencies (GLB-08).
  const money = (rows: RevenueByCurrency[] | undefined) => formatRevenueByCurrencyLines(rows);
  const unitCostDocsCount = summary?.totalUnitCostDocuments ?? 0;

  const statusChartData = summary?.unitsByStatus
    ? unitsByStatusToChartData(summary.unitsByStatus)
    : { available: 0, reserved: 0, sold: 0, blocked: 0, leased: 0 };

  const revenueSubtitle =
    summary?.totalRevenue?.length && summary.totalRevenue.length > 1
      ? `${summary.totalRevenue.length} ${resolveLanguageKey("currencyCountSuffix")}`
      : resolveLanguageKey("inSelectedPeriod");

  const ctx = drillDownContext;
  const link = viewEntriesLabel;

  return (
    <div className={DASHBOARD_TAB_STACK}>
      {/* Primary KPIs */}
      <DashboardKpiSection
        title={resolveLanguageKey("primaryKpis")}
        description={resolveLanguageKey("primaryKpisDesc")}
      >
        <div className={GRID_KPI}>
          <KpiCard
            compact
            title={resolveLanguageKey("totalRevenue")}
            value={money(summary?.totalRevenue)}
            subtitle={revenueSubtitle}
            icon={IconCoin}
            variant="primary"
            href={kpi.kpiTotalRevenue(ctx)}
            linkLabel={link}
            trend={
              revenueTrend != null
                ? {
                    value: Math.round(revenueTrend.percentageChange),
                    isPositive: revenueTrend.percentageChange >= 0,
                  }
                : undefined
            }
          />
          <KpiCard
            compact
            title={resolveLanguageKey("activeReservations")}
            value={formatNumber(activeReservations)}
            subtitle={resolveLanguageKey("activeReservationsDesc")}
            icon={IconUsers}
            variant="warning"
            href={kpi.kpiActiveReservations(ctx)}
            linkLabel={link}
          />
          <KpiCard
            compact
            title={resolveLanguageKey("sales")}
            value={formatNumber(totalSales)}
            subtitle={resolveLanguageKey("totalSalesDesc")}
            icon={IconCreditCard}
            variant="success"
            href={kpi.kpiTotalSales(ctx)}
            linkLabel={link}
            trend={
              salesTrend != null
                ? {
                    value: Math.round(salesTrend.percentageChange),
                    isPositive: salesTrend.percentageChange >= 0,
                  }
                : undefined
            }
          />
          <KpiCard
            compact
            title={resolveLanguageKey("unitsSold")}
            value={formatNumber(unitsSold)}
            subtitle={resolveLanguageKey("unitsSoldDesc")}
            icon={IconTrendingUp}
            variant="success"
            href={kpi.kpiUnitsSold(ctx)}
            linkLabel={link}
          />
        </div>
      </DashboardKpiSection>

       {/*Financial KPIs*/}
      <DashboardKpiSection
        title={resolveLanguageKey("financialKpis")}
        description={resolveLanguageKey("financialKpisDesc")}
      >
        <div className={GRID_KPI}>
          <KpiCard
            compact
            title={resolveLanguageKey("averageSalePrice")}
            value={money(summary?.averageSalePrice)}
            subtitle={resolveLanguageKey("averageSalePriceDesc")}
            icon={IconCoin}
            variant="default"
            href={kpi.kpiAverageSalePrice(ctx)}
            linkLabel={link}
          />
          <KpiCard
            compact
            title={resolveLanguageKey("inventoryValue")}
            value={money(summary?.inventoryValue)}
            subtitle={resolveLanguageKey("inventoryValueDesc")}
            icon={IconPackage}
            variant="default"
            href={kpi.kpiInventoryValue(ctx)}
            linkLabel={link}
          />
          <KpiCard
            compact
            title={resolveLanguageKey("cashSales")}
            value={formatNumber(cashSales)}
            subtitle={resolveLanguageKey("cashSalesDesc")}
            icon={IconCash}
            variant="default"
            href={kpi.kpiCashSales(ctx)}
            linkLabel={link}
          />
          <KpiCard
            compact
            title={resolveLanguageKey("paymentPlanSales")}
            value={formatNumber(paymentPlanSales)}
            subtitle={resolveLanguageKey("paymentPlanSalesDesc")}
            icon={IconReceipt}
            variant="default"
            href={kpi.kpiPaymentPlanSales(ctx)}
            linkLabel={link}
          />
          <KpiCard
            compact
            title={resolveLanguageKey("occupancyRatePercent")}
            value={`${occupancyRatePercent.toFixed(1)}%`}
            subtitle={resolveLanguageKey("occupancyRatePercentDesc")}
            icon={IconPercentage}
            variant="default"
            href={kpi.kpiOccupancyRate(ctx)}
            linkLabel={link}
          />
        </div>
      </DashboardKpiSection>

      {/* Unit-cost KPIs (verified / procurement pipeline) */}
      <DashboardKpiSection
        title={resolveLanguageKey("unitCostsKpis")}
        description={resolveLanguageKey("unitCostsKpisDesc")}
      >
        <div className={GRID_KPI}>
          <KpiCard
            compact
            title={resolveLanguageKey("verifiedPaidCosts")}
            value={money(summary?.verifiedPaidUnitCosts)}
            subtitle={resolveLanguageKey("verifiedPaidCostsDesc")}
            icon={IconReceipt}
            variant="default"
            href={kpi.kpiVerifiedPaidCosts(ctx)}
            linkLabel={link}
          />
          <KpiCard
            compact
            title={resolveLanguageKey("verifiedOutstandingCosts")}
            value={money(summary?.verifiedOutstandingUnitCosts)}
            subtitle={resolveLanguageKey("verifiedOutstandingCostsDesc")}
            icon={IconReceipt}
            variant="warning"
            href={kpi.kpiVerifiedOutstandingCosts(ctx)}
            linkLabel={link}
          />
          <KpiCard
            compact
            title={resolveLanguageKey("pendingVerificationCosts")}
            value={money(summary?.pendingVerificationUnitCosts)}
            subtitle={resolveLanguageKey("pendingVerificationCostsDesc")}
            icon={IconFileText}
            variant="default"
            href={kpi.kpiPendingVerificationCosts(ctx)}
            linkLabel={link}
          />
          <KpiCard
            compact
            title={resolveLanguageKey("totalUnitCostDocuments")}
            value={formatNumber(unitCostDocsCount)}
            subtitle={resolveLanguageKey("totalUnitCostDocumentsDesc")}
            icon={IconPackage}
            variant="default"
            href={kpi.kpiTotalUnitCostDocuments(ctx)}
            linkLabel={link}
          />
        </div>
      </DashboardKpiSection>

       {/*Operations KPIs*/}
      <DashboardKpiSection
        className="hidden sm:flex"
        title={resolveLanguageKey("operationsKpis")}
        description={resolveLanguageKey("operationsKpisDesc")}
      >
        <div className={GRID_KPI}>
          <KpiCard
            compact
            title={resolveLanguageKey("totalInspections")}
            value={formatNumber(totalInspections)}
            subtitle={resolveLanguageKey("totalInspectionsDesc")}
            icon={IconFileCheck}
            variant="default"
            href={kpi.kpiTotalInspections(ctx)}
            linkLabel={link}
          />
          <KpiCard
            compact
            title={resolveLanguageKey("openModificationRequests")}
            value={formatNumber(openModificationRequests)}
            subtitle={resolveLanguageKey("openModificationRequestsDesc")}
            icon={IconFileText}
            variant="default"
            href={kpi.kpiOpenModificationRequests(ctx)}
            linkLabel={link}
          />
          <KpiCard
            compact
            title={resolveLanguageKey("expiringReservationsCount")}
            value={formatNumber(expiringReservationsCount)}
            subtitle={resolveLanguageKey("expiringReservationsCountDesc")}
            icon={IconClock}
            variant="warning"
            href={kpi.kpiExpiringReservations(ctx, companyToday(timeZone))}
            linkLabel={link}
          />
          <KpiCard
            compact
            title={resolveLanguageKey("totalReservationDeposits")}
            value={money(summary?.totalReservationDeposits)}
            subtitle={resolveLanguageKey("totalReservationDepositsDesc")}
            icon={IconWallet}
            variant="default"
            href={kpi.kpiReservationDeposits(ctx)}
            linkLabel={link}
          />
          <KpiCard
            compact
            title={resolveLanguageKey("paymentPlansCompleted")}
            value={formatNumber(paymentPlansCompleted)}
            subtitle={resolveLanguageKey("paymentPlansCompletedDesc")}
            icon={IconCircleCheck}
            variant="success"
            href={kpi.kpiPaymentPlansCompleted(ctx)}
            linkLabel={link}
          />
        </div>
      </DashboardKpiSection>

      {/* Charts row */}
      <div className={DASHBOARD_CHART_GRID}>
        <div className="lg:col-span-2">
          <StatusChart
            data={statusChartData}
            title={resolveLanguageKey("unitStatusBreakdown")}
          />
        </div>
        <PaymentAlerts
          overdueCount={(summary?.paymentPlans?.overdueInstallmentsCount ?? 0) + (summary?.rentals?.overdueCount ?? 0)}
          alerts={paymentAlerts}
          title={resolveLanguageKey("paymentAlerts")}
          viewAllLabel={resolveLanguageKey("viewPaymentPlans")}
          drillDownContext={ctx}
        />
      </div>

      {/* Revenue chart + Recent sales */}
      <div className="grid min-w-0 grid-cols-1 gap-3 lg:grid-cols-7">
        <Card className="col-span-1 py-3 lg:col-span-4">
          <CardHeader className="px-3 pb-1.5 pt-0">
            <CardTitle className="text-sm font-semibold">{resolveLanguageKey("overview")}</CardTitle>
            <CardDescription className="text-2xs">{resolveLanguageKey("revenueByMonth")}</CardDescription>
          </CardHeader>
          <CardContent className="px-3 pb-3 ps-1.5 pt-0">
            <Overview
              revenueByPeriod={revenueByPeriod}
              noDataLabel={resolveLanguageKey("noRevenueData")}
            />
          </CardContent>
        </Card>
        <Card className="col-span-1 py-3 lg:col-span-3">
          <CardHeader className="px-3 pb-1.5 pt-0">
            <CardTitle className="text-sm font-semibold">{resolveLanguageKey("recentSales")}</CardTitle>
            <CardDescription className="text-2xs">
              {recentSales.length} {resolveLanguageKey("salesSmall")}
            </CardDescription>
          </CardHeader>
          <CardContent className="px-3 pb-3 pt-0">
            <RecentSales
              recentSales={recentSales}
              noSalesLabel={resolveLanguageKey("noRecentSales")}
              unitLabelPrefix={resolveLanguageKey("unitLabel")}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default compose(
  withLanguage("src/modules/propertyManagement/clients/panel/private/overview/overview/index.tsx")
)(DashboardOverview);
