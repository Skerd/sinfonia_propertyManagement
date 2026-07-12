import { compose } from "redux";
import type { DashboardFormResponseType } from "armonia/src/modules/propertyManagement/api/realEstate/private/dashboard/dashboard.form.response.type.ts";
import { ActionException } from "armonia/src/modules/core/types";
import {
  StatusChart,
  unitsByStatusToChartData,
} from "@propertyManagementModule/components/custom/dashboard/StatusChart.tsx";
import { Layers, TrendingUp, Wallet, Users, Receipt, KeyRound } from "lucide-react";
import AllUnits from "@propertyManagementModule/clients/panel/private/units";
import {ErrorView} from "@coreModule/components/custom/errorView.tsx";
import Loader from "@coreModule/components/custom/loader.tsx";
import {KpiCard} from "@coreModule/components/custom/kpiCard.tsx";
import withLanguage, { WithLanguageType } from "@coreModule/helpers/hocs/withLanguage.tsx";
import type {KpiDrillDownContext} from "@propertyManagementModule/helpers/dashboard/kpiDrillDown.ts";
import * as kpi from "@propertyManagementModule/helpers/dashboard/kpiDrillDown.ts";

type UnitsTabProps = WithLanguageType & {
  dashboardData: DashboardFormResponseType | null | undefined;
  loading: boolean;
  error: ActionException | null;
  onRefresh: () => void;
  drillDownContext: KpiDrillDownContext;
  viewEntriesLabel: string;
};

function UnitsTab({ resolveLanguageKey, dashboardData, loading, error, onRefresh, drillDownContext, viewEntriesLabel }: UnitsTabProps) {

  if (loading) return <Loader />;
  if (error) {
    return (
      <ErrorView
        title={resolveLanguageKey("failTitle")}
        description={resolveLanguageKey("failDescription")}
        onClick={onRefresh}
      />
    );
  }

  const summary = dashboardData?.summary;
  const totalUnits = summary?.totalUnits ?? 0;
  const available = summary?.unitsByStatus?.available ?? 0;
  const reserved = summary?.unitsByStatus?.reserved ?? 0;
  const sold = summary?.unitsByStatus?.sold ?? 0;
  const leased = summary?.unitsByStatus?.leased ?? 0;
  const unavailable = summary?.unitsByStatus?.unavailable ?? 0;
  const occupancyRatePercent = summary?.occupancyRatePercent ?? 0;
  const inventoryValue = summary?.inventoryValue ?? 0;
  const activeReservations = summary?.activeReservations ?? 0;
  const verifiedPaidCostsSum =
    summary?.verifiedPaidUnitCosts?.reduce((acc, r) => acc + (r?.value ?? 0), 0) ?? 0;
  const verifiedOutstandingCostsSum =
    summary?.verifiedOutstandingUnitCosts?.reduce((acc, r) => acc + (r?.value ?? 0), 0) ?? 0;
  const unitCostDocsCount = summary?.totalUnitCostDocuments ?? 0;

  const statusChartData = summary?.unitsByStatus
    ? unitsByStatusToChartData(summary.unitsByStatus)
    : { available: 0, reserved: 0, sold: 0, blocked: 0, leased: 0 };

  const ctx = drillDownContext;
  const link = viewEntriesLabel;

  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-sm font-semibold mb-1">{resolveLanguageKey("title")}</h2>
        <p className="text-muted-foreground text-xs">{resolveLanguageKey("description")}</p>
      </div>

      <StatusChart data={statusChartData} title={resolveLanguageKey("unitStatusBreakdown")} />

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        <KpiCard compact title={resolveLanguageKey("totalUnits")} value={totalUnits.toLocaleString()} subtitle={resolveLanguageKey("totalUnitsDesc")} icon={Layers} href={kpi.kpiUnitsTotal(ctx)} linkLabel={link} />
        <KpiCard compact title={resolveLanguageKey("available")} value={available.toLocaleString()} subtitle={resolveLanguageKey("availableDesc")} icon={Layers} variant="primary" href={kpi.kpiUnitsAvailable(ctx)} linkLabel={link} />
        <KpiCard compact title={resolveLanguageKey("reserved")} value={reserved.toLocaleString()} subtitle={resolveLanguageKey("reservedDesc")} icon={Users} variant="warning" href={kpi.kpiUnitsReserved(ctx)} linkLabel={link} />
        <KpiCard compact title={resolveLanguageKey("sold")} value={sold.toLocaleString()} subtitle={resolveLanguageKey("soldDesc")} icon={TrendingUp} variant="success" href={kpi.kpiUnitsSold(ctx)} linkLabel={link} />
        <KpiCard compact title={resolveLanguageKey("leased")} value={leased.toLocaleString()} subtitle={resolveLanguageKey("leasedDesc")} icon={KeyRound} href={kpi.kpiUnitsRented(ctx)} linkLabel={link} />
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard compact title={resolveLanguageKey("unavailable")} value={unavailable.toLocaleString()} subtitle={resolveLanguageKey("unavailableDesc")} icon={Layers} variant="danger" href={kpi.kpiUnitsUnavailable(ctx)} linkLabel={link} />
        <KpiCard compact title={resolveLanguageKey("occupancyRate")} value={`${occupancyRatePercent.toFixed(1)}%`} subtitle={resolveLanguageKey("occupancyRateDesc")} icon={TrendingUp} variant="success" href={kpi.kpiOccupancyRate(ctx)} linkLabel={link} />
        <KpiCard compact title={resolveLanguageKey("inventoryValue")} value={`$${inventoryValue.toLocaleString()}`} subtitle={resolveLanguageKey("inventoryValueDesc")} icon={Wallet} href={kpi.kpiInventoryValue(ctx)} linkLabel={link} />
        <KpiCard compact title={resolveLanguageKey("activeReservations")} value={activeReservations.toLocaleString()} subtitle={resolveLanguageKey("activeReservationsDesc")} icon={Users} href={kpi.kpiActiveReservations(ctx)} linkLabel={link} />
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        <KpiCard compact title={resolveLanguageKey("verifiedPaidCosts")} value={`$${verifiedPaidCostsSum.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} subtitle={resolveLanguageKey("verifiedPaidCostsDesc")} icon={Receipt} href={kpi.kpiVerifiedPaidCosts(ctx)} linkLabel={link} />
        <KpiCard compact title={resolveLanguageKey("verifiedOutstandingCosts")} value={`$${verifiedOutstandingCostsSum.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} subtitle={resolveLanguageKey("verifiedOutstandingCostsDesc")} icon={Receipt} variant="warning" href={kpi.kpiVerifiedOutstandingCosts(ctx)} linkLabel={link} />
        <KpiCard compact title={resolveLanguageKey("totalUnitCostDocuments")} value={unitCostDocsCount.toLocaleString()} subtitle={resolveLanguageKey("totalUnitCostDocumentsShortDesc")} icon={Receipt} href={kpi.kpiTotalUnitCostDocuments(ctx)} linkLabel={link} />
      </div>

      <div className="min-h-dvh flex flex-col" style={{marginTop: "30px"}}>
        <h3 className="text-xs font-medium mb-2 shrink-0">{resolveLanguageKey("unitsList")}</h3>
        <div className="min-h-0 flex-1 flex flex-col">
          <AllUnits showHeader={false}/>
        </div>
      </div>
    </div>
  );
}

export default compose(
  withLanguage("src/modules/propertyManagement/clients/panel/private/overview/units/index.tsx")
)(UnitsTab);
