import { compose } from "redux";
import {formatCurrency, formatNumber} from "@coreModule/helpers/general";
import {GRID_KPI} from "@coreModule/components/custom/cards/entityCard.constants.ts";
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
} from "armonia/src/modules/propertyManagement/api/realEstate/private/dashboard/dashboard.form.response.type.ts";
import { ActionException } from "armonia/src/modules/core/types";
import {
  StatusChart,
  unitsByStatusToChartData,
} from "@propertyManagementModule/components/custom/dashboard/StatusChart.tsx";
import { PaymentAlerts } from "@propertyManagementModule/components/custom/dashboard/paymentAlerts.tsx";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {ErrorView} from "@coreModule/components/custom/errorView.tsx";
import Loader from "@coreModule/components/custom/loader.tsx";
import {KpiCard} from "@coreModule/components/custom/kpiCard.tsx";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@coreModule/components/ui/card.tsx";
import type {KpiDrillDownContext} from "@propertyManagementModule/helpers/dashboard/kpiDrillDown.ts";
import * as kpi from "@propertyManagementModule/helpers/dashboard/kpiDrillDown.ts";

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
  const raw = dashboardData as unknown as { paymentAlerts?: unknown[] } | null;
  const paymentAlerts = raw?.paymentAlerts && Array.isArray(raw.paymentAlerts) ? raw.paymentAlerts : undefined;

  const totalRevenue = summary?.totalRevenue?.reduce((acc, r) => acc + r.value, 0) ?? 0;
  const activeReservations = summary?.activeReservations ?? 0;
  const totalSales = summary?.totalSales ?? 0;
  const unitsSold = summary?.unitsByStatus?.sold ?? 0;
  const averageSalePrice = summary?.averageSalePrice ?? 0;
  const inventoryValue = summary?.inventoryValue ?? 0;
  const cashSales = summary?.salesByPaymentType?.cash ?? 0;
  const paymentPlanSales = summary?.salesByPaymentType?.payment_plan ?? 0;
  const occupancyRatePercent = summary?.occupancyRatePercent ?? 0;
  const totalInspections = summary?.totalInspections ?? 0;
  const openModificationRequests = summary?.openModificationRequests ?? 0;
  const expiringReservationsCount = summary?.expiringReservationsCount ?? 0;
  const totalReservationDeposits = summary?.totalReservationDeposits ?? 0;
  const paymentPlansCompleted = summary?.paymentPlansCompleted ?? 0;
  const revenueTrend = dashboardData?.comparisons?.revenue;
  const salesTrend = dashboardData?.comparisons?.sales;
  const verifiedPaidCostsSum =
    summary?.verifiedPaidUnitCosts?.reduce((acc, r) => acc + (r?.value ?? 0), 0) ?? 0;
  const verifiedOutstandingCostsSum =
    summary?.verifiedOutstandingUnitCosts?.reduce((acc, r) => acc + (r?.value ?? 0), 0) ?? 0;
  const pendingVerificationCostsSum =
    summary?.pendingVerificationUnitCosts?.reduce((acc, r) => acc + (r?.value ?? 0), 0) ?? 0;
  const unitCostDocsCount = summary?.totalUnitCostDocuments ?? 0;

  const statusChartData = summary?.unitsByStatus
    ? unitsByStatusToChartData(summary.unitsByStatus)
    : { available: 0, reserved: 0, sold: 0, blocked: 0, leased: 0 };

  const revenueSubtitle =
    summary?.totalRevenue?.length && summary.totalRevenue.length > 1
      ? `${summary.totalRevenue.length} ${resolveLanguageKey("currencyCountSuffix")}`
      : resolveLanguageKey("allTime");

  const ctx = drillDownContext;
  const link = viewEntriesLabel;

  return (
    <div className="flex flex-col gap-3 flex-full">
      {/* Primary KPIs */}
      <div>
        <h2 className="sr-only">{resolveLanguageKey("primaryKpis")}</h2>
        <div className={GRID_KPI}>
          <KpiCard
            compact
            title={resolveLanguageKey("totalRevenue")}
            value={formatCurrency(totalRevenue)}
            subtitle={revenueSubtitle}
            icon={IconCoin as never}
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
            icon={IconUsers as never}
            variant="warning"
            href={kpi.kpiActiveReservations(ctx)}
            linkLabel={link}
          />
          <KpiCard
            compact
            title={resolveLanguageKey("sales")}
            value={formatNumber(totalSales)}
            subtitle={resolveLanguageKey("totalSalesDesc")}
            icon={IconCreditCard as never}
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
            icon={IconTrendingUp as never}
            variant="success"
            href={kpi.kpiUnitsSold(ctx)}
            linkLabel={link}
          />
        </div>
      </div>

       {/*Financial KPIs*/}
      <div>
        <h2 className="sr-only">{resolveLanguageKey("financialKpis")}</h2>
        <div className={GRID_KPI}>
          <KpiCard
            compact
            title={resolveLanguageKey("averageSalePrice")}
            value={formatCurrency(averageSalePrice)}
            subtitle={resolveLanguageKey("averageSalePriceDesc")}
            icon={IconCoin as never}
            variant="default"
            href={kpi.kpiAverageSalePrice(ctx)}
            linkLabel={link}
          />
          <KpiCard
            compact
            title={resolveLanguageKey("inventoryValue")}
            value={formatCurrency(inventoryValue)}
            subtitle={resolveLanguageKey("inventoryValueDesc")}
            icon={IconPackage as never}
            variant="default"
            href={kpi.kpiInventoryValue(ctx)}
            linkLabel={link}
          />
          <KpiCard
            compact
            title={resolveLanguageKey("cashSales")}
            value={formatNumber(cashSales)}
            subtitle={resolveLanguageKey("cashSalesDesc")}
            icon={IconCash as never}
            variant="default"
            href={kpi.kpiCashSales(ctx)}
            linkLabel={link}
          />
          <KpiCard
            compact
            title={resolveLanguageKey("paymentPlanSales")}
            value={formatNumber(paymentPlanSales)}
            subtitle={resolveLanguageKey("paymentPlanSalesDesc")}
            icon={IconReceipt as never}
            variant="default"
            href={kpi.kpiPaymentPlanSales(ctx)}
            linkLabel={link}
          />
          <KpiCard
            compact
            title={resolveLanguageKey("occupancyRatePercent")}
            value={`${occupancyRatePercent.toFixed(1)}%`}
            subtitle={resolveLanguageKey("occupancyRatePercentDesc")}
            icon={IconPercentage as never}
            variant="default"
            href={kpi.kpiOccupancyRate(ctx)}
            linkLabel={link}
          />
        </div>
      </div>

      {/* Unit-cost KPIs (verified / procurement pipeline) */}
      <div>
        <h2 className="sr-only">{resolveLanguageKey("unitCostsKpis")}</h2>
        <div className={GRID_KPI}>
          <KpiCard
            compact
            title={resolveLanguageKey("verifiedPaidCosts")}
            value={formatCurrency(verifiedPaidCostsSum)}
            subtitle={resolveLanguageKey("verifiedPaidCostsDesc")}
            icon={IconReceipt as never}
            variant="default"
            href={kpi.kpiVerifiedPaidCosts(ctx)}
            linkLabel={link}
          />
          <KpiCard
            compact
            title={resolveLanguageKey("verifiedOutstandingCosts")}
            value={formatCurrency(verifiedOutstandingCostsSum)}
            subtitle={resolveLanguageKey("verifiedOutstandingCostsDesc")}
            icon={IconReceipt as never}
            variant="warning"
            href={kpi.kpiVerifiedOutstandingCosts(ctx)}
            linkLabel={link}
          />
          <KpiCard
            compact
            title={resolveLanguageKey("pendingVerificationCosts")}
            value={formatCurrency(pendingVerificationCostsSum)}
            subtitle={resolveLanguageKey("pendingVerificationCostsDesc")}
            icon={IconFileText as never}
            variant="default"
            href={kpi.kpiPendingVerificationCosts(ctx)}
            linkLabel={link}
          />
          <KpiCard
            compact
            title={resolveLanguageKey("totalUnitCostDocuments")}
            value={formatNumber(unitCostDocsCount)}
            subtitle={resolveLanguageKey("totalUnitCostDocumentsDesc")}
            icon={IconPackage as never}
            variant="default"
            href={kpi.kpiTotalUnitCostDocuments(ctx)}
            linkLabel={link}
          />
        </div>
      </div>

       {/*Operations KPIs*/}
      <div className="hidden sm:block">
        <h2 className="sr-only">{resolveLanguageKey("operationsKpis")}</h2>
        <div className={GRID_KPI}>
          <KpiCard
            compact
            title={resolveLanguageKey("totalInspections")}
            value={formatNumber(totalInspections)}
            subtitle={resolveLanguageKey("totalInspectionsDesc")}
            icon={IconFileCheck as never}
            variant="default"
            href={kpi.kpiTotalInspections(ctx)}
            linkLabel={link}
          />
          <KpiCard
            compact
            title={resolveLanguageKey("openModificationRequests")}
            value={formatNumber(openModificationRequests)}
            subtitle={resolveLanguageKey("openModificationRequestsDesc")}
            icon={IconFileText as never}
            variant="default"
            href={kpi.kpiOpenModificationRequests(ctx)}
            linkLabel={link}
          />
          <KpiCard
            compact
            title={resolveLanguageKey("expiringReservationsCount")}
            value={formatNumber(expiringReservationsCount)}
            subtitle={resolveLanguageKey("expiringReservationsCountDesc")}
            icon={IconClock as never}
            variant="warning"
            href={kpi.kpiExpiringReservations(ctx)}
            linkLabel={link}
          />
          <KpiCard
            compact
            title={resolveLanguageKey("totalReservationDeposits")}
            value={formatCurrency(totalReservationDeposits)}
            subtitle={resolveLanguageKey("totalReservationDepositsDesc")}
            icon={IconWallet as never}
            variant="default"
            href={kpi.kpiReservationDeposits(ctx)}
            linkLabel={link}
          />
          <KpiCard
            compact
            title={resolveLanguageKey("paymentPlansCompleted")}
            value={formatNumber(paymentPlansCompleted)}
            subtitle={resolveLanguageKey("paymentPlansCompletedDesc")}
            icon={IconCircleCheck as never}
            variant="success"
            href={kpi.kpiPaymentPlansCompleted(ctx)}
            linkLabel={link}
          />
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-2 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <StatusChart
            data={statusChartData}
            title={resolveLanguageKey("unitStatusBreakdown")}
          />
        </div>
        <PaymentAlerts
          overdueCount={summary?.paymentPlans?.overdueInstallmentsCount ?? 0}
          alerts={paymentAlerts}
          title={resolveLanguageKey("paymentAlerts")}
          viewAllLabel={resolveLanguageKey("viewPaymentPlans")}
        />
      </div>

      {/* Revenue chart + Recent sales */}
      <div className="grid grid-cols-1 gap-2 lg:grid-cols-7">
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
