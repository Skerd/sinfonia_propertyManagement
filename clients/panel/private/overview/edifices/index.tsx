import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { compose } from "redux";
import type { DashboardFormResponseType } from "armonia/src/modules/propertyManagement/api/realEstate/private/dashboard/dashboard.form.response.type.ts";
import type { Edifice } from "armonia/src/modules/propertyManagement/api/realEstate/private/edifice/edifice.dto.ts";
import { ActionException } from "armonia/src/modules/core/types";
import apiClient from "@coreModule/helpers/axiosClients/apiClient.ts";
import { DashboardEdificeCard } from "@propertyManagementModule/components/custom/dashboard/edificeCard.tsx";
import { Building2, Layers, Package, CalendarClock, TrendingUp, Ban } from "lucide-react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {ErrorView} from "@coreModule/components/custom/errorView.tsx";
import Loader from "@coreModule/components/custom/loader.tsx";
import {KpiCard} from "@coreModule/components/custom/kpiCard.tsx";
import {TableResponse} from "armonia/src/modules/core/types/shared.types.ts";
import type {KpiDrillDownContext} from "@propertyManagementModule/helpers/dashboard/kpiDrillDown.ts";
import * as kpi from "@propertyManagementModule/helpers/dashboard/kpiDrillDown.ts";

type EdificesTabProps = WithLanguageType & {
  dashboardData: DashboardFormResponseType | null | undefined;
  loading: boolean;
  error: ActionException | null;
  onRefresh: () => void;
  drillDownContext: KpiDrillDownContext;
  viewEntriesLabel: string;
};

function EdificesTab({ resolveLanguageKey, dashboardData, loading, error, onRefresh, drillDownContext, viewEntriesLabel }: EdificesTabProps) {
  const navigate = useNavigate();
  const [edifices, setEdifices] = useState<Edifice[]>([]);
  const [edificesLoading, setEdificesLoading] = useState(true);
  const [edificesError, setEdificesError] = useState<ActionException | null>(null);
  const [selectedEdificeId, setSelectedEdificeId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setEdificesLoading(true);
    setEdificesError(null);
    apiClient
      .post<TableResponse<Edifice>>("/api/realEstate/edifice", { offset: 0, limit: 1000 })
      .then((res) => {
        if (!cancelled && res.data?.data) setEdifices(res.data.data);
      })
      .catch((err) => {
        if (!cancelled) setEdificesError(err?.response?.data ?? { message: "Failed to load edifices" });
      })
      .finally(() => {
        if (!cancelled) setEdificesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);
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
  const totalEdifices = summary?.totalEdifices ?? 0;
  const totalFloors = summary?.totalFloors ?? 0;
  const totalUnits = summary?.totalUnits ?? 0;
  const available = summary?.unitsByStatus?.available ?? 0;
  const reserved = summary?.unitsByStatus?.reserved ?? 0;
  const sold = summary?.unitsByStatus?.sold ?? 0;
  const unavailable = summary?.unitsByStatus?.unavailable ?? 0;
  const avgFloorsPerEdifice = totalEdifices > 0 ? (totalFloors / totalEdifices).toFixed(1) : "0";
  const avgUnitsPerEdifice = totalEdifices > 0 ? (totalUnits / totalEdifices).toFixed(1) : "0";

  const ctx = drillDownContext;
  const link = viewEntriesLabel;

  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-sm font-semibold mb-1">{resolveLanguageKey("title")}</h2>
        <p className="text-muted-foreground text-xs">{resolveLanguageKey("description")}</p>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        <KpiCard compact title={resolveLanguageKey("totalEdifices")} value={totalEdifices.toLocaleString()} subtitle={resolveLanguageKey("totalEdificesDesc")} icon={Building2} href={kpi.kpiTotalEdifices(ctx)} linkLabel={link} />
        <KpiCard compact title={resolveLanguageKey("totalFloors")} value={totalFloors.toLocaleString()} subtitle={resolveLanguageKey("totalFloorsDesc")} icon={Layers} href={kpi.kpiTotalFloors(ctx)} linkLabel={link} />
        <KpiCard compact title={resolveLanguageKey("totalUnits")} value={totalUnits.toLocaleString()} subtitle={resolveLanguageKey("totalUnitsDesc")} icon={Layers} href={kpi.kpiUnitsTotal(ctx)} linkLabel={link} />
        <KpiCard compact title={resolveLanguageKey("avgFloorsPerEdifice")} value={avgFloorsPerEdifice} subtitle={resolveLanguageKey("avgFloorsPerEdificeDesc")} icon={Building2} href={kpi.kpiTotalFloors(ctx)} linkLabel={link} />
        <KpiCard compact title={resolveLanguageKey("avgUnitsPerEdifice")} value={avgUnitsPerEdifice} subtitle={resolveLanguageKey("avgUnitsPerEdificeDesc")} icon={Layers} href={kpi.kpiUnitsTotal(ctx)} linkLabel={link} />
      </div>

      <div>
        <h3 className="text-xs font-medium mb-2">{resolveLanguageKey("unitsByStatus")}</h3>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard compact title={resolveLanguageKey("available")} value={available.toLocaleString()} icon={Package} href={kpi.kpiUnitsAvailable(ctx)} linkLabel={link} />
          <KpiCard compact title={resolveLanguageKey("reserved")} value={reserved.toLocaleString()} icon={CalendarClock} variant="warning" href={kpi.kpiUnitsReserved(ctx)} linkLabel={link} />
          <KpiCard compact title={resolveLanguageKey("sold")} value={sold.toLocaleString()} icon={TrendingUp} variant="success" href={kpi.kpiUnitsSold(ctx)} linkLabel={link} />
          <KpiCard compact title={resolveLanguageKey("unavailable")} value={unavailable.toLocaleString()} icon={Ban} variant="danger" href={kpi.kpiUnitsUnavailable(ctx)} linkLabel={link} />
        </div>
      </div>

      <div>
        <h3 className="text-xs font-medium mb-2">{resolveLanguageKey("edificeCards")}</h3>
        {edificesLoading ? (
          <Loader />
        ) : edificesError ? (
          <p className="text-muted-foreground text-xs">{resolveLanguageKey("failDescription")}</p>
        ) : (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {edifices.map((edifice) => (
              <DashboardEdificeCard
                key={edifice._id}
                edifice={edifice}
                isSelected={selectedEdificeId === edifice._id}
                onClick={() => {
                  setSelectedEdificeId(edifice._id);
                  const params = new URLSearchParams();
                  params.set("edificeId", edifice._id);
                  if (edifice.name) params.set("edificeName", edifice.name);
                  navigate(`/realEstate/units?${params.toString()}`);
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default compose(
  withLanguage("src/modules/propertyManagement/clients/panel/private/overview/edifices/index.tsx")
)(EdificesTab);
